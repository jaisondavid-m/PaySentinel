package models

import (
	"time"

	"gorm.io/gorm"
)

type Role string

const (
	RoleUser      Role = "user"
	RoleDeveloper Role = "developer"
)

type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Name         string         `gorm:"type:varchar(100);not null" json:"name"`
	Email        string         `gorm:"type:varchar(150);uniqueIndex;not null" json:"email"`
	PasswordHash string         `gorm:"type:varchar(255);not null" json:"-"`
	Role         Role           `gorm:"type:enum('user', 'developer');default:'user';not null" json:"role"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Agents   []Agent   `gorm:"foreignKey:DeveloperID" json:"agents,omitempty"`
	Payments []Payment `gorm:"foreignKey:UserID" json:"payments,omitempty"`
}

type RegisterInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     Role   `json:"role" binding:"required"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string   `json:"token"`
	User  UserData `json:"user"`
}

type UserData struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      Role      `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

func ToUserData(user *User) UserData {
	return UserData{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		Role:      user.Role,
		CreatedAt: user.CreatedAt,
	}
}
