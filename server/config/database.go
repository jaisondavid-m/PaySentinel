package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"server/models"
)

var DB *gorm.DB

// InitDB initializes the MySQL connection using GORM and migrates schema
func InitDB() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ .env file not found, reading environment variables directly.")
	}

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

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		user, password, host, port, dbname)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Printf("❌ Failed to connect to MySQL database: %v\n", err)
		log.Println("⚠️ Server starting without active database connection. Database features will return error until MySQL is connected.")
		return
	}

	log.Println("✅ Successfully connected to MySQL database!")

	// AutoMigrate all PaySentinel GORM models safely
	err = db.AutoMigrate(
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

	if err != nil {
		log.Printf("⚠️ Failed to auto-migrate database tables: %v\n", err)
	} else {
		log.Println("✅ Database migration completed successfully.")
	}

	DB = db
}
