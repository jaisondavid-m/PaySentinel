package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"

	"server/config"
	"server/routes"
)

func main() {
	// Load environment variables from .env if present
	if err := godotenv.Load(); err != nil {
		log.Println("ℹ️ No .env file found or error reading .env, fallback to environment variables.")
	}

	// Initialize MySQL Database connection
	config.InitDB()

	// Setup Router
	r := routes.SetupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 PaySentinel Go API server running on port :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
