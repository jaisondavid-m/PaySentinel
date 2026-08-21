package services

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"gorm.io/gorm"

	"server/models"
)

type PaymentDecisionService struct {
	db *gorm.DB
}

func NewPaymentDecisionService(db *gorm.DB) *PaymentDecisionService {
	return &PaymentDecisionService{db: db}
}

type EvaluateRequestInput struct {
	AgentID     uint   `json:"agent_id"`
	UserID      uint   `json:"user_id"`
	Merchant    string `json:"merchant"`
	AmountPaise int64  `json:"amount_paise"`
	Currency    string `json:"currency"`
	Category    string `json:"category"`
	Description string `json:"description"`
}

type EvaluateResult struct {
	Decision       models.DecisionStatus `json:"decision"`
	Reason         string                `json:"reason"`
	ErrorCode      string                `json:"error_code,omitempty"`
	PolicyEnforced string                `json:"policy_enforced"`
	PaymentRequest *models.PaymentRequest `json:"payment_request"`
	Approval       *models.Approval       `json:"approval,omitempty"`
}

// EvaluatePayment evaluates an incoming payment request through the 10-step security decision engine
func (s *PaymentDecisionService) EvaluatePayment(input EvaluateRequestInput) (*EvaluateResult, error) {
	if s.db == nil {
		return nil, fmt.Errorf("database connection is not available")
	}

	// Step 1: Resolve Agent
	var agent models.Agent
	if err := s.db.Preload("Permissions").First(&agent, input.AgentID).Error; err != nil {
		return nil, fmt.Errorf("agent not found: %v", err)
	}

	// Rule 1 & 2: Check Agent Status
	if agent.Status == models.AgentStatusRevoked {
		return s.createBlockedResult(&agent, agent.DeveloperID, input, "Agent has been revoked by the user.", "AGENT_REVOKED", "Agent Status: REVOKED")
	}
	if agent.Status == models.AgentStatusPaused {
		return s.createBlockedResult(&agent, agent.DeveloperID, input, "Agent is currently paused by the user.", "AGENT_PAUSED", "Agent Status: PAUSED")
	}

	// Step 2: Find Authorized User & Active Authorization
	var userID uint
	if input.UserID > 0 {
		var auth models.AgentAuthorization
		if err := s.db.Where("agent_id = ? AND user_id = ? AND status = ?", agent.ID, input.UserID, models.AuthorizationStatusAuthorized).First(&auth).Error; err != nil {
			return s.createBlockedResult(&agent, input.UserID, input, "Agent is not authorized by the specified user.", "UNAUTHORIZED_AGENT", "Authorization Status: NOT_AUTHORIZED")
		}
		userID = auth.UserID
	} else {
		var auth models.AgentAuthorization
		if err := s.db.Where("agent_id = ? AND status = ?", agent.ID, models.AuthorizationStatusAuthorized).First(&auth).Error; err != nil {
			userID = agent.DeveloperID
		} else {
			userID = auth.UserID
		}
	}

	// Step 3: Load User Policy
	var policy models.AgentPolicy
	if err := s.db.Where("agent_id = ? AND user_id = ?", agent.ID, userID).First(&policy).Error; err != nil {
		// Set sensible default policy (Max ₹3000 = 300000 paise, Daily ₹7000 = 700000 paise, Threshold ₹2000 = 200000 paise)
		policy = models.AgentPolicy{
			AgentID:                agent.ID,
			UserID:                 userID,
			MaxTransactionPaise:   300000,
			DailyLimitPaise:       700000,
			ApprovalThresholdPaise: 200000,
			UnknownMerchantAction:  "ask_approval",
		}
	}

	// Step 4: Parse Developer Requested Max Transaction Limit & Daily Cap
	var devMaxPaise int64 = 1000000 // default ₹10,000 max if unspecified
	var devDailyPaise int64 = 5000000
	for _, perm := range agent.Permissions {
		if perm.PermissionType == "MAX_TRANSACTION_LIMIT" || perm.PermissionType == "max_transaction_amount" {
			if val, err := strconv.ParseFloat(perm.RequestedValue, 64); err == nil {
				devMaxPaise = int64(val * 100)
			}
		}
		if perm.PermissionType == "DAILY_LIMIT" || perm.PermissionType == "daily_limit" {
			if val, err := strconv.ParseFloat(perm.RequestedValue, 64); err == nil {
				devDailyPaise = int64(val * 100)
			}
		}
	}

	// Rule 3: Enforce Effective Limit = MIN(dev_requested, user_authorized)
	effectiveMaxPaise := policy.MaxTransactionPaise
	if devMaxPaise < effectiveMaxPaise {
		effectiveMaxPaise = devMaxPaise
	}

	if input.AmountPaise > effectiveMaxPaise {
		reason := fmt.Sprintf("Transaction amount (₹%.2f) exceeds authorized maximum transaction limit of ₹%.2f.", float64(input.AmountPaise)/100.0, float64(effectiveMaxPaise)/100.0)
		enforced := fmt.Sprintf("Effective Max Cap: ₹%.2f", float64(effectiveMaxPaise)/100.0)
		return s.createBlockedResult(&agent, userID, input, reason, "POLICY_LIMIT_EXCEEDED", enforced)
	}

	// Rule 4: Check Today's Real Server-Side Daily Spending
	var todaySpentPaise int64
	todayStr := time.Now().Format("2006-01-02")
	s.db.Model(&models.PaymentRequest{}).
		Where("user_id = ? AND status IN (?, ?) AND DATE(created_at) = ?", userID, models.DecisionAllowed, models.DecisionApprovalRequired, todayStr).
		Select("COALESCE(SUM(amount_paise), 0)").
		Scan(&todaySpentPaise)

	effectiveDailyPaise := policy.DailyLimitPaise
	if devDailyPaise < effectiveDailyPaise {
		effectiveDailyPaise = devDailyPaise
	}

	if todaySpentPaise+input.AmountPaise > effectiveDailyPaise {
		reason := fmt.Sprintf("Transaction of ₹%.2f would exceed daily spending limit of ₹%.2f (Spent Today: ₹%.2f).", float64(input.AmountPaise)/100.0, float64(effectiveDailyPaise)/100.0, float64(todaySpentPaise)/100.0)
		enforced := fmt.Sprintf("Daily Limit Cap: ₹%.2f", float64(effectiveDailyPaise)/100.0)
		return s.createBlockedResult(&agent, userID, input, reason, "DAILY_LIMIT_EXCEEDED", enforced)
	}

	// Rule 5 & 6: Check Category Policy
	var catPolicy models.AgentCategoryPolicy
	if err := s.db.Where("agent_id = ? AND user_id = ? AND LOWER(category) = ?", agent.ID, userID, fmt.Sprintf("%v", input.Category)).First(&catPolicy).Error; err == nil {
		if !catPolicy.Allowed {
			reason := fmt.Sprintf("Category '%s' is explicitly blocked under user security policy.", input.Category)
			enforced := fmt.Sprintf("Blocked Category Rule (%s)", input.Category)
			return s.createBlockedResult(&agent, userID, input, reason, "CATEGORY_BLOCKED", enforced)
		}
	}

	// Rule 7 & 8: Check Merchant Policy
	var merPolicy models.AgentMerchantPolicy
	if err := s.db.Where("agent_id = ? AND user_id = ? AND LOWER(merchant) = ?", agent.ID, userID, fmt.Sprintf("%v", input.Merchant)).First(&merPolicy).Error; err == nil {
		if !merPolicy.Allowed {
			reason := fmt.Sprintf("Merchant '%s' is explicitly blocked under user security policy.", input.Merchant)
			enforced := fmt.Sprintf("Blocked Merchant Rule (%s)", input.Merchant)
			return s.createBlockedResult(&agent, userID, input, reason, "MERCHANT_BLOCKED", enforced)
		}
	} else if policy.UnknownMerchantAction == "block" {
		reason := fmt.Sprintf("Merchant '%s' is not verified and policy blocks unknown merchants.", input.Merchant)
		return s.createBlockedResult(&agent, userID, input, reason, "UNKNOWN_MERCHANT_BLOCKED", "Unknown Merchant Action: BLOCK")
	}

	// Rule 9: Check Human Approval Threshold
	if input.AmountPaise > policy.ApprovalThresholdPaise {
		reason := fmt.Sprintf("Amount (₹%.2f) exceeds automatic approval threshold of ₹%.2f. Human verification required.", float64(input.AmountPaise)/100.0, float64(policy.ApprovalThresholdPaise)/100.0)
		enforced := fmt.Sprintf("Human Approval Threshold: > ₹%.2f", float64(policy.ApprovalThresholdPaise)/100.0)
		return s.createApprovalRequiredResult(&agent, userID, input, reason, enforced)
	}

	// Rule 10: Decision -> ALLOWED
	reason := "Transaction is within user authorized daily spending limit and purchase cap."
	enforced := fmt.Sprintf("Max Cap: ₹%.2f | Daily Cap: ₹%.2f", float64(effectiveMaxPaise)/100.0, float64(effectiveDailyPaise)/100.0)
	return s.createAllowedResult(&agent, userID, input, reason, enforced)
}

