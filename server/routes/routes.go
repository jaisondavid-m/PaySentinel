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

	// Public Auth routes
	authRoutes := r.Group("/api/auth")
	{
		authRoutes.POST("/register", controllers.Register)
		authRoutes.POST("/login", controllers.Login)
	}

	// Protected routes (Requires valid JWT)
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/auth/me", controllers.GetMe)

		// Developer-only routes
		devRoutes := protected.Group("/developer")
		devRoutes.Use(middleware.RequireRole(models.RoleDeveloper))
		{
			devRoutes.GET("/dashboard", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"message": "Welcome to Developer Sentinel Studio",
					"role":    "developer",
					"features": []string{
						"Create AI Payment Agent",
						"Generate API Secret Keys",
						"Manage Webhooks & Callbacks",
						"Inspect Real-time Analytics",
					},
				})
			})
		}

		// User-only routes
		userRoutes := protected.Group("/user")
		userRoutes.Use(middleware.RequireRole(models.RoleUser))
		{
			userRoutes.GET("/dashboard", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"message": "Welcome to PaySentinel User Portal",
					"role":    "user",
					"features": []string{
						"Execute Agent Payments",
						"View Payment History",
						"Manage Payment Methods",
						"Verify Transaction Receipts",
					},
				})
			})
		}
	}

	return r
}
