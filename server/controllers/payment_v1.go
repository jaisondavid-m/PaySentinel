package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"server/config"
	"server/models"
	"server/services"
)

type PaymentRequestInput struct {
	AgentID     uint    `json:"agent_id" binding:"required"`
	UserID      uint    `json:"user_id"`
	Merchant    string  `json:"merchant" binding:"required"`
	AmountPaise int64   `json:"amount_paise"`
	Amount      float64 `json:"amount"` // Fallback support if sent as rupees
	Currency    string  `json:"currency"`
	Category    string  `json:"category" binding:"required"`
	Description string  `json:"description"`
}

// AgentPaymentRequest handles POST /api/v1/agent/payment-requests
func AgentPaymentRequest(c *gin.Context) {
	var input PaymentRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}

	// Support both amount_paise and float amount
	amountPaise := input.AmountPaise
	if amountPaise <= 0 && input.Amount > 0 {
		amountPaise = int64(input.Amount * 100)
	}

	if amountPaise <= 0 {
		RespondError(c, http.StatusBadRequest, "INVALID_AMOUNT", "Payment amount must be greater than zero")
		return
	}

	if input.Currency == "" {
		input.Currency = "INR"
	}

	decisionService := services.NewPaymentDecisionService(config.DB)
	result, err := decisionService.EvaluatePayment(services.EvaluateRequestInput{
		AgentID:     input.AgentID,
		UserID:      input.UserID,
		Merchant:    input.Merchant,
		AmountPaise: amountPaise,
		Currency:    input.Currency,
		Category:    input.Category,
		Description: input.Description,
	})

	if err != nil {
		RespondError(c, http.StatusInternalServerError, "EVALUATION_ERROR", err.Error())
		return
	}

	RespondSuccess(c, http.StatusOK, result)
}

// UserGetApprovals handles GET /api/v1/user/approvals
func UserGetApprovals(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	var approvals []models.Approval
	if err := config.DB.Where("user_id = ? AND status = ?", userID, "PENDING").
		Preload("PaymentRequest.Agent.Developer").
		Order("created_at desc").
		Find(&approvals).Error; err != nil {
		RespondError(c, http.StatusInternalServerError, "DB_ERROR", err.Error())
		return
	}

	RespondSuccess(c, http.StatusOK, approvals)
}

// UserApproveRequest handles POST /api/v1/user/approvals/:id/approve
func UserApproveRequest(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)
	approvalIDStr := c.Param("id")
	approvalID, err := strconv.ParseUint(approvalIDStr, 10, 32)
	if err != nil {
		RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid approval ID")
		return
	}

	decisionService := services.NewPaymentDecisionService(config.DB)
	res, err := decisionService.ResolveApproval(uint(approvalID), userID, true)
	if err != nil {
		RespondError(c, http.StatusBadRequest, "APPROVAL_ERROR", err.Error())
		return
	}

	RespondSuccess(c, http.StatusOK, res)
}

// UserRejectRequest handles POST /api/v1/user/approvals/:id/reject
func UserRejectRequest(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)
	approvalIDStr := c.Param("id")
	approvalID, err := strconv.ParseUint(approvalIDStr, 10, 32)
	if err != nil {
		RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid approval ID")
		return
	}

	decisionService := services.NewPaymentDecisionService(config.DB)
	res, err := decisionService.ResolveApproval(uint(approvalID), userID, false)
	if err != nil {
		RespondError(c, http.StatusBadRequest, "REJECTION_ERROR", err.Error())
		return
	}

	RespondSuccess(c, http.StatusOK, res)
}

// UserGetTransactions handles GET /api/v1/user/transactions
func UserGetTransactions(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	status := c.Query("status")
	agentIDStr := c.Query("agent_id")
	category := c.Query("category")
	fromDate := c.Query("from")
	toDate := c.Query("to")

	query := config.DB.Where("user_id = ?", userID).Preload("Agent.Developer")

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if agentIDStr != "" {
		query = query.Where("agent_id = ?", agentIDStr)
	}
	if category != "" {
		query = query.Where("LOWER(category) = ?", category)
	}
	if fromDate != "" {
		query = query.Where("created_at >= ?", fromDate)
	}
	if toDate != "" {
		query = query.Where("created_at <= ?", toDate)
	}

	var txns []models.PaymentRequest
	if err := query.Order("created_at desc").Find(&txns).Error; err != nil {
		RespondError(c, http.StatusInternalServerError, "DB_ERROR", err.Error())
		return
	}

	RespondSuccess(c, http.StatusOK, txns)
}

// UserGetTransactionDetail handles GET /api/v1/user/transactions/:id
func UserGetTransactionDetail(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)
	txnIDStr := c.Param("id")

	var txn models.PaymentRequest
	if err := config.DB.Where("id = ? AND user_id = ?", txnIDStr, userID).Preload("Agent.Developer").First(&txn).Error; err != nil {
		RespondError(c, http.StatusNotFound, "NOT_FOUND", "Transaction detail not found")
		return
	}

	RespondSuccess(c, http.StatusOK, txn)
}

