package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"server/config"
	"server/models"
)

func generateAPIKey() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return "ps_live_" + hex.EncodeToString(bytes)
}

type CreateAgentInput struct {
	Name                string   `json:"name" binding:"required"`
	Description         string   `json:"description"`
	RequestedTxnLimit   float64  `json:"requested_txn_limit"`
	RequestedDailyLimit float64  `json:"requested_daily_limit"`
	Capabilities        []string `json:"capabilities"`
}

// DeveloperCreateAgent handles POST /api/v1/developer/agents
func DeveloperCreateAgent(c *gin.Context) {
	devIDVal, exists := c.Get("userID")
	if !exists {
		RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Developer authentication context missing")
		return
	}
	developerID := devIDVal.(uint)

	var input CreateAgentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}

	apiKey := generateAPIKey()

	agent := models.Agent{
		Name:        input.Name,
		Description: input.Description,
		DeveloperID: developerID,
		APIKey:      apiKey,
		Status:      models.AgentStatusActive,
	}

	if err := config.DB.Create(&agent).Error; err != nil {
		RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to create agent: "+err.Error())
		return
	}

	// Create requested permissions
	if input.RequestedTxnLimit > 0 {
		config.DB.Create(&models.AgentPermission{
			AgentID:        agent.ID,
			PermissionType: "MAX_TRANSACTION_LIMIT",
			RequestedValue: fmt.Sprintf("%.2f", input.RequestedTxnLimit),
		})
	}
	if input.RequestedDailyLimit > 0 {
		config.DB.Create(&models.AgentPermission{
			AgentID:        agent.ID,
			PermissionType: "DAILY_LIMIT",
			RequestedValue: fmt.Sprintf("%.2f", input.RequestedDailyLimit),
		})
	}
	for _, cap := range input.Capabilities {
		config.DB.Create(&models.AgentPermission{
			AgentID:        agent.ID,
			PermissionType: "CAPABILITY",
			RequestedValue: cap,
		})
	}

	// Audit Log
	config.DB.Create(&models.AuditLog{
		UserID:  developerID,
		AgentID: agent.ID,
		Action:  "AGENT_CREATED",
		Result:  "SUCCESS",
		Reason:  fmt.Sprintf("Developer created agent %s", agent.Name),
	})

	RespondSuccess(c, http.StatusCreated, agent)
}

// DeveloperListAgents handles GET /api/v1/developer/agents
func DeveloperListAgents(c *gin.Context) {
	devIDVal, _ := c.Get("userID")
	developerID := devIDVal.(uint)

	var agents []models.Agent
	if err := config.DB.Where("developer_id = ?", developerID).Preload("Permissions").Find(&agents).Error; err != nil {
		RespondError(c, http.StatusInternalServerError, "DB_ERROR", err.Error())
		return
	}

	RespondSuccess(c, http.StatusOK, agents)
}

// DeveloperGetAgent handles GET /api/v1/developer/agents/:id
func DeveloperGetAgent(c *gin.Context) {
	devIDVal, _ := c.Get("userID")
	developerID := devIDVal.(uint)
	agentIDStr := c.Param("id")

	var agent models.Agent
	if err := config.DB.Where("id = ? AND developer_id = ?", agentIDStr, developerID).Preload("Permissions").First(&agent).Error; err != nil {
		RespondError(c, http.StatusNotFound, "NOT_FOUND", "Agent not found or access denied")
		return
	}

	RespondSuccess(c, http.StatusOK, agent)
}

// DeveloperUpdateAgent handles PATCH /api/v1/developer/agents/:id
func DeveloperUpdateAgent(c *gin.Context) {
	devIDVal, _ := c.Get("userID")
	developerID := devIDVal.(uint)
	agentIDStr := c.Param("id")

	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}

	var agent models.Agent
	if err := config.DB.Where("id = ? AND developer_id = ?", agentIDStr, developerID).First(&agent).Error; err != nil {
		RespondError(c, http.StatusNotFound, "NOT_FOUND", "Agent not found")
		return
	}

	if input.Name != "" {
		agent.Name = input.Name
	}
	if input.Description != "" {
		agent.Description = input.Description
	}

	config.DB.Save(&agent)
	RespondSuccess(c, http.StatusOK, agent)
}

// DeveloperDeleteAgent handles DELETE /api/v1/developer/agents/:id
func DeveloperDeleteAgent(c *gin.Context) {
	devIDVal, _ := c.Get("userID")
	developerID := devIDVal.(uint)
	agentIDStr := c.Param("id")

	var agent models.Agent
	if err := config.DB.Where("id = ? AND developer_id = ?", agentIDStr, developerID).First(&agent).Error; err != nil {
		RespondError(c, http.StatusNotFound, "NOT_FOUND", "Agent not found")
		return
	}

	agent.Status = models.AgentStatusRevoked
	config.DB.Save(&agent)
	config.DB.Delete(&agent)

	RespondSuccess(c, http.StatusOK, gin.H{"message": "Agent revoked and deleted"})
}

