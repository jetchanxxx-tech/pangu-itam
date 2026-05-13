# Multi-stage build for Go backend and React frontend

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM golang:1.20-alpine AS backend-builder

WORKDIR /app/backend

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy go mod files
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copy backend source
COPY backend/ ./

# Build the binary
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o server cmd/server/main.go

# Stage 3: Final Image
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy backend binary
COPY --from=backend-builder /app/backend/server .

# Copy config file
COPY --from=backend-builder /app/backend/config.yaml .

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./static

# Create uploads directory
RUN mkdir -p uploads/contracts

# Expose port
EXPOSE 8080

# Run the binary
CMD ["./server"]
