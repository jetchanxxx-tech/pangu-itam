package data

import (
	"fmt"
	"itam-backend/internal/conf"
	"itam-backend/internal/model"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB(cfg *conf.Config) {
	var err error
	var dsn string

	switch cfg.Database.Driver {
	case "mysql":
		// DSN: user:password@tcp(127.0.0.1:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local
		dsn = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			cfg.Database.User,
			cfg.Database.Password,
			cfg.Database.Host,
			cfg.Database.Port,
			cfg.Database.DbName,
		)
		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	case "postgres":
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Shanghai",
			cfg.Database.Host,
			cfg.Database.User,
			cfg.Database.Password,
			cfg.Database.DbName,
			cfg.Database.Port,
		)
		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	case "sqlite":
		dsn = cfg.Database.DbName
		DB, err = gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	default:
		// Default to sqlite if unknown
		dsn = "itam.db"
		DB, err = gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	}

	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// Auto Migrate
	if err := DB.AutoMigrate(&model.Asset{}, &model.Contract{}, &model.ContractFile{}, &model.SystemInterface{}); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	log.Printf("Database connected: %s", cfg.Database.Driver)
}
