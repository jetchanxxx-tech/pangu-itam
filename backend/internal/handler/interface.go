package handler

import (
	"itam-backend/internal/data"
	"itam-backend/internal/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

type InterfaceHandler struct{}

func NewInterfaceHandler() *InterfaceHandler {
	return &InterfaceHandler{}
}

// GetInterfaces 获取所有接口列表
func (h *InterfaceHandler) GetInterfaces(c *gin.Context) {
	var interfaces []model.SystemInterface
	result := data.DB.Find(&interfaces)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, interfaces)
}

// GetInterface 获取单个接口详情
func (h *InterfaceHandler) GetInterface(c *gin.Context) {
	id := c.Param("id")
	var iface model.SystemInterface
	if err := data.DB.First(&iface, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Interface not found"})
		return
	}
	c.JSON(http.StatusOK, iface)
}

// CreateInterface 创建新接口
func (h *InterfaceHandler) CreateInterface(c *gin.Context) {
	var iface model.SystemInterface
	if err := c.ShouldBindJSON(&iface); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := data.DB.Create(&iface)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, iface)
}

// UpdateInterface 更新接口
func (h *InterfaceHandler) UpdateInterface(c *gin.Context) {
	var iface model.SystemInterface
	id := c.Param("id")

	if err := data.DB.First(&iface, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Interface not found"})
		return
	}

	if err := c.ShouldBindJSON(&iface); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	data.DB.Save(&iface)
	c.JSON(http.StatusOK, iface)
}

// DeleteInterface 删除接口
func (h *InterfaceHandler) DeleteInterface(c *gin.Context) {
	id := c.Param("id")
	if err := data.DB.Delete(&model.SystemInterface{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Interface deleted"})
}