// UserGetDashboard handles GET /api/v1/user/dashboard
func UserGetDashboard(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	todayStr := time.Now().Format("2006-01-02")

	// Calculate Today's Spent in Paise
	var spentTodayPaise int64
	config.DB.Model(&models.PaymentRequest{}).
		Where("user_id = ? AND status = ? AND DATE(created_at) = ?", userID, models.DecisionAllowed, todayStr).
		Select("COALESCE(SUM(amount_paise), 0)").
		Scan(&spentTodayPaise)

	// Active Agents
	var activeAgents int64
	config.DB.Model(&models.Agent{}).
		Where("status = ?", models.AgentStatusActive).
		Count(&activeAgents)

	// Pending Approvals
	var pendingApprovals int64
	config.DB.Model(&models.Approval{}).
		Where("user_id = ? AND status = ?", userID, "PENDING").
		Count(&pendingApprovals)

	// Today's Blocked Transactions
	var blockedCount int64
	config.DB.Model(&models.PaymentRequest{}).
		Where("user_id = ? AND status = ? AND DATE(created_at) = ?", userID, models.DecisionBlocked, todayStr).
		Count(&blockedCount)

	// Today's Allowed Transactions
	var allowedCount int64
	config.DB.Model(&models.PaymentRequest{}).
		Where("user_id = ? AND status = ? AND DATE(created_at) = ?", userID, models.DecisionAllowed, todayStr).
		Count(&allowedCount)

	// Recent Transactions
	var recentTxns []models.PaymentRequest
	config.DB.Where("user_id = ?", userID).Preload("Agent").Order("created_at desc").Limit(5).Find(&recentTxns)

	// Overall Daily Limit (Default ₹7,000 = 700000 paise)
	var dailyLimitPaise int64 = 700000
	var userPolicy models.AgentPolicy
	if err := config.DB.Where("user_id = ?", userID).Order("created_at desc").First(&userPolicy).Error; err == nil {
		dailyLimitPaise = userPolicy.DailyLimitPaise
	}

	remainingAllowancePaise := dailyLimitPaise - spentTodayPaise
	if remainingAllowancePaise < 0 {
		remainingAllowancePaise = 0
	}

	RespondSuccess(c, http.StatusOK, gin.H{
		"active_agents":             activeAgents,
		"spent_today_paise":         spentTodayPaise,
		"spent_today":               float64(spentTodayPaise) / 100.0,
		"daily_limit_paise":         dailyLimitPaise,
		"daily_limit":               float64(dailyLimitPaise) / 100.0,
		"remaining_allowance_paise": remainingAllowancePaise,
		"remaining_allowance":       float64(remainingAllowancePaise) / 100.0,
		"pending_approvals":         pendingApprovals,
		"blocked_count":             blockedCount,
		"allowed_count":             allowedCount,
		"recent_transactions":       recentTxns,
		"protected_balance":         float64(dailyLimitPaise*5) / 100.0,
	})
}

// DeveloperGetDashboard handles GET /api/v1/developer/dashboard
func DeveloperGetDashboard(c *gin.Context) {
	devIDVal, _ := c.Get("userID")
	developerID := devIDVal.(uint)

	var activeAgents int64
	config.DB.Model(&models.Agent{}).Where("developer_id = ? AND status = ?", developerID, models.AgentStatusActive).Count(&activeAgents)

	var totalRequests int64
	config.DB.Model(&models.PaymentRequest{}).
		Joins("JOIN agents ON agents.id = payment_requests.agent_id").
		Where("agents.developer_id = ?", developerID).
		Count(&totalRequests)

	var allowedRequests int64
	config.DB.Model(&models.PaymentRequest{}).
		Joins("JOIN agents ON agents.id = payment_requests.agent_id").
		Where("agents.developer_id = ? AND payment_requests.status = ?", developerID, models.DecisionAllowed).
		Count(&allowedRequests)

	var blockedRequests int64
	config.DB.Model(&models.PaymentRequest{}).
		Joins("JOIN agents ON agents.id = payment_requests.agent_id").
		Where("agents.developer_id = ? AND payment_requests.status = ?", developerID, models.DecisionBlocked).
		Count(&blockedRequests)

	var approvalRequiredRequests int64
	config.DB.Model(&models.PaymentRequest{}).
		Joins("JOIN agents ON agents.id = payment_requests.agent_id").
		Where("agents.developer_id = ? AND payment_requests.status = ?", developerID, models.DecisionApprovalRequired).
		Count(&approvalRequiredRequests)

	RespondSuccess(c, http.StatusOK, gin.H{
		"active_agents":     activeAgents,
		"total_requests":    totalRequests,
		"allowed_requests":  allowedRequests,
		"blocked_requests":  blockedRequests,
		"approval_required": approvalRequiredRequests,
	})
}

// UserGetAuditLogs handles GET /api/v1/user/audit-logs
func UserGetAuditLogs(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	var auditLogs []models.AuditLog
	if err := config.DB.Where("user_id = ?", userID).Order("created_at desc").Limit(100).Find(&auditLogs).Error; err != nil {
		RespondError(c, http.StatusInternalServerError, "DB_ERROR", err.Error())
		return
	}

	RespondSuccess(c, http.StatusOK, auditLogs)
}
