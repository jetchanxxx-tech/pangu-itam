# ITAM System Architecture

## 1. Overview

The IT Asset Management (ITAM) system is designed as a **Modular Monolith** with a clear separation between frontend and backend. It aims to provide a lightweight, scalable, and easy-to-maintain solution for managing IT assets, contracts, and system interfaces.

## 2. Technology Stack

### Backend
- **Language**: Go (Golang) 1.20+
- **Web Framework**: Gin (High performance HTTP web framework)
- **ORM**: GORM (Go Object Relational Mapping)
- **Database Support**: SQLite (Embedded), MySQL, PostgreSQL
- **Configuration**: Viper (Support for YAML, JSON, environment variables)
- **Logging**: Zap (Structured, leveled logging)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite (Fast development and build)
- **UI Library**: Ant Design 5.0 (Enterprise-class UI components)
- **State Management**: Zustand (Lightweight state management)
- **HTTP Client**: Axios
- **Internationalization**: i18next

## 3. Architecture Diagrams

### 3.1 High-Level Architecture

```mermaid
graph TD
    User[User / Admin] -->|HTTP/HTTPS| LB[Load Balancer / Nginx]
    LB -->|Static Content| Frontend[Frontend SPA (React)]
    LB -->|API Requests| Backend[Backend API (Go/Gin)]
    
    subgraph Backend Services
        Backend --> Auth[Authentication & RBAC]
        Backend --> AssetMgr[Asset Management]
        Backend --> ContractMgr[Contract Management]
        Backend --> InterfaceMgr[Interface Management]
        Backend --> Monitor[Monitoring & Alerts]
    end
    
    Backend -->|Read/Write| DB[(Primary Database)]
    Backend -->|Cache| Redis[(Redis Cache)]
```

### 3.2 Data Flow

1. **Request**: User initiates an action (e.g., Create Asset) via the Frontend.
2. **API Call**: Frontend sends a JSON payload to the Backend API.
3. **Validation**: Backend `Handler` validates the request payload.
4. **Processing**: `Service` layer processes business logic (e.g., checking permissions, calculating status).
5. **Persistence**: `Repository` (Data) layer interacts with the Database via GORM.
6. **Notification**: If configured, an event is triggered to send alerts (via `Notification Service`).
7. **Response**: Backend returns JSON response to Frontend.

## 4. Key Modules

### 4.1 Asset Management
- **Core Entity**: `Asset` (Server, VM, Network Device, etc.)
- **Features**: CRUD, Tagging, Topology visualization.
- **Data Model**: Uses JSONB for flexible property storage.

### 4.2 Contract Management
- **Core Entity**: `Contract`, `ContractFile`
- **Features**: Contract lifecycle tracking, file versioning, expiration alerts.
- **File Storage**: Local file system (expandable to S3/OSS).

### 4.3 Interface Management
- **Core Entity**: `SystemInterface`
- **Features**: Documentation of system APIs, dependencies, and status.

## 5. Security Architecture

- **Authentication**: JWT (JSON Web Token) based stateless authentication.
- **Authorization**: Role-Based Access Control (RBAC).
- **Data Protection**:
  - Passwords hashed using Bcrypt.
  - Sensitive configuration (DB credentials) managed via environment variables.
  - API input validation to prevent injection attacks.

## 6. Scalability & Performance

- **Stateless Backend**: Allows horizontal scaling behind a load balancer.
- **Database Optimization**: Indexed queries, connection pooling.
- **Frontend Optimization**: Code splitting, lazy loading, static asset caching.
