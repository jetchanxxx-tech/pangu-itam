package model

import (
	"gorm.io/gorm"
)

type SystemInterface struct {
	gorm.Model
	Name        string `json:"name"`
	Method      string `json:"method"` // GET, POST, etc.
	URL         string `json:"url"`
	Description string `json:"description"`
	Status      string `json:"status"` // "Active", "Deprecated"
}

func (SystemInterface) TableName() string {
	return "system_interfaces"
}
