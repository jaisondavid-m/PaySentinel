package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"server/controllers"
	"server/middleware"
	"server/models"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Apply CORS
	r.Use(middleware.CORSMiddleware())

	// Health check endpoint
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "PaySentinel Core API",
		})
	})

	// Public & Auth routes
	authRoutes := r.Group("/api/auth")
	{
		authRoutes.POST("/register", controllers.Register)
		authRoutes.POST("/login", controllers.Login)
		authRoutes.GET("/me", middleware.AuthMiddleware(), controllers.GetMe)
	}

	// PaySentinel V1 API Routes
	v1 := r.Group("/api/v1")
	{
		// Agent execution endpoint (Public/HMAC authenticated agent trigger)
		v1.POST("/agent/payment-requests", controllers.AgentPaymentRequest)

		// Protected routes requiring authenticated user/developer JWT
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/auth/me", controllers.GetMe)

			// Developer Endpoints
			devRoutes := protected.Group("/developer")
			devRoutes.Use(middleware.RequireRole(models.RoleDeveloper))
			{
				devRoutes.GET("/dashboard", controllers.DeveloperGetDashboard)
				devRoutes.POST("/agents", controllers.DeveloperCreateAgent)
				devRoutes.GET("/agents", controllers.DeveloperListAgents)
				devRoutes.GET("/agents/:id", controllers.DeveloperGetAgent)
				devRoutes.PATCH("/agents/:id", controllers.DeveloperUpdateAgent)
				devRoutes.DELETE("/agents/:id", controllers.DeveloperDeleteAgent)
			}

			// User Endpoints
			userRoutes := protected.Group("/user")
			userRoutes.Use(middleware.RequireRole(models.RoleUser, models.RoleDeveloper))
			{
				userRoutes.GET("/dashboard", controllers.UserGetDashboard)
				userRoutes.GET("/agents", controllers.UserListAgents)
				userRoutes.GET("/agents/:id", controllers.UserGetAgent)
				userRoutes.PATCH("/agents/:id/policy", controllers.UserUpdatePolicy)
				userRoutes.PATCH("/agents/:id/status", controllers.UserUpdateAgentStatus)

				userRoutes.GET("/approvals", controllers.UserGetApprovals)
				userRoutes.POST("/approvals/:id/approve", controllers.UserApproveRequest)
				userRoutes.POST("/approvals/:id/reject", controllers.UserRejectRequest)

				userRoutes.GET("/transactions", controllers.UserGetTransactions)
				userRoutes.GET("/transactions/:id", controllers.UserGetTransactionDetail)
				userRoutes.GET("/audit-logs", controllers.UserGetAuditLogs)
			}
		}
	}

	return r
}
