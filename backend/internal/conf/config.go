package conf

import (
	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
	"log"
)

type Config struct {
	Server       ServerConfig       `mapstructure:"server"`
	Database     DatabaseConfig     `mapstructure:"database"`
	Redis        RedisConfig        `mapstructure:"redis"`
	Notification NotificationConfig `mapstructure:"notification"`
}

type ServerConfig struct {
	Port string `mapstructure:"port"`
	Mode string `mapstructure:"mode"`
}

type DatabaseConfig struct {
	Driver   string `mapstructure:"driver"`
	Host     string `mapstructure:"host"`
	Port     string `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	DbName   string `mapstructure:"dbname"`
}

type RedisConfig struct {
	Addr     string `mapstructure:"addr"`
	Password string `mapstructure:"password"`
	Db       int    `mapstructure:"db"`
}

type NotificationConfig struct {
	Enable bool     `mapstructure:"enable"`
	SMS    SMSConfig `mapstructure:"sms"`
	IM     IMConfig  `mapstructure:"im"`
}

type SMSConfig struct {
	Provider      string `mapstructure:"provider"` // e.g., "aliyun", "tencent"
	AccessKeyID   string `mapstructure:"access_key_id"`
	AccessKeySecret string `mapstructure:"access_key_secret"`
	SignName      string `mapstructure:"sign_name"`
	TemplateCode  string `mapstructure:"template_code"`
}

type IMConfig struct {
	Provider string `mapstructure:"provider"` // e.g., "feishu", "dingtalk", "wechat_work"
	Webhook  string `mapstructure:"webhook"`
	Secret   string `mapstructure:"secret"` // Optional, for signature verification
}

func LoadConfig() *Config {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./configs")
	viper.AddConfigPath(".")

	// Default values
	viper.SetDefault("server.port", "8080")
	viper.SetDefault("server.mode", "debug")
	viper.SetDefault("database.driver", "sqlite")
	viper.SetDefault("database.dbname", "itam.db")

	if err := viper.ReadInConfig(); err != nil {
		log.Printf("Warning: Config file not found, using defaults. Error: %v", err)
	}

	// Watch for changes
	viper.WatchConfig()
	viper.OnConfigChange(func(e fsnotify.Event) {
		log.Printf("Config file changed: %s", e.Name)
		// Here you can add logic to reload config into the struct if needed,
		// or notify other components.
		if err := viper.Unmarshal(&config); err != nil {
			log.Printf("Unable to decode into struct after change, %v", err)
		}
	})

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		log.Fatalf("Unable to decode into struct, %v", err)
	}

	return &config
}
