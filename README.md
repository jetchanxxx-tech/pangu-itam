# Pangu ITAM (IT Asset Management System)

A comprehensive IT Asset Management system built with Go and React.

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:
- [Deployment Guide](docs/DEPLOYMENT.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Operations Runbook](docs/OPERATIONS.md)

## 📂 Project Structure

```
.
├── backend/                # Golang + Gin + GORM API Server
│   ├── cmd/server/         # Application entry point
│   ├── internal/           # Private application code
│   │   ├── conf/           # Configuration management
│   │   ├── data/           # Database initialization
│   │   ├── handler/        # HTTP Request handlers (Asset, Contract, Interface)
│   │   ├── model/          # Database models
│   │   └── server/         # HTTP Server setup (Routes)
│   └── config.yaml         # Server configuration
├── frontend/               # React + Vite + Ant Design UI
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Application pages (Dashboard, Assets, Contracts, Wiki)
│   │   ├── services/       # API integration
│   │   └── store/          # State management (Zustand)
├── docs/                   # Project documentation
└── install.sh              # Deployment script
```

## 🛠 Tech Stack

- **Backend**: Go 1.20+, Gin Web Framework, GORM
- **Database**: SQLite (Default) / MySQL
- **Frontend**: React 18, TypeScript, Vite, Ant Design 5
- **State Management**: Zustand
- **Internationalization**: react-i18next

## ✨ Features

- **Asset Management**: Track Servers, VMs, and Network devices.
- **Contract Management**: Lifecycle management with file versioning support.
- **Interface Management**: Centralized system interface registry.
- **Dashboard**: Real-time overview of asset status.
- **Wiki**: Integrated documentation viewer.
- **Web Terminal**: SSH/Telnet access (Simulated/Planned).

## 🚀 Getting Started

### Backend

```bash
cd backend
go mod tidy
go run cmd/server/main.go
```

The server runs on port `8080` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Access the UI at `http://localhost:5173`.

## ⚙️ Configuration

Backend configuration is found in `backend/config.yaml`.
Default database is SQLite (`itam.db`). Change `driver` to `mysql` for production.