// Helper: Create BLOCKED Record
func (s *PaymentDecisionService) createBlockedResult(agent *models.Agent, userID uint, input EvaluateRequestInput, reason string, errCode string, policyEnforced string) (*EvaluateResult, error) {
	pr := models.PaymentRequest{
		AgentID:        agent.ID,
		UserID:         userID,
		Merchant:       input.Merchant,
		AmountPaise:    input.AmountPaise,
		Amount:         float64(input.AmountPaise) / 100.0,
		Currency:       input.Currency,
		Category:       input.Category,
		Description:    input.Description,
		Status:         models.DecisionBlocked,
		DecisionReason: reason,
		PolicyEnforced: policyEnforced,
		RiskScore:      85.00,
	}

	if err := s.db.Create(&pr).Error; err != nil {
		return nil, fmt.Errorf("failed to store payment request: %v", err)
	}

	s.logAudit(userID, agent.ID, &pr.ID, "PAYMENT_BLOCKED", "BLOCKED", reason, policyEnforced)

	return &EvaluateResult{
		Decision:       models.DecisionBlocked,
		Reason:         reason,
		ErrorCode:      errCode,
		PolicyEnforced: policyEnforced,
		PaymentRequest: &pr,
	}, nil
}

// Helper: Create APPROVAL_REQUIRED Record
func (s *PaymentDecisionService) createApprovalRequiredResult(agent *models.Agent, userID uint, input EvaluateRequestInput, reason string, policyEnforced string) (*EvaluateResult, error) {
	pr := models.PaymentRequest{
		AgentID:        agent.ID,
		UserID:         userID,
		Merchant:       input.Merchant,
		AmountPaise:    input.AmountPaise,
		Amount:         float64(input.AmountPaise) / 100.0,
		Currency:       input.Currency,
		Category:       input.Category,
		Description:    input.Description,
		Status:         models.DecisionApprovalRequired,
		DecisionReason: reason,
		PolicyEnforced: policyEnforced,
		RiskScore:      45.00,
	}

	if err := s.db.Create(&pr).Error; err != nil {
		return nil, fmt.Errorf("failed to store payment request: %v", err)
	}

	approval := models.Approval{
		PaymentRequestID: pr.ID,
		UserID:           userID,
		Status:           "PENDING",
	}

	if err := s.db.Create(&approval).Error; err != nil {
		return nil, fmt.Errorf("failed to create approval item: %v", err)
	}

	s.logAudit(userID, agent.ID, &pr.ID, "APPROVAL_CREATED", "PENDING", reason, policyEnforced)

	return &EvaluateResult{
		Decision:       models.DecisionApprovalRequired,
		Reason:         reason,
		PolicyEnforced: policyEnforced,
		PaymentRequest: &pr,
		Approval:       &approval,
	}, nil
}

