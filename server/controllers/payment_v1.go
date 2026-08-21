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

// AgentPaymentRequest handles POST /api/v1/agent/payment-requests
func AgentPaymentRequest(c *gin.Context) {
	var input services.EvaluateRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid payload: "+err.Error())
		return
	}

	decisionService := services.NewPaymentDecisionService(config.DB)
	result, err := decisionService.EvaluatePayment(input)
	if err != nil {
		RespondError(c, http.StatusInternalServerError, "EVALUATION_ERROR", err.Error())
		return
	}

	if result.Decision == models.DecisionBlocked {
		RespondError(c, http.StatusBadRequest, result.ErrorCode, result.Reason)
		return
	}

	RespondSuccess(c, http.StatusOK, result)
}

// UserGetApprovals handles GET /api/v1/user/approvals
func UserGetApprovals(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	var approvals []models.Approval
	config.DB.Where("user_id = ? AND status = 'PENDING'", userID).Preload("PaymentRequest").Preload("PaymentRequest.Agent").Find(&approvals)

	RespondSuccess(c, http.StatusOK, approvals)
}

// UserApproveRequest handles POST /api/v1/user/approvals/:id/approve
func UserApproveRequest(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)
	idStr := c.Param("id")
	approvalID, _ := strconv.Atoi(idStr)

	decisionService := services.NewPaymentDecisionService(config.DB)
	paymentReq, err := decisionService.ResolveApproval(uint(approvalID), userID, true)
	if err != nil {
		if err.Error() == "APPROVAL_ALREADY_PROCESSED" {
			RespondError(c, http.StatusConflict, "APPROVAL_ALREADY_PROCESSED", "This approval request has already been processed.")
			return
		}
		if err.Error() == "UNAUTHORIZED_APPROVAL_ACCESS" {
			RespondError(c, http.StatusForbidden, "FORBIDDEN", "You do not own this approval request.")
			return
		}
		RespondError(c, http.StatusBadRequest, "APPROVAL_FAILED", err.Error())
		return
	}

	RespondSuccess(c, http.StatusOK, paymentReq)
}

// UserRejectRequest handles POST /api/v1/user/approvals/:id/reject
func UserRejectRequest(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)
	idStr := c.Param("id")
	approvalID, _ := strconv.Atoi(idStr)

	decisionService := services.NewPaymentDecisionService(config.DB)
	paymentReq, err := decisionService.ResolveApproval(uint(approvalID), userID, false)
	if err != nil {
		RespondError(c, http.StatusBadRequest, "REJECTION_FAILED", err.Error())
		return
	}

	RespondSuccess(c, http.StatusOK, paymentReq)
}

// UserGetTransactions handles GET /api/v1/user/transactions
func UserGetTransactions(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	statusFilter := c.Query("status")
	agentFilter := c.Query("agent_id")
	categoryFilter := c.Query("category")

	query := config.DB.Where("user_id = ?", userID).Preload("Agent")

	if statusFilter != "" {
		query = query.Where("status = ?", statusFilter)
	}
	if agentFilter != "" {
		query = query.Where("agent_id = ?", agentFilter)
	}
	if categoryFilter != "" {
		query = query.Where("category = ?", categoryFilter)
	}

	var transactions []models.PaymentRequest
	query.Order("created_at desc").Find(&transactions)

	RespondSuccess(c, http.StatusOK, transactions)
}

// UserGetTransactionDetail handles GET /api/v1/user/transactions/:id
func UserGetTransactionDetail(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var txn models.PaymentRequest
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).Preload("Agent").Preload("User").First(&txn).Error; err != nil {
		RespondError(c, http.StatusNotFound, "TRANSACTION_NOT_FOUND", "Transaction detail not found")
		return
	}

	RespondSuccess(c, http.StatusOK, txn)
}

// UserGetAuditLogs handles GET /api/v1/user/audit-logs
func UserGetAuditLogs(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	var auditLogs []models.AuditLog
	config.DB.Where("user_id = ?", userID).Order("created_at desc").Limit(50).Find(&auditLogs)

	RespondSuccess(c, http.StatusOK, auditLogs)
}

// UserGetDashboard handles GET /api/v1/user/dashboard
func UserGetDashboard(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	now := time.Now()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	var activeAgents int64
	config.DB.Model(&models.Agent{}).Where("status = 'ACTIVE'").Count(&activeAgents)

	var spentToday float64
	config.DB.Model(&models.PaymentRequest{}).
		Where("user_id = ? AND status = ? AND created_at >= ?", userID, models.DecisionAllowed, startOfDay).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&spentToday)

	var pendingApprovals int64
	config.DB.Model(&models.Approval{}).Where("user_id = ? AND status = 'PENDING'", userID).Count(&pendingApprovals)

	var blockedToday int64
	config.DB.Model(&models.PaymentRequest{}).
		Where("user_id = ? AND status = ? AND created_at >= ?", userID, models.DecisionBlocked, startOfDay).
		Count(&blockedToday)

	var recentTransactions []models.PaymentRequest
	config.DB.Where("user_id = ?", userID).Preload("Agent").Order("created_at desc").Limit(5).Find(&recentTransactions)

	RespondSuccess(c, http.StatusOK, gin.H{
		"protected_balance": 25000.00,
		"active_agents":    activeAgents,
		"spent_today":      spentToday,
		"daily_limit":      7000.00,
		"pending_approvals": pendingApprovals,
		"blocked_today":     blockedToday,
		"recent_decisions":  recentTransactions,
	})
}

// DeveloperGetDashboard handles GET /api/v1/developer/dashboard
func DeveloperGetDashboard(c *gin.Context) {
	devIDVal, _ := c.Get("userID")
	devID := devIDVal.(uint)

	now := time.Now()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	var devAgentIDs []uint
	config.DB.Model(&models.Agent{}).Where("developer_id = ?", devID).Pluck("id", &devAgentIDs)

	var totalAgents int64
	config.DB.Model(&models.Agent{}).Where("developer_id = ?", devID).Count(&totalAgents)

	var totalRequestsToday int64
	var allowedToday int64
	var blockedToday int64

	if len(devAgentIDs) > 0 {
		config.DB.Model(&models.PaymentRequest{}).Where("agent_id IN ? AND created_at >= ?", devAgentIDs, startOfDay).Count(&totalRequestsToday)
		config.DB.Model(&models.PaymentRequest{}).Where("agent_id IN ? AND status = ? AND created_at >= ?", devAgentIDs, models.DecisionAllowed, startOfDay).Count(&allowedToday)
		config.DB.Model(&models.PaymentRequest{}).Where("agent_id IN ? AND status = ? AND created_at >= ?", devAgentIDs, models.DecisionBlocked, startOfDay).Count(&blockedToday)
	}

	approvalRate := 100.0
	if totalRequestsToday > 0 {
		approvalRate = (float64(allowedToday) / float64(totalRequestsToday)) * 100.0
	}

	RespondSuccess(c, http.StatusOK, gin.H{
		"active_agents":        totalAgents,
		"payment_requests_today": totalRequestsToday,
		"allowed_today":        allowedToday,
		"blocked_today":        blockedToday,
		"approval_rate":        approvalRate,
	})
}
