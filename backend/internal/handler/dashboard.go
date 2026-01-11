package handler

import (
	"itam-backend/internal/data"
	"itam-backend/internal/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetDashboardStats(c *gin.Context) {
	var assetCount int64
	data.DB.Model(&model.Asset{}).Count(&assetCount)

	var offlineCount int64
	data.DB.Model(&model.Asset{}).Where("status IN ?", []string{"Offline", "Maintenance", "Stopped"}).Count(&offlineCount)

	// Calculate mock SLA based on online percentage (simple logic for demo)
	sla := 100.0
	if assetCount > 0 {
		sla = float64(assetCount-offlineCount) / float64(assetCount) * 100
	}

	stats := gin.H{
		"total_assets":   assetCount,
		"ueba_score":     15,            // UEBA would require a UserBehavior model
		"active_alerts":  offlineCount,  // Real-time based on asset status
		"sla_compliance": sla,           // Calculated from asset availability
		"pending_audits": 5,             // Mock for now
	}

	c.JSON(http.StatusOK, stats)
}
