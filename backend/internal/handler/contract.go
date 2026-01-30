package handler

import (
	"fmt"
	"itam-backend/internal/data"
	"itam-backend/internal/model"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ContractHandler struct{}

func NewContractHandler() *ContractHandler {
	return &ContractHandler{}
}

// --- Contract CRUD ---

func (h *ContractHandler) GetContracts(c *gin.Context) {
	var contracts []model.Contract
	result := data.DB.Find(&contracts)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, contracts)
}

func (h *ContractHandler) GetContract(c *gin.Context) {
	id := c.Param("id")
	var contract model.Contract
	if err := data.DB.First(&contract, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contract not found"})
		return
	}
	c.JSON(http.StatusOK, contract)
}

func (h *ContractHandler) CreateContract(c *gin.Context) {
	var contract model.Contract
	if err := c.ShouldBindJSON(&contract); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := data.DB.Create(&contract)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, contract)
}

func (h *ContractHandler) UpdateContract(c *gin.Context) {
	var contract model.Contract
	id := c.Param("id")

	if err := data.DB.First(&contract, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contract not found"})
		return
	}

	if err := c.ShouldBindJSON(&contract); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	data.DB.Save(&contract)
	c.JSON(http.StatusOK, contract)
}

func (h *ContractHandler) DeleteContract(c *gin.Context) {
	id := c.Param("id")
	if err := data.DB.Delete(&model.Contract{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Contract deleted"})
}

// --- Contract Files ---

func (h *ContractHandler) GetContractFiles(c *gin.Context) {
	contractID := c.Param("id")
	var files []model.ContractFile
	if err := data.DB.Where("contract_id = ?", contractID).Order("version desc").Find(&files).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, files)
}

func (h *ContractHandler) UploadContractFile(c *gin.Context) {
	contractIDStr := c.Param("id")
	contractID, err := strconv.Atoi(contractIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid contract ID"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// Determine version
	var lastFile model.ContractFile
	newVersion := 1
	if err := data.DB.Where("contract_id = ?", contractID).Order("version desc").First(&lastFile).Error; err == nil {
		newVersion = lastFile.Version + 1
	}

	// Ensure upload directory exists
	uploadDir := "./uploads/contracts"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Save file
	filename := fmt.Sprintf("%d_v%d_%s", contractID, newVersion, file.Filename)
	dst := filepath.Join(uploadDir, filename)
	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Save record
	contractFile := model.ContractFile{
		ContractID: uint(contractID),
		FileName:   file.Filename,
		FilePath:   dst,
		Version:    newVersion,
		UploadedBy: "admin", // TODO: Get from context
	}

	if err := data.DB.Create(&contractFile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file record"})
		return
	}

	c.JSON(http.StatusOK, contractFile)
}

func (h *ContractHandler) DownloadContractFile(c *gin.Context) {
	fileID := c.Param("file_id")
	var contractFile model.ContractFile
	if err := data.DB.First(&contractFile, fileID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	c.File(contractFile.FilePath)
}
