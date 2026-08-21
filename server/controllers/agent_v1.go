package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"server/config"
	"server/models"
)

func generateAPIKey() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return "ps_live_sec_" + hex.EncodeToString(bytes)
}

// DeveloperCreateAgent handles POST /api/v1/developer/agents
func DeveloperCreateAgent(c *gin.Context) {
	devIDVal, exists := c.Get("userID")
	if !exists {
		RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User authentication context missing")
		return
	}
	devID := devIDVal.(uint)

	var input struct {
		Name                 string  `json:"name" binding:"required"`
		Description          string  `json:"description"`
		RequestedTxnLimit    float64 `json:"requested_txn_limit"`
		RequestedDailyLimit  float64 `json:"requested_daily_limit"`
		AllowedCategories    []string `json:"allowed_categories"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid payload: "+err.Error())
		return
	}

	agent := models.Agent{
		Name:        input.Name,
		Description: input.Description,
		DeveloperID: devID,
		APIKey:      generateAPIKey(),
		Status:      models.AgentStatusActive,
	}

	if err := config.DB.Create(&agent).Error; err != nil {
		RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to create agent: "+err.Error())
		return
	}

	// Record Developer Requested Permissions
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

	// Create Default User Policy (Default safe caps for prototype)
	policy := models.AgentPolicy{
		AgentID:              agent.ID,
		UserID:               devID,
		MaxTransactionAmount: 3000.00,
		DailyLimit:          7000.00,
		ApprovalThreshold:   2000.00,
	}
	config.DB.Create(&policy)

	RespondSuccess(c, http.StatusCreated, agent)
}

// DeveloperListAgents handles GET /api/v1/developer/agents
func DeveloperListAgents(c *gin.Context) {
	devIDVal, _ := c.Get("userID")
	devID := devIDVal.(uint)

	var agents []models.Agent
	config.DB.Where("developer_id = ?", devID).Preload("Permissions").Preload("Policies").Find(&agents)

	RespondSuccess(c, http.StatusOK, agents)
}

// DeveloperGetAgent handles GET /api/v1/developer/agents/:id
func DeveloperGetAgent(c *gin.Context) {
	devIDVal, _ := c.Get("userID")
	devID := devIDVal.(uint)
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var agent models.Agent
	if err := config.DB.Where("id = ? AND developer_id = ?", id, devID).Preload("Permissions").Preload("Policies").First(&agent).Error; err != nil {
		RespondError(c, http.StatusNotFound, "AGENT_NOT_FOUND", "Agent not found or unauthorized access")
		return
	}

	RespondSuccess(c, http.StatusOK, agent)
}

// DeveloperUpdateAgent handles PATCH /api/v1/developer/agents/:id
func DeveloperUpdateAgent(c *gin.Context) {
	devIDVal, _ := c.Get("userID")
	devID := devIDVal.(uint)
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var agent models.Agent
	if err := config.DB.Where("id = ? AND developer_id = ?", id, devID).First(&agent).Error; err != nil {
		RespondError(c, http.StatusForbidden, "UNAUTHORIZED_AGENT_ACCESS", "Cannot update agent belonging to another developer")
		return
	}

	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&input); err == nil {
		if input.Name != "" {
			agent.Name = input.Name
		}
		if input.Description != "" {
			agent.Description = input.Description
		}
		config.DB.Save(&agent)
	}

	RespondSuccess(c, http.StatusOK, agent)
}

// DeveloperDeleteAgent handles DELETE /api/v1/developer/agents/:id
func DeveloperDeleteAgent(c *gin.Context) {
	devIDVal, _ := c.Get("userID")
	devID := devIDVal.(uint)
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var agent models.Agent
	if err := config.DB.Where("id = ? AND developer_id = ?", id, devID).First(&agent).Error; err != nil {
		RespondError(c, http.StatusForbidden, "UNAUTHORIZED_AGENT_ACCESS", "Cannot delete agent belonging to another developer")
		return
	}

	agent.Status = models.AgentStatusRevoked
	config.DB.Save(&agent)

	RespondSuccess(c, http.StatusOK, gin.H{"message": "Agent revoked successfully"})
}

// UserListAgents handles GET /api/v1/user/agents
func UserListAgents(c *gin.Context) {
	var agents []models.Agent
	config.DB.Preload("Permissions").Preload("Policies").Find(&agents)

	RespondSuccess(c, http.StatusOK, agents)
}

// UserGetAgent handles GET /api/v1/user/agents/:id
func UserGetAgent(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var agent models.Agent
	if err := config.DB.Preload("Permissions").Preload("Policies").First(&agent, id).Error; err != nil {
		RespondError(c, http.StatusNotFound, "AGENT_NOT_FOUND", "Agent not found")
		return
	}

	RespondSuccess(c, http.StatusOK, agent)
}

// UserUpdatePolicy handles PATCH /api/v1/user/agents/:id/policy
func UserUpdatePolicy(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)
	idStr := c.Param("id")
	agentID, _ := strconv.Atoi(idStr)

	var input struct {
		MaxTransactionAmount       float64  `json:"max_transaction_amount"`
		DailyLimit                 float64  `json:"daily_limit"`
		ApprovalThreshold          float64  `json:"approval_threshold"`
		UnknownMerchantAction      string   `json:"unknown_merchant_action"`
		SuspiciousTransactionAction string  `json:"suspicious_transaction_action"`
		AllowedCategories          []string `json:"allowed_categories"`
		BlockedCategories          []string `json:"blocked_categories"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}

	var policy models.AgentPolicy
	err := config.DB.Where("agent_id = ?", agentID).First(&policy).Error
	if err == gorm.ErrRecordNotFound {
		policy = models.AgentPolicy{
			AgentID: uint(agentID),
			UserID:  userID,
		}
	}

	if input.MaxTransactionAmount > 0 {
		policy.MaxTransactionAmount = input.MaxTransactionAmount
	}
	if input.DailyLimit > 0 {
		policy.DailyLimit = input.DailyLimit
	}
	if input.ApprovalThreshold > 0 {
		policy.ApprovalThreshold = input.ApprovalThreshold
	}
	if input.UnknownMerchantAction != "" {
		policy.UnknownMerchantAction = input.UnknownMerchantAction
	}
	if input.SuspiciousTransactionAction != "" {
		policy.SuspiciousTransactionAction = input.SuspiciousTransactionAction
	}

	config.DB.Save(&policy)

	// Save Category Rules
	if len(input.AllowedCategories) > 0 || len(input.BlockedCategories) > 0 {
		config.DB.Where("agent_id = ?", agentID).Delete(&models.AgentCategory{})
		for _, cat := range input.AllowedCategories {
			config.DB.Create(&models.AgentCategory{
				AgentID:  uint(agentID),
				UserID:   userID,
				Category: cat,
				Allowed:  true,
			})
		}
		for _, cat := range input.BlockedCategories {
			config.DB.Create(&models.AgentCategory{
				AgentID:  uint(agentID),
				UserID:   userID,
				Category: cat,
				Allowed:  false,
			})
		}
	}

	RespondSuccess(c, http.StatusOK, policy)
}

// UserUpdateAgentStatus handles PATCH /api/v1/user/agents/:id/status
func UserUpdateAgentStatus(c *gin.Context) {
	idStr := c.Param("id")
	agentID, _ := strconv.Atoi(idStr)

	var input struct {
		Status string `json:"status" binding:"required"` // ACTIVE, PAUSED, REVOKED
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		RespondError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
		return
	}

	var agent models.Agent
	if err := config.DB.First(&agent, agentID).Error; err != nil {
		RespondError(c, http.StatusNotFound, "AGENT_NOT_FOUND", "Agent not found")
		return
	}

	agent.Status = models.AgentStatus(input.Status)
	config.DB.Save(&agent)

	RespondSuccess(c, http.StatusOK, gin.H{"id": agent.ID, "status": agent.Status})
}
