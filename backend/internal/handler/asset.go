package handler

import (
	"fmt"
	"itam-backend/internal/data"
	"itam-backend/internal/model"
	"itam-backend/internal/notification"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AssetHandler struct {
	notify *notification.Service
}

func NewAssetHandler(notify *notification.Service) *AssetHandler {
	return &AssetHandler{
		notify: notify,
	}
}

func (h *AssetHandler) GetAssets(c *gin.Context) {
	var assets []model.Asset
	result := data.DB.Find(&assets)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, assets)
}

func (h *AssetHandler) CreateAsset(c *gin.Context) {
	var asset model.Asset
	if err := c.ShouldBindJSON(&asset); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := data.DB.Create(&asset)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// Send Notification
	go h.notify.SendAlert("New Asset Created", fmt.Sprintf("Asset %s (%s) has been added by %s.", asset.Name, asset.IP, asset.Owner))

	c.JSON(http.StatusOK, asset)
}

func (h *AssetHandler) UpdateAsset(c *gin.Context) {
	var asset model.Asset
	id := c.Param("id")

	if err := data.DB.First(&asset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Asset not found"})
		return
	}

	if err := c.ShouldBindJSON(&asset); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	data.DB.Save(&asset)
	c.JSON(http.StatusOK, asset)
}

func (h *AssetHandler) DeleteAsset(c *gin.Context) {
	id := c.Param("id")
	var asset model.Asset
	
	// Get asset info before deletion for notification
	if err := data.DB.First(&asset, id).Error; err == nil {
		// Send Notification
		go h.notify.SendAlert("Asset Deleted", fmt.Sprintf("Asset %s (%s) has been removed.", asset.Name, asset.IP))
	}

	if err := data.DB.Delete(&model.Asset{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Asset deleted"})
}
