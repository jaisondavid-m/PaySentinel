package services

import (
	"encoding/json"
	"fmt"
	"math"
	"strconv"
	"time"

	"gorm.io/gorm"

	"server/models"
)

type PaymentDecisionService struct {
	DB *gorm.DB
}

func NewPaymentDecisionService(db *gorm.DB) *PaymentDecisionService {
	return &PaymentDecisionService{DB: db}
}

type EvaluateRequestInput struct {
	AgentID     uint    `json:"agent_id"`
	Merchant    string  `json:"merchant"`
	Amount      float64 `json:"amount"`
	Currency    string  `json:"currency"`
	Category    string  `json:"category"`
	Description string  `json:"description"`
}

type EvaluationResult struct {
	PaymentRequest *models.PaymentRequest `json:"payment_request"`
	Approval       *models.Approval       `json:"approval,omitempty"`
	Decision       models.DecisionStatus  `json:"decision"`
	Reason         string                 `json:"reason font_bold"`
	ErrorCode      string                 `json:"error_code,omitempty"`
}

// EvaluatePayment evaluates an incoming payment request against agent status, developer requests, and user-enforced policies
func (s *PaymentDecisionService) EvaluatePayment(req EvaluateRequestInput) (*EvaluationResult, error) {
	if s.DB == nil {
		return nil, fmt.Errorf("database connection is not initialized")
	}

	if req.Amount <= 0 {
		return &EvaluationResult{
			Decision:  models.DecisionBlocked,
			Reason:    "Invalid monetary amount: Amount must be greater than zero.",
			ErrorCode: "INVALID_AMOUNT",
		}, nil
	}

	// 1. Fetch Agent
	var agent models.Agent
	if err := s.DB.Preload("Permissions").First(&agent, req.AgentID).Error; err != nil {
		return &EvaluationResult{
			Decision:  models.DecisionBlocked,
			Reason:    "Agent not found in database.",
			ErrorCode: "AGENT_NOT_FOUND",
		}, nil
	}

	// 2. Check Agent Status
	if agent.Status == models.AgentStatusRevoked {
		s.logAudit(0, agent.ID, nil, "EVALUATE_PAYMENT", "BLOCKED", "Agent is REVOKED by user", "")
		return &EvaluationResult{
			Decision:  models.DecisionBlocked,
			Reason:    "Agent has been REVOKED by the user. All payment requests are blocked.",
			ErrorCode: "AGENT_REVOKED",
		}, nil
	}

	if agent.Status == models.AgentStatusPaused {
		s.logAudit(0, agent.ID, nil, "EVALUATE_PAYMENT", "BLOCKED", "Agent is PAUSED by user", "")
		return &EvaluationResult{
			Decision:  models.DecisionBlocked,
			Reason:    "Agent is currently PAUSED by the user. All payment requests are blocked.",
			ErrorCode: "AGENT_PAUSED",
		}, nil
	}

	// 3. Load or Create User Authorized Policy
	var policy models.AgentPolicy
	err := s.DB.Where("agent_id = ?", agent.ID).First(&policy).Error
	if err == gorm.ErrRecordNotFound {
		// Create default user policy if none exists yet
		policy = models.AgentPolicy{
			AgentID:                     agent.ID,
			UserID:                      agent.DeveloperID, // fallback default user
			MaxTransactionAmount:       3000.00,
			DailyLimit:                 7000.00,
			ApprovalThreshold:          2000.00,
			UnknownMerchantAction:      "ask_approval",
			SuspiciousTransactionAction: "block",
		}
		s.DB.Create(&policy)
	}

	userID := policy.UserID
	if userID == 0 {
		userID = agent.DeveloperID
	}

	// 4. Calculate Developer Requested Limit
	devRequestedLimit := math.MaxFloat64
	for _, perm := range agent.Permissions {
		if perm.PermissionType == "MAX_TRANSACTION_LIMIT" {
			if val, err := strconv.ParseFloat(perm.RequestedValue, 64); err == nil && val > 0 {
				devRequestedLimit = val
			}
		}
	}

	// 5. Effective Single Transaction Limit = MIN(dev_requested, user_authorized)
	effectiveSingleLimit := math.Min(devRequestedLimit, policy.MaxTransactionAmount)

	// 6. Calculate Today's Spending Server-Side
	now := time.Now()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	
	var spentToday float64
	s.DB.Model(&models.PaymentRequest{}).
		Where("agent_id = ? AND status = ? AND created_at >= ?", agent.ID, models.DecisionAllowed, startOfDay).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&spentToday)

	// 7. Check Single Transaction Cap
	if req.Amount > effectiveSingleLimit {
		reason := fmt.Sprintf("Transaction exceeds the user's authorized transaction limit of ₹%.2f.", effectiveSingleLimit)
		paymentReq := &models.PaymentRequest{
			AgentID:        agent.ID,
			UserID:         userID,
			Merchant:       req.Merchant,
			Amount:         req.Amount,
			Currency:       req.Currency,
			Category:       req.Category,
			Description:    req.Description,
			Status:         models.DecisionBlocked,
			DecisionReason: reason,
			PolicyEnforced: fmt.Sprintf("Max Txn Limit: ₹%.2f", effectiveSingleLimit),
		}
		s.DB.Create(paymentReq)
		s.logAudit(userID, agent.ID, &paymentReq.ID, "PAYMENT_DECISION", "BLOCKED", reason, "POLICY_LIMIT_EXCEEDED")

		return &EvaluationResult{
			PaymentRequest: paymentReq,
			Decision:       models.DecisionBlocked,
			Reason:         reason,
			ErrorCode:      "POLICY_LIMIT_EXCEEDED",
		}, nil
	}

	// 8. Check Daily Spending Cap
	projectedDaily := spentToday + req.Amount
	if projectedDaily > policy.DailyLimit {
		reason := fmt.Sprintf("Daily spending limit exceeded. Spent today: ₹%.2f, Requested: ₹%.2f, Max Daily: ₹%.2f.", spentToday, req.Amount, policy.DailyLimit)
		paymentReq := &models.PaymentRequest{
			AgentID:        agent.ID,
			UserID:         userID,
			Merchant:       req.Merchant,
			Amount:         req.Amount,
			Currency:       req.Currency,
			Category:       req.Category,
			Description:    req.Description,
			Status:         models.DecisionBlocked,
			DecisionReason: reason,
			PolicyEnforced: fmt.Sprintf("Daily Cap: ₹%.2f", policy.DailyLimit),
		}
		s.DB.Create(paymentReq)
		s.logAudit(userID, agent.ID, &paymentReq.ID, "PAYMENT_DECISION", "BLOCKED", reason, "DAILY_LIMIT_EXCEEDED")

		return &EvaluationResult{
			PaymentRequest: paymentReq,
			Decision:       models.DecisionBlocked,
			Reason:         reason,
			ErrorCode:      "DAILY_LIMIT_EXCEEDED",
		}, nil
	}

	// 9. Check Category Rules
	var categoryRule models.AgentCategory
	if err := s.DB.Where("agent_id = ? AND LOWER(category) = ?", agent.ID, fmt.Sprintf("%v", req.Category)).First(&categoryRule).Error; err == nil {
		if !categoryRule.Allowed {
			reason := fmt.Sprintf("Category '%s' is explicitly blocked under user security policy.", req.Category)
			paymentReq := &models.PaymentRequest{
				AgentID:        agent.ID,
				UserID:         userID,
				Merchant:       req.Merchant,
				Amount:         req.Amount,
				Currency:       req.Currency,
				Category:       req.Category,
				Description:    req.Description,
				Status:         models.DecisionBlocked,
				DecisionReason: reason,
				PolicyEnforced: fmt.Sprintf("Blocked Category Rule (%s)", req.Category),
			}
			s.DB.Create(paymentReq)
			s.logAudit(userID, agent.ID, &paymentReq.ID, "PAYMENT_DECISION", "BLOCKED", reason, "CATEGORY_NOT_ALLOWED")

			return &EvaluationResult{
				PaymentRequest: paymentReq,
				Decision:       models.DecisionBlocked,
				Reason:         reason,
				ErrorCode:      "CATEGORY_NOT_ALLOWED",
			}, nil
		}
	}

	// 10. Check Merchant Rules
	var merchantRule models.AgentMerchant
	if err := s.DB.Where("agent_id = ? AND LOWER(merchant) = ?", agent.ID, fmt.Sprintf("%v", req.Merchant)).First(&merchantRule).Error; err == nil {
		if !merchantRule.Allowed {
			reason := fmt.Sprintf("Merchant '%s' is explicitly blocked under user security policy.", req.Merchant)
			paymentReq := &models.PaymentRequest{
				AgentID:        agent.ID,
				UserID:         userID,
				Merchant:       req.Merchant,
				Amount:         req.Amount,
				Currency:       req.Currency,
				Category:       req.Category,
				Description:    req.Description,
				Status:         models.DecisionBlocked,
				DecisionReason: reason,
				PolicyEnforced: fmt.Sprintf("Blocked Merchant Rule (%s)", req.Merchant),
			}
			s.DB.Create(paymentReq)
			s.logAudit(userID, agent.ID, &paymentReq.ID, "PAYMENT_DECISION", "BLOCKED", reason, "MERCHANT_NOT_ALLOWED")

			return &EvaluationResult{
				PaymentRequest: paymentReq,
				Decision:       models.DecisionBlocked,
				Reason:         reason,
				ErrorCode:      "MERCHANT_NOT_ALLOWED",
			}, nil
		}
	}

	// 11. Evaluate Approval Threshold
	if req.Amount > policy.ApprovalThreshold {
		reason := fmt.Sprintf("Amount (₹%.2f) exceeds automatic approval threshold (₹%.2f). Human verification required.", req.Amount, policy.ApprovalThreshold)
		paymentReq := &models.PaymentRequest{
			AgentID:        agent.ID,
			UserID:         userID,
			Merchant:       req.Merchant,
			Amount:         req.Amount,
			Currency:       req.Currency,
			Category:       req.Category,
			Description:    req.Description,
			Status:         models.DecisionApprovalRequired,
			DecisionReason: reason,
			PolicyEnforced: fmt.Sprintf("Human Approval > ₹%.2f", policy.ApprovalThreshold),
		}
		s.DB.Create(paymentReq)

		approval := &models.Approval{
			PaymentRequestID: paymentReq.ID,
			UserID:           userID,
			Status:           "PENDING",
		}
		s.DB.Create(approval)

		s.logAudit(userID, agent.ID, &paymentReq.ID, "PAYMENT_DECISION", "APPROVAL_REQUIRED", reason, "APPROVAL_REQUIRED")

		return &EvaluationResult{
			PaymentRequest: paymentReq,
			Approval:       approval,
			Decision:       models.DecisionApprovalRequired,
			Reason:         reason,
			ErrorCode:      "APPROVAL_REQUIRED",
		}, nil
	}

	// 12. ALLOWED
	reason := "Transaction is within the user's authorized policy."
	paymentReq := &models.PaymentRequest{
		AgentID:        agent.ID,
		UserID:         userID,
		Merchant:       req.Merchant,
		Amount:         req.Amount,
		Currency:       req.Currency,
		Category:       req.Category,
		Description:    req.Description,
		Status:         models.DecisionAllowed,
		DecisionReason: reason,
		PolicyEnforced: fmt.Sprintf("User Limit: ₹%.2f | Daily Cap: ₹%.2f", effectiveSingleLimit, policy.DailyLimit),
	}
	s.DB.Create(paymentReq)
	s.logAudit(userID, agent.ID, &paymentReq.ID, "PAYMENT_DECISION", "ALLOWED", reason, "")

	return &EvaluationResult{
		PaymentRequest: paymentReq,
		Decision:       models.DecisionAllowed,
		Reason:         reason,
	}, nil
}

