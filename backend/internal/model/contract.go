package model

import (
	"time"

	"gorm.io/gorm"
)

type Contract struct {
	gorm.Model
	Name        string    `json:"name"`
	Number      string    `json:"number"`
	Amount      float64   `json:"amount"`
	Currency    string    `json:"currency"`
	SignDate    time.Time `json:"sign_date"`
	ExpireDate  time.Time `json:"expire_date"`
	Vendor      string    `json:"vendor"`
	Status      string    `json:"status"` // "Active", "Expired", "Terminated"
	Description string    `json:"description"`
}

type ContractFile struct {
	gorm.Model
	ContractID uint   `json:"contract_id"`
	FileName   string `json:"file_name"`
	FilePath   string `json:"file_path"`
	Version    int    `json:"version"`
	UploadedBy string `json:"uploaded_by"`
}

func (Contract) TableName() string {
	return "contracts"
}

func (ContractFile) TableName() string {
	return "contract_files"
}
