package notification

import (
	"bytes"
	"encoding/json"
	"fmt"
	"itam-backend/internal/conf"
	"log"
	"net/http"
	"time"
)

type Service struct {
	cfg *conf.NotificationConfig
}

func NewService(cfg *conf.NotificationConfig) *Service {
	return &Service{
		cfg: cfg,
	}
}

// SendAlert sends an alert message to all enabled channels
func (s *Service) SendAlert(title, content string) error {
	if !s.cfg.Enable {
		log.Println("Notification disabled, skipping alert:", title)
		return nil
	}

	var errs []error

	// 1. Send IM
	if err := s.sendIM(title, content); err != nil {
		log.Printf("Failed to send IM: %v", err)
		errs = append(errs, err)
	}

	// 2. Send SMS
	if err := s.sendSMS(content); err != nil {
		log.Printf("Failed to send SMS: %v", err)
		errs = append(errs, err)
	}

	if len(errs) > 0 {
		return fmt.Errorf("encountered %d errors while sending notification", len(errs))
	}
	return nil
}

func (s *Service) sendIM(title, content string) error {
	cfg := s.cfg.IM
	if cfg.Webhook == "" {
		return nil
	}

	switch cfg.Provider {
	case "feishu":
		return s.sendFeishu(cfg.Webhook, title, content)
	case "dingtalk":
		// Implement DingTalk logic
		return fmt.Errorf("dingtalk provider not implemented yet")
	case "wechat_work":
		// Implement WeChat Work logic
		return fmt.Errorf("wechat_work provider not implemented yet")
	default:
		return fmt.Errorf("unknown IM provider: %s", cfg.Provider)
	}
}

func (s *Service) sendFeishu(webhook, title, content string) error {
	// Feishu Custom Bot Message Format
	msg := map[string]interface{}{
		"msg_type": "text",
		"content": map[string]interface{}{
			"text": fmt.Sprintf("【ITAM Alert】%s\n%s", title, content),
		},
	}

	payload, _ := json.Marshal(msg)
	resp, err := http.Post(webhook, "application/json", bytes.NewBuffer(payload))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("feishu webhook returned status: %d", resp.StatusCode)
	}
	return nil
}

func (s *Service) sendSMS(content string) error {
	cfg := s.cfg.SMS
	if cfg.AccessKeyID == "" {
		return nil
	}

	switch cfg.Provider {
	case "aliyun":
		// TODO: Integrate Aliyun Go SDK
		// For now, we just log it as a placeholder
		log.Printf("[MOCK SMS] Sending via Aliyun to Admin: %s (Template: %s)", content, cfg.TemplateCode)
		return nil
	case "tencent":
		log.Printf("[MOCK SMS] Sending via Tencent: %s", content)
		return nil
	default:
		return fmt.Errorf("unknown SMS provider: %s", cfg.Provider)
	}
}
