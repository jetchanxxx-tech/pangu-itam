package model

import (
	"gorm.io/gorm"
)

// Contract 合同主模型
type Contract struct {
	gorm.Model
	Name        string `json:"name" gorm:"not null"`
	Code        string `json:"code" gorm:"uniqueIndex"`           // 合同编号
	Type        string `json:"type"`                              // 合同类型：采购、维保、租赁等
	Status      string `json:"status" gorm:"default:'draft'"`     // 状态：draft, active, expired, terminated
	Vendor      string `json:"vendor"`                            // 供应商
	Amount      float64 `json:"amount"`                           // 合同金额
	Currency    string `json:"currency" gorm:"default:'CNY'"`     // 币种
	StartDate   string `json:"start_date"`                        // 开始日期
	EndDate     string `json:"end_date"`                          // 结束日期
	SignDate    string `json:"sign_date"`                         // 签署日期
	Description string `json:"description"`                       // 合同描述
	Owner       string `json:"owner"`                             // 负责人
	ContactInfo string `json:"contact_info"`                      // 联系方式
	AssetID     *uint  `json:"asset_id"`                          // 关联资产ID
}

func (Contract) TableName() string {
	return "contracts"
}

// ContractFile 合同文件版本模型
type ContractFile struct {
	gorm.Model
	ContractID uint   `json:"contract_id" gorm:"not null;index"` // 所属合同ID
	FileName   string `json:"file_name" gorm:"not null"`           // 原始文件名
	FilePath   string `json:"file_path" gorm:"not null"`           // 存储路径
	FileSize   int64  `json:"file_size"`                           // 文件大小(字节)
	FileType   string `json:"file_type"`                           // 文件类型
	Version    int    `json:"version" gorm:"not null"`             // 版本号
	UploadedBy string `json:"uploaded_by"`                         // 上传人
	Remark     string `json:"remark"`                              // 版本备注
}

func (ContractFile) TableName() string {
	return "contract_files"
}
