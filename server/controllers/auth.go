package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"server/config"
	"server/models"
	"server/utils"
)

// Register handles user and developer registration
func Register(c *gin.Context) {
	var input models.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload: " + err.Error()})
		return
	}

	// Validate role
	if input.Role != models.RoleUser && input.Role != models.RoleDeveloper {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role must be either 'user' or 'developer'"})
		return
	}

	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection is not initialized. Please ensure MySQL is running."})
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := config.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email is already registered. Please login instead."})
		return
	} else if err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database query error: " + err.Error()})
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encrypt password"})
		return
	}

	// Create user
	user := models.User{
		Name:         input.Name,
		Email:        input.Email,
		PasswordHash: hashedPassword,
		Role:         input.Role,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user record: " + err.Error()})
		return
	}

	// Generate JWT Token
	token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate authentication token"})
		return
	}

	c.JSON(http.StatusCreated, models.AuthResponse{
		Token: token,
		User:  models.ToUserData(&user),
	})
}

// Login handles user and developer authentication
func Login(c *gin.Context) {
	var input models.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload: " + err.Error()})
		return
	}

	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection is not initialized. Please ensure MySQL is running."})
		return
	}

	// Find user by email
	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
		return
	}

	// Check password match
	if !utils.CheckPasswordHash(input.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Generate JWT Token
	token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate authentication token"})
		return
	}

	c.JSON(http.StatusOK, models.AuthResponse{
		Token: token,
		User:  models.ToUserData(&user),
	})
}

// GetMe returns current authenticated user information
func GetMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection not initialized"})
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User profile not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": models.ToUserData(&user),
	})
}
