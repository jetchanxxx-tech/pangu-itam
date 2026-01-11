package server

import (
	"github.com/gin-gonic/gin"
	"itam-backend/internal/conf"
	"itam-backend/internal/handler"
	"itam-backend/internal/notification"
)

func NewHTTPServer(c *conf.Config, notify *notification.Service) *gin.Engine {
	if c.Server.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	
	// Initialize Handlers
	assetHandler := handler.NewAssetHandler(notify)

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health Check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// API Group
	api := r.Group("/api/v1")
	{
		api.GET("/dashboard/stats", handler.GetDashboardStats)
		
		api.GET("/assets", assetHandler.GetAssets)
		api.POST("/assets", assetHandler.CreateAsset)
		api.PUT("/assets/:id", assetHandler.UpdateAsset)
		api.DELETE("/assets/:id", assetHandler.DeleteAsset)

		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message": "pong",
			})
		})
	}

	return r
}