type AuthorizeAgentInput struct {
	MaxTransactionAmount float64  `json:"max_transaction_amount"`
	DailyLimit           float64  `json:"daily_limit"`
	ApprovalThreshold    float64  `json:"approval_threshold"`
	AllowedCategories    []string `json:"allowed_categories"`
	BlockedCategories    []string `json:"blocked_categories"`
	UnknownMerchantAction string  `json:"unknown_merchant_action"`
}

// UserAuthorizeAgent handles POST /api/v1/user/agents/:id/authorize
func UserAuthorizeAgent(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)
	agentIDStr := c.Param("id")
	agentID, err := strconv.ParseUint(agentIDStr, 10, 32)
	if err != nil {
		RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid agent ID")
		return
	}

	var input AuthorizeAgentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}

	if input.MaxTransactionAmount < 0 || input.DailyLimit < 0 || input.ApprovalThreshold < 0 {
		RespondError(c, http.StatusBadRequest, "INVALID_POLICY_LIMITS", "Transaction limits cannot be negative")
		return
	}

	var agent models.Agent
	if err := config.DB.First(&agent, uint(agentID)).Error; err != nil {
		RespondError(c, http.StatusNotFound, "NOT_FOUND", "Agent not found")
		return
	}

	// Create or Update AgentAuthorization
	var auth models.AgentAuthorization
	if err := config.DB.Where("agent_id = ? AND user_id = ?", agent.ID, userID).First(&auth).Error; err != nil {
		auth = models.AgentAuthorization{
			AgentID:      agent.ID,
			UserID:       userID,
			Status:       models.AuthorizationStatusAuthorized,
			AuthorizedAt: time.Now(),
		}
		config.DB.Create(&auth)
	} else {
		auth.Status = models.AuthorizationStatusAuthorized
		auth.AuthorizedAt = time.Now()
		auth.RevokedAt = nil
		config.DB.Save(&auth)
	}

	// Create or Update AgentPolicy
	maxPaise := int64(300000)
	if input.MaxTransactionAmount > 0 {
		maxPaise = int64(input.MaxTransactionAmount * 100)
	}
	dailyPaise := int64(700000)
	if input.DailyLimit > 0 {
		dailyPaise = int64(input.DailyLimit * 100)
	}
	threshPaise := int64(200000)
	if input.ApprovalThreshold > 0 {
		threshPaise = int64(input.ApprovalThreshold * 100)
	}
	unknownAction := "ask_approval"
	if input.UnknownMerchantAction != "" {
		unknownAction = input.UnknownMerchantAction
	}

	var policy models.AgentPolicy
	if err := config.DB.Where("agent_id = ? AND user_id = ?", agent.ID, userID).First(&policy).Error; err != nil {
		policy = models.AgentPolicy{
			AgentID:                agent.ID,
			UserID:                 userID,
			MaxTransactionPaise:   maxPaise,
			DailyLimitPaise:       dailyPaise,
			ApprovalThresholdPaise: threshPaise,
			UnknownMerchantAction:  unknownAction,
		}
		config.DB.Create(&policy)
	} else {
		policy.MaxTransactionPaise = maxPaise
		policy.DailyLimitPaise = dailyPaise
		policy.ApprovalThresholdPaise = threshPaise
		policy.UnknownMerchantAction = unknownAction
		config.DB.Save(&policy)
	}

	// Save Category Rules
	config.DB.Where("agent_id = ? AND user_id = ?", agent.ID, userID).Delete(&models.AgentCategoryPolicy{})
	for _, cat := range input.AllowedCategories {
		config.DB.Create(&models.AgentCategoryPolicy{
			AgentID:  agent.ID,
			UserID:   userID,
			Category: cat,
			Allowed:  true,
		})
	}
	for _, cat := range input.BlockedCategories {
		config.DB.Create(&models.AgentCategoryPolicy{
			AgentID:  agent.ID,
			UserID:   userID,
			Category: cat,
			Allowed:  false,
		})
	}

	config.DB.Create(&models.AuditLog{
		UserID:  userID,
		AgentID: agent.ID,
		Action:  "AGENT_AUTHORIZED",
		Result:  "SUCCESS",
		Reason:  fmt.Sprintf("User authorized agent %s with single cap ₹%.2f", agent.Name, float64(maxPaise)/100.0),
	})

	RespondSuccess(c, http.StatusOK, gin.H{
		"authorization": auth,
		"policy":        policy,
	})
}

