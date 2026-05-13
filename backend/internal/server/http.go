package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"itam-backend/internal/conf"
	"itam-backend/internal/handler"
	"itam-backend/internal/middleware"
	"itam-backend/internal/notification"
)

func NewHTTPServer(c *conf.Config, notify *notification.Service) *gin.Engine {
	if c.Server.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// Initialize Handlers
	assetHandler := handler.NewAssetHandler(notify)
	contractHandler := handler.NewContractHandler()
	interfaceHandler := handler.NewInterfaceHandler()
	authHandler := handler.NewAuthHandler()

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

	// Health Check (public)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// Auth routes (public)
	auth := r.Group("/api/v1/auth")
	{
		auth.POST("/login", authHandler.Login)
		auth.POST("/logout", authHandler.Logout)
	}

	// Protected API Group
	api := r.Group("/api/v1")
	api.Use(middleware.JWTAuthMiddleware())
	{
		// User info
		api.GET("/user/me", authHandler.GetCurrentUser)
		api.POST("/user/change-password", authHandler.ChangePassword)

		// Dashboard
		api.GET("/dashboard/stats", handler.GetDashboardStats)

		// Assets
		api.GET("/assets", assetHandler.GetAssets)
		api.POST("/assets", assetHandler.CreateAsset)
		api.PUT("/assets/:id", assetHandler.UpdateAsset)
		api.DELETE("/assets/:id", assetHandler.DeleteAsset)

		// Contracts
		api.GET("/contracts", contractHandler.GetContracts)
		api.GET("/contracts/:id", contractHandler.GetContract)
		api.POST("/contracts", contractHandler.CreateContract)
		api.PUT("/contracts/:id", contractHandler.UpdateContract)
		api.DELETE("/contracts/:id", contractHandler.DeleteContract)

		// Contract Files
		api.GET("/contracts/:id/files", contractHandler.GetContractFiles)
		api.POST("/contracts/:id/files", contractHandler.UploadContractFile)
		api.GET("/contract-files/:file_id/download", contractHandler.DownloadContractFile)

		// System Interfaces
		api.GET("/interfaces", interfaceHandler.GetInterfaces)
		api.GET("/interfaces/:id", interfaceHandler.GetInterface)
		api.POST("/interfaces", interfaceHandler.CreateInterface)
		api.PUT("/interfaces/:id", interfaceHandler.UpdateInterface)
		api.DELETE("/interfaces/:id", interfaceHandler.DeleteInterface)

		// Ping test
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message": "pong",
			})
		})
	}

	// Static files (frontend)
	r.Static("/static", "./static")
	r.StaticFile("/", "./static/index.html")

	return r
}
