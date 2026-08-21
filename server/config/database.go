package config

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"server/models"
)

var DB *gorm.DB

func InitDB() (*gorm.DB, error) {
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
		log.Printf("⚠️ Warning: Failed to connect to MySQL database at %s:%s. Error: %v", host, port, err)
		log.Println("Ensure MySQL service is running and the database exists. Example: CREATE DATABASE IF NOT EXISTS paysentinel;")
		return nil, err
	}

	log.Println("✅ Successfully connected to MySQL database!")

	// Auto migrate tables
	err = db.AutoMigrate(
		&models.User{},
		&models.Agent{},
		&models.Payment{},
	)
	if err != nil {
		log.Printf("⚠️ Failed to auto-migrate database tables: %v", err)
		return nil, err
	}

	log.Println("✅ Database migration completed successfully.")
	DB = db
	return db, nil
}
