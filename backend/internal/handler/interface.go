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

func (h *InterfaceHandler) GetInterfaces(c *gin.Context) {
	var interfaces []model.SystemInterface
	result := data.DB.Find(&interfaces)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, interfaces)
}

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

func (h *InterfaceHandler) DeleteInterface(c *gin.Context) {
	id := c.Param("id")
	if err := data.DB.Delete(&model.SystemInterface{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Interface deleted"})
}