// UserListAgents handles GET /api/v1/user/agents
func UserListAgents(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	var agents []models.Agent
	if err := config.DB.Preload("Developer").Preload("Policies", "user_id = ?", userID).Preload("Authorizations", "user_id = ?", userID).Find(&agents).Error; err != nil {
		RespondError(c, http.StatusInternalServerError, "DB_ERROR", err.Error())
		return
	}

	// Calculate today's spent per agent from DB
	todayStr := time.Now().Format("2006-01-02")
	type AgentResponse struct {
		models.Agent
		SpentTodayPaise int64 `json:"spent_today_paise"`
		IsAuthorized    bool  `json:"is_authorized"`
	}

	var responseList []AgentResponse
	for _, ag := range agents {
		var spentPaise int64
		config.DB.Model(&models.PaymentRequest{}).
			Where("agent_id = ? AND user_id = ? AND status = ? AND DATE(created_at) = ?", ag.ID, userID, models.DecisionAllowed, todayStr).
			Select("COALESCE(SUM(amount_paise), 0)").
			Scan(&spentPaise)

		isAuth := len(ag.Authorizations) > 0 && ag.Authorizations[0].Status == models.AuthorizationStatusAuthorized

		responseList = append(responseList, AgentResponse{
			Agent:           ag,
			SpentTodayPaise: spentPaise,
			IsAuthorized:    isAuth,
		})
	}

	RespondSuccess(c, http.StatusOK, responseList)
}

// UserGetAgent handles GET /api/v1/user/agents/:id
func UserGetAgent(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)
	agentIDStr := c.Param("id")

	var agent models.Agent
	if err := config.DB.Preload("Developer").Preload("Policies", "user_id = ?", userID).First(&agent, agentIDStr).Error; err != nil {
		RespondError(c, http.StatusNotFound, "NOT_FOUND", "Agent not found")
		return
	}

	RespondSuccess(c, http.StatusOK, agent)
}

// UserUpdatePolicy handles PATCH /api/v1/user/agents/:id/policy
func UserUpdatePolicy(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)
	agentIDStr := c.Param("id")

	var input AuthorizeAgentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}

	if input.MaxTransactionAmount < 0 || input.DailyLimit < 0 || input.ApprovalThreshold < 0 {
		RespondError(c, http.StatusBadRequest, "INVALID_LIMITS", "Limits cannot be negative")
		return
	}

	var policy models.AgentPolicy
	if err := config.DB.Where("agent_id = ? AND user_id = ?", agentIDStr, userID).First(&policy).Error; err != nil {
		RespondError(c, http.StatusNotFound, "NOT_FOUND", "Policy not found for this agent")
		return
	}

	if input.MaxTransactionAmount > 0 {
		policy.MaxTransactionPaise = int64(input.MaxTransactionAmount * 100)
	}
	if input.DailyLimit > 0 {
		policy.DailyLimitPaise = int64(input.DailyLimit * 100)
	}
	if input.ApprovalThreshold > 0 {
		policy.ApprovalThresholdPaise = int64(input.ApprovalThreshold * 100)
	}
	if input.UnknownMerchantAction != "" {
		policy.UnknownMerchantAction = input.UnknownMerchantAction
	}

	config.DB.Save(&policy)

	// Update Category Policies
	if len(input.AllowedCategories) > 0 || len(input.BlockedCategories) > 0 {
		config.DB.Where("agent_id = ? AND user_id = ?", agentIDStr, userID).Delete(&models.AgentCategoryPolicy{})
		for _, cat := range input.AllowedCategories {
			config.DB.Create(&models.AgentCategoryPolicy{
				AgentID:  policy.AgentID,
				UserID:   userID,
				Category: cat,
				Allowed:  true,
			})
		}
		for _, cat := range input.BlockedCategories {
			config.DB.Create(&models.AgentCategoryPolicy{
				AgentID:  policy.AgentID,
				UserID:   userID,
				Category: cat,
				Allowed:  false,
			})
		}
	}

	config.DB.Create(&models.AuditLog{
		UserID:  userID,
		AgentID: policy.AgentID,
		Action:  "POLICY_UPDATED",
		Result:  "SUCCESS",
		Reason:  fmt.Sprintf("User updated policy limits (Single: ₹%.2f, Daily: ₹%.2f)", float64(policy.MaxTransactionPaise)/100.0, float64(policy.DailyLimitPaise)/100.0),
	})

	RespondSuccess(c, http.StatusOK, policy)
}

// UserUpdateAgentStatus handles PATCH /api/v1/user/agents/:id/status
func UserUpdateAgentStatus(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)
	agentIDStr := c.Param("id")

	var input struct {
		Status models.AgentStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}

	var agent models.Agent
	if err := config.DB.First(&agent, agentIDStr).Error; err != nil {
		RespondError(c, http.StatusNotFound, "NOT_FOUND", "Agent not found")
		return
	}

	agent.Status = input.Status
	config.DB.Save(&agent)

	config.DB.Create(&models.AuditLog{
		UserID:  userID,
		AgentID: agent.ID,
		Action:  fmt.Sprintf("AGENT_%s", input.Status),
		Result:  "SUCCESS",
		Reason:  fmt.Sprintf("User changed agent status to %s", input.Status),
	})

	RespondSuccess(c, http.StatusOK, agent)
}
