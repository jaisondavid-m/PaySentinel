package models

import (
	"time"

	"gorm.io/gorm"
)

type AgentStatus string

const (
	AgentStatusActive  AgentStatus = "ACTIVE"
	AgentStatusPaused  AgentStatus = "PAUSED"
	AgentStatusRevoked AgentStatus = "REVOKED"
)

type DecisionStatus string

const (
	DecisionAllowed          DecisionStatus = "ALLOWED"
	DecisionApprovalRequired DecisionStatus = "APPROVAL_REQUIRED"
	DecisionBlocked          DecisionStatus = "BLOCKED"
	DecisionRejected         DecisionStatus = "REJECTED"
)

// Agent represents an AI payment agent created by a developer
type Agent struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"type:varchar(150);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	DeveloperID uint           `gorm:"not null;index" json:"developer_id"`
	Developer   User           `gorm:"foreignKey:DeveloperID;references:ID;constraint:fk_agent_dev_user,OnDelete:CASCADE;" json:"developer,omitempty"`
	APIKey      string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"api_key"`
	Status      AgentStatus    `gorm:"type:varchar(20);default:'ACTIVE';not null" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Permissions []AgentPermission `gorm:"foreignKey:AgentID;references:ID;constraint:fk_agent_perm_agent,OnDelete:CASCADE;" json:"permissions,omitempty"`
	Policies    []AgentPolicy     `gorm:"foreignKey:AgentID;references:ID;constraint:fk_agent_pol_agent,OnDelete:CASCADE;" json:"policies,omitempty"`
}

// AgentPermission represents developer-requested capabilities
type AgentPermission struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	AgentID        uint      `gorm:"not null;index" json:"agent_id"`
	PermissionType string    `gorm:"type:varchar(100);not null" json:"permission_type"`
	RequestedValue string    `gorm:"type:varchar(255);not null" json:"requested_value"`
	CreatedAt      time.Time `json:"created_at"`
}

// AgentPolicy represents user-authorized financial policies for an agent
type AgentPolicy struct {
	ID                         uint      `gorm:"primaryKey" json:"id"`
	AgentID                    uint      `gorm:"not null;index" json:"agent_id"`
	UserID                     uint      `gorm:"not null;index" json:"user_id"`
	MaxTransactionAmount       float64   `gorm:"type:decimal(12,2);default:3000.00;not null" json:"max_transaction_amount"`
	DailyLimit                 float64   `gorm:"type:decimal(12,2);default:7000.00;not null" json:"daily_limit"`
	ApprovalThreshold          float64   `gorm:"type:decimal(12,2);default:2000.00;not null" json:"approval_threshold"`
	UnknownMerchantAction      string    `gorm:"type:varchar(50);default:'ask_approval';not null" json:"unknown_merchant_action"`
	SuspiciousTransactionAction string   `gorm:"type:varchar(50);default:'block';not null" json:"suspicious_transaction_action"`
	CreatedAt                  time.Time `json:"created_at"`
	UpdatedAt                  time.Time `json:"updated_at"`

	Categories []AgentCategory `gorm:"foreignKey:AgentID;references:AgentID;constraint:fk_pol_categories" json:"categories,omitempty"`
	Merchants  []AgentMerchant  `gorm:"foreignKey:AgentID;references:AgentID;constraint:fk_pol_merchants" json:"merchants,omitempty"`
}

// AgentCategory represents allowed or blocked category rules
type AgentCategory struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	AgentID   uint      `gorm:"not null;index" json:"agent_id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	Category  string    `gorm:"type:varchar(100);not null" json:"category"`
	Allowed   bool      `gorm:"default:true;not null" json:"allowed"`
	CreatedAt time.Time `json:"created_at"`
}

// AgentMerchant represents merchant rules
type AgentMerchant struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	AgentID   uint      `gorm:"not null;index" json:"agent_id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	Merchant  string    `gorm:"type:varchar(150);not null" json:"merchant"`
	Allowed   bool      `gorm:"default:true;not null" json:"allowed"`
	CreatedAt time.Time `json:"created_at"`
}

// PaymentRequest represents an agent payment execution request evaluated by PaySentinel
type PaymentRequest struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	AgentID        uint           `gorm:"not null;index" json:"agent_id"`
	Agent          Agent          `gorm:"foreignKey:AgentID;references:ID;constraint:fk_pr_agent_id,OnDelete:CASCADE;" json:"agent,omitempty"`
	UserID         uint           `gorm:"not null;index" json:"user_id"`
	User           User           `gorm:"foreignKey:UserID;references:ID;constraint:fk_pr_user_id,OnDelete:CASCADE;" json:"user,omitempty"`
	Merchant       string         `gorm:"type:varchar(150);not null" json:"merchant"`
	Amount         float64        `gorm:"type:decimal(12,2);not null" json:"amount"`
	Currency       string         `gorm:"type:varchar(10);default:'INR';not null" json:"currency"`
	Category       string         `gorm:"type:varchar(100);not null" json:"category"`
	Description    string         `gorm:"type:text" json:"description"`
	Status         DecisionStatus `gorm:"type:varchar(30);not null" json:"status"`
	DecisionReason string         `gorm:"type:text" json:"decision_reason"`
	PolicyEnforced string         `gorm:"type:varchar(255)" json:"policy_enforced"`
	RiskScore      float64        `gorm:"type:decimal(5,2);default:0.00" json:"risk_score"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
}

// Approval represents a human approval request queue item
type Approval struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	PaymentRequestID uint           `gorm:"not null;uniqueIndex" json:"payment_request_id"`
	PaymentRequest   PaymentRequest `gorm:"foreignKey:PaymentRequestID;references:ID;constraint:fk_appr_pay_req,OnDelete:CASCADE;" json:"payment_request,omitempty"`
	UserID           uint           `gorm:"not null;index" json:"user_id"`
	Status           string         `gorm:"type:varchar(20);default:'PENDING';not null" json:"status"`
	ReviewedAt       *time.Time     `json:"reviewed_at,omitempty"`
	CreatedAt        time.Time      `json:"created_at"`
}

// AuditLog represents complete security decision trace logs
type AuditLog struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	UserID           uint      `gorm:"not null;index" json:"user_id"`
	AgentID          uint      `gorm:"not null;index" json:"agent_id"`
	PaymentRequestID *uint     `gorm:"index" json:"payment_request_id,omitempty"`
	Action           string    `gorm:"type:varchar(100);not null" json:"action"`
	Result           string    `gorm:"type:varchar(50);not null" json:"result"`
	Reason           string    `gorm:"type:text" json:"reason"`
	Metadata         string    `gorm:"type:text" json:"metadata"`
	CreatedAt        time.Time `json:"created_at"`
}
