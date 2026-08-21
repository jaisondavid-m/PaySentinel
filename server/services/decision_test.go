package services

import (
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"server/models"
)

func setupTestDB(t *testing.T) *gorm.DB {
	godotenv.Load("../.env")
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "127.0.0.1"
	}
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "3306"
	}
	user := os.Getenv("DB_USER")
	if user == "" {
		user = "root"
	}
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "paysentinel"
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", user, password, host, port, dbname)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Skipf("Skipping integration DB tests because MySQL server is unavailable: %v", err)
		return nil
	}

	// AutoMigrate test entities
	db.AutoMigrate(
		&models.User{},
		&models.Agent{},
		&models.AgentPermission{},
		&models.AgentAuthorization{},
		&models.AgentPolicy{},
		&models.AgentCategoryPolicy{},
		&models.AgentMerchantPolicy{},
		&models.PaymentRequest{},
		&models.Approval{},
		&models.AuditLog{},
	)

	return db
}

// 1. Transaction below limit -> ALLOWED
func TestPaymentDecision_BelowLimit_Allowed(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	service := NewPaymentDecisionService(db)
	res, err := service.EvaluatePayment(EvaluateRequestInput{
		AgentID:     1,
		Merchant:    "Amazon",
		AmountPaise: 129900, // ₹1,299.00
		Currency:    "INR",
		Category:    "Electronics",
		Description: "Wireless Mouse",
	})

	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if res.Decision != models.DecisionAllowed {
		t.Errorf("Expected ALLOWED, got %s. Reason: %s", res.Decision, res.Reason)
	}
}

// 2. Transaction above limit -> BLOCKED
func TestPaymentDecision_AboveLimit_Blocked(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	service := NewPaymentDecisionService(db)
	res, err := service.EvaluatePayment(EvaluateRequestInput{
		AgentID:     1,
		Merchant:    "Unknown Store",
		AmountPaise: 450000, // ₹4,500.00 (Exceeds max user limit ₹3,000.00)
		Currency:    "INR",
		Category:    "Electronics",
		Description: "Bulk Gadgets",
	})

	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if res.Decision != models.DecisionBlocked {
		t.Errorf("Expected BLOCKED, got %s", res.Decision)
	}
	if res.ErrorCode != "POLICY_LIMIT_EXCEEDED" {
		t.Errorf("Expected code POLICY_LIMIT_EXCEEDED, got %s", res.ErrorCode)
	}
}

// 3. Transaction above approval threshold -> APPROVAL_REQUIRED
func TestPaymentDecision_AboveThreshold_ApprovalRequired(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	service := NewPaymentDecisionService(db)
	res, err := service.EvaluatePayment(EvaluateRequestInput{
		AgentID:     1,
		Merchant:    "Amazon",
		AmountPaise: 250000, // ₹2,500.00 (Exceeds approval threshold ₹2,000 but <= ₹3,000 cap)
		Currency:    "INR",
		Category:    "Electronics",
		Description: "Laptop Stand",
	})

	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if res.Decision != models.DecisionApprovalRequired {
		t.Errorf("Expected APPROVAL_REQUIRED, got %s", res.Decision)
	}
}

// 4. Developer requested ₹10,000 but user authorized ₹3,000 -> Effective limit ₹3,000
func TestPaymentDecision_DevVsUserEffectiveLimit(t *testing.T) {
	db := setupTestDB(t)
	if db == nil {
		return
	}

	// Create test agent with dev requested limit ₹10,000
	agent := models.Agent{
		Name:        "Dev Limit Test Agent",
		Description: "Testing requested vs authorized limit",
		DeveloperID: 1,
		APIKey:      fmt.Sprintf("test_key_%d", time.Now().UnixNano()),
		Status:      models.AgentStatusActive,
	}
	db.Create(&agent)

	db.Create(&models.AgentPermission{
		AgentID:        agent.ID,
		PermissionType: "MAX_TRANSACTION_LIMIT",
		RequestedValue: "10000.00",
	})

	// User authorizes max ₹3,000 (300000 paise)
	db.Create(&models.AgentPolicy{
		AgentID:                agent.ID,
		UserID:                 1,
		MaxTransactionPaise:   300000,
		DailyLimitPaise:       700000,
		ApprovalThresholdPaise: 200000,
	})

	service := NewPaymentDecisionService(db)

	// Test ₹4,000 request -> should be BLOCKED because effective limit is MIN(10000, 3000) = 3000
	res, err := service.EvaluatePayment(EvaluateRequestInput{
		AgentID:     agent.ID,
		Merchant:    "Store",
		AmountPaise: 400000, // ₹4,000
		Currency:    "INR",
		Category:    "Electronics",
		Description: "Test Request",
	})

	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if res.Decision != models.DecisionBlocked {
		t.Errorf("Expected BLOCKED for ₹4,000 request (User cap ₹3,000), got %s", res.Decision)
	}
}
