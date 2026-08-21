package models

import (
	"time"

	"gorm.io/gorm"
)

type AgentStatus string

const (
	AgentStatusActive   AgentStatus = "active"
	AgentStatusInactive AgentStatus = "inactive"
)

type Agent struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"type:varchar(150);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	APIKey      string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"api_key"`
	WebhookURL  string         `gorm:"type:varchar(255)" json:"webhook_url"`
	DeveloperID uint           `gorm:"not null;index" json:"developer_id"`
	Developer   User           `gorm:"foreignKey:DeveloperID" json:"developer,omitempty"`
	Status      AgentStatus    `gorm:"type:varchar(20);default:'active'" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
