package models

import (
	"time"

	"gorm.io/gorm"
)

type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusSuccess   PaymentStatus = "success"
	PaymentStatusFailed    PaymentStatus = "failed"
)

type Payment struct {
	ID          uint          `gorm:"primaryKey" json:"id"`
	AgentID     uint          `gorm:"not null;index" json:"agent_id"`
	Agent       Agent         `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
	UserID      uint          `gorm:"not null;index" json:"user_id"`
	User        User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Amount      float64       `gorm:"type:decimal(12,2);not null" json:"amount"`
	Currency    string        `gorm:"type:varchar(10);default:'INR'" json:"currency"`
	Status      PaymentStatus `gorm:"type:varchar(20);default:'pending'" json:"status"`
	TxnHash     string        `gorm:"type:varchar(255)" json:"txn_hash"`
	ReferenceID string        `gorm:"type:varchar(100);uniqueIndex" json:"reference_id"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
