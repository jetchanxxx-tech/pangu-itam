# ITAM System Development Guide

## Project Structure

- `backend/`: Golang + Gin + GORM API Server
- `frontend/`: React + Vite + Ant Design UI
- `install.sh`: Server deployment script (Docker)

## Prerequisites

- **Go**: v1.20+
- **Node.js**: v18+
- **PostgreSQL**: v15 (Or use Docker Compose)
- **Redis**: v7 (Or use Docker Compose)

## Getting Started

### 1. Backend

```bash
cd backend
go mod tidy
go run cmd/server/main.go
```

Configuration is located in `backend/configs/config.yaml` (Create if needed, defaults are used).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Access the UI at `http://localhost:3000`.

## Features Implemented

- **Frontend Architecture**: React + Vite + TypeScript
- **UI Framework**: Ant Design v5
- **Theme Support**: Light/Dark mode toggle (Persisted in State)
- **Internationalization (i18n)**: English/Chinese switching
- **Backend Architecture**: Modular Monolith (Gin + GORM)

## Next Steps

1. Implement Database Models in `backend/internal/data`
2. Implement Authentication (RBAC)
3. Connect Frontend API calls to Backend
