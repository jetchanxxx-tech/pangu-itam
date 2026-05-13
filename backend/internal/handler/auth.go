package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"itam-backend/internal/middleware"
)

// LoginRequest login request body
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse login response
type LoginResponse struct {
	Token    string `json:"token"`
	Username string `json:"username"`
	Role     string `json:"role"`
}

// AuthHandler authentication handler
type AuthHandler struct{}

// NewAuthHandler creates new auth handler
func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement proper user authentication with database
	// For now, using hardcoded credentials for demo
	var userID uint
	var role string

	switch req.Username {
	case "admin":
		if req.Password != "admin123" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
		userID = 1
		role = "admin"
	case "user":
		if req.Password != "user123" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
		userID = 2
		role = "user"
	default:
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := middleware.GenerateToken(userID, req.Username, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, LoginResponse{
		Token:    token,
		Username: req.Username,
		Role:     role,
	})
}

// Logout handles user logout
func (h *AuthHandler) Logout(c *gin.Context) {
	// In a stateless JWT system, logout is handled client-side
	// by removing the token from storage
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// GetCurrentUser returns current user info
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	role, _ := c.Get("role")
	userID, _ := c.Get("userID")

	c.JSON(http.StatusOK, gin.H{
		"user_id":  userID,
		"username": username,
		"role":     role,
	})
}

// ChangePassword handles password change
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	// TODO: Implement password change logic
	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}