// Helper: Create ALLOWED Record
func (s *PaymentDecisionService) createAllowedResult(agent *models.Agent, userID uint, input EvaluateRequestInput, reason string, policyEnforced string) (*EvaluateResult, error) {
	pr := models.PaymentRequest{
		AgentID:        agent.ID,
		UserID:         userID,
		Merchant:       input.Merchant,
		AmountPaise:    input.AmountPaise,
		Amount:         float64(input.AmountPaise) / 100.0,
		Currency:       input.Currency,
		Category:       input.Category,
		Description:    input.Description,
		Status:         models.DecisionAllowed,
		DecisionReason: reason,
		PolicyEnforced: policyEnforced,
		RiskScore:      10.00,
	}

	if err := s.db.Create(&pr).Error; err != nil {
		return nil, fmt.Errorf("failed to store payment request: %v", err)
	}

	s.logAudit(userID, agent.ID, &pr.ID, "PAYMENT_ALLOWED", "ALLOWED", reason, policyEnforced)

	return &EvaluateResult{
		Decision:       models.DecisionAllowed,
		Reason:         reason,
		PolicyEnforced: policyEnforced,
		PaymentRequest: &pr,
	}, nil
}

// ResolveApproval resolves pending approval with DB transaction & policy re-evaluation
func (s *PaymentDecisionService) ResolveApproval(approvalID uint, userID uint, approve bool) (*models.Approval, error) {
	var approval models.Approval

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Preload("PaymentRequest.Agent").First(&approval, approvalID).Error; err != nil {
			return fmt.Errorf("approval request not found: %v", err)
		}

		if approval.UserID != userID {
			return fmt.Errorf("unauthorized to resolve this approval")
		}

		if approval.Status != "PENDING" {
			return fmt.Errorf("approval request is already processed (Status: %s)", approval.Status)
		}

		now := time.Now()
		approval.ReviewedAt = &now

		if !approve {
			approval.Status = "REJECTED"
			if err := tx.Save(&approval).Error; err != nil {
				return err
			}

			tx.Model(&models.PaymentRequest{}).Where("id = ?", approval.PaymentRequestID).
				Updates(map[string]interface{}{
					"status":          models.DecisionRejected,
					"decision_reason": "Payment request explicitly rejected by user in approvals center.",
				})

			s.logAudit(userID, approval.PaymentRequest.AgentID, &approval.PaymentRequestID, "APPROVAL_REJECTED", "REJECTED", "User rejected payment request.", "")
			return nil
		}

		// Re-evaluate security policies before approving to prevent race conditions
		pr := approval.PaymentRequest
		if pr.Agent.Status != models.AgentStatusActive {
			approval.Status = "REJECTED"
			tx.Save(&approval)
			tx.Model(&models.PaymentRequest{}).Where("id = ?", pr.ID).Updates(map[string]interface{}{
				"status":          models.DecisionBlocked,
				"decision_reason": "Agent status changed to PAUSED/REVOKED before approval.",
			})
			return fmt.Errorf("cannot approve: Agent is no longer active")
		}

		approval.Status = "APPROVED"
		if err := tx.Save(&approval).Error; err != nil {
			return err
		}

		tx.Model(&models.PaymentRequest{}).Where("id = ?", pr.ID).Updates(map[string]interface{}{
			"status":          models.DecisionAllowed,
			"decision_reason": "Payment approved by authorized user.",
		})

		s.logAudit(userID, pr.AgentID, &pr.ID, "APPROVAL_APPROVED", "APPROVED", "User approved payment request.", "")
		return nil
	})

	if err != nil {
		return nil, err
	}

	return &approval, nil
}

// Log audit trail
func (s *PaymentDecisionService) logAudit(userID, agentID uint, prID *uint, action, result, reason, metadata string) {
	log := models.AuditLog{
		UserID:           userID,
		AgentID:          agentID,
		PaymentRequestID: prID,
		Action:           action,
		Result:           result,
		Reason:           reason,
		Metadata:         metadata,
	}
	s.db.Create(&log)
}

// Convert map to json helper string
func toJSONString(v interface{}) string {
	b, _ := json.Marshal(v)
	return string(b)
}
