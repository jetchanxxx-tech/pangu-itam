package main

import (
	"fmt"
	"itam-backend/internal/conf"
	"itam-backend/internal/data"
	"itam-backend/internal/notification"
	"itam-backend/internal/server"
	"log"
)

func main() {
	// 1. Load Config
	cfg := conf.LoadConfig()

	// 2. Initialize Database
	data.InitDB(cfg)

	// 3. Initialize Notification Service
	notifyService := notification.NewService(&cfg.Notification)

	// 4. Initialize Server
	r := server.NewHTTPServer(cfg, notifyService)

	// 5. Run Server
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("Starting server on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
