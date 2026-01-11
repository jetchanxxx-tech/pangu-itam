package model

import (
	"gorm.io/gorm"
)

type Asset struct {
	gorm.Model
	Name        string `json:"name"`
	Type        string `json:"type"`     // e.g., "Server", "VM", "Database", "K8s"
	Platform    string `json:"platform"` // e.g., "AWS", "VMware", "BareMetal"
	IP          string `json:"ip"`
	Status      string `json:"status"` // "Online", "Offline", "Maintenance"
	Region      string `json:"region"`
	Owner       string `json:"owner"`
	Description string `json:"description"`
	Specs       string `json:"specs"` // e.g., "4vCPU/16GB"
}

// TableName overrides the table name used by User to `profiles`
func (Asset) TableName() string {
	return "assets"
}