// ResolveApproval re-evaluates an approval request upon user action (Approve or Reject)
func (s *PaymentDecisionService) ResolveApproval(approvalID uint, userID uint, approve bool) (*models.PaymentRequest, error) {
	var approval models.Approval
	if err := s.DB.Preload("PaymentRequest").First(&approval, approvalID).Error; err != nil {
		return nil, fmt.Errorf("APPROVAL_NOT_FOUND")
	}

	// Verify Ownership
	if approval.UserID != userID {
		return nil, fmt.Errorf("UNAUTHORIZED_APPROVAL_ACCESS")
	}

	// Prevent duplicate approval processing
	if approval.Status != "PENDING" {
		return nil, fmt.Errorf("APPROVAL_ALREADY_PROCESSED")
	}

	now := time.Now()
	approval.ReviewedAt = &now

	if !approve {
		approval.Status = "REJECTED"
		s.DB.Save(&approval)

		approval.PaymentRequest.Status = models.DecisionRejected
		approval.PaymentRequest.DecisionReason = "Payment request explicitly REJECTED by account owner."
		s.DB.Save(&approval.PaymentRequest)

		s.logAudit(userID, approval.PaymentRequest.AgentID, &approval.PaymentRequest.ID, "APPROVAL_RESOLVE", "REJECTED", "Human user rejected payment", "")
		return &approval.PaymentRequest, nil
	}

	// Re-check policy & agent status before finalizing approval (Prevent race condition / policy change issue)
	var agent models.Agent
	if err := s.DB.First(&agent, approval.PaymentRequest.AgentID).Error; err != nil || agent.Status != models.AgentStatusActive {
		approval.Status = "REJECTED"
		s.DB.Save(&approval)
		approval.PaymentRequest.Status = models.DecisionBlocked
		approval.PaymentRequest.DecisionReason = "Agent status changed or paused prior to approval."
		s.DB.Save(&approval.PaymentRequest)
		return &approval.PaymentRequest, nil
	}

	approval.Status = "APPROVED"
	s.DB.Save(&approval)

	approval.PaymentRequest.Status = models.DecisionAllowed
	approval.PaymentRequest.DecisionReason = "Human user explicitly APPROVED pending payment request."
	s.DB.Save(&approval.PaymentRequest)

	s.logAudit(userID, approval.PaymentRequest.AgentID, &approval.PaymentRequest.ID, "APPROVAL_RESOLVE", "APPROVED", "Human user approved payment", "")
	return &approval.PaymentRequest, nil
}

func (s *PaymentDecisionService) logAudit(userID, agentID uint, prID *uint, action, result, reason, code string) {
	metaMap := map[string]string{"code": code}
	metaBytes, _ := json.Marshal(metaMap)

	audit := models.AuditLog{
		UserID:           userID,
		AgentID:          agentID,
		PaymentRequestID: prID,
		Action:           action,
		Result:           result,
		Reason:           reason,
		Metadata:         string(metaBytes),
	}
	s.DB.Create(&audit)
}
