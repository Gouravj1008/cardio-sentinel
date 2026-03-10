# 🫀 Cardio Sentinel AI - Complete Setup Guide

A real-time cardiac monitoring system with AI-powered anomaly detection using MongoDB, Redis, and Docker.

## 📋 Prerequisites

### Required Software
- **Docker Desktop** (v20.10+) - [Download](https://www.docker.com/products/docker-desktop)
- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **Python** (v3.10+) - [Download](https://www.python.org/)
- **Git** - [Download](https://git-scm.com/)

### Optional for Local Development
- MongoDB Compass (for database GUI)
- Redis Insight (for Redis GUI)
- Postman (for API testing)

## 🚀 Quick Start (Docker - Recommended)

### Option 1: Run Everything with Docker

1. **Make sure Docker Desktop is running**

2. **Run the startup script:**
   ```powershell
   .\start.ps1
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - ML Service: http://localhost:8000
   - MongoDB: mongodb://localhost:27017
   - Redis: redis://localhost:6379

4. **View logs:**
   ```powershell
   docker-compose logs -f
   ```

5. **Stop all services:**
   ```powershell
   docker-compose down
   ```

### Option 2: Local Development (With Docker Databases)

This runs MongoDB and Redis in Docker, but runs the application services locally for easier development.

1. **Run the local development script:**
   ```powershell
   .\start-local.ps1
   ```

This will:
- Start MongoDB and Redis in Docker
- Start ML service in a Python virtual environment
- Start Backend with hot-reload
- Start Frontend with hot-reload

## 📦 Manual Setup

### 1. Database Setup (Docker)

Start MongoDB and Redis:
```powershell
docker-compose up -d mongo redis
```

Wait for services to be healthy:
```powershell
docker-compose ps
```

### 2. ML Service Setup

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start ML service
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy and configure environment variables
# (Already configured in backend/.env)

# Start development server
npm run dev
```

### 4. Frontend Setup

```powershell
# Navigate to frontend directory
cd backend/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🛠️ Configuration

### Backend Environment Variables (`backend/.env`)

```ini
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/cardio-sentinel
REDIS_HOST=localhost
REDIS_PORT=6379

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# ML Service
ML_SERVICE_URL=http://localhost:8000
```

### Docker Environment Variables

When running with Docker, the docker-compose.yml automatically configures:
- MongoDB URI: `mongodb://mongo:27017/cardio-sentinel`
- Redis Host: `redis`
- Service networking and health checks

## 🧪 Testing

### Test Database Connections

#### Test MongoDB:
```powershell
# Using mongosh (if installed)
mongosh mongodb://localhost:27017/cardio-sentinel

# Or using Docker:
docker exec -it cardio-mongo mongosh cardio-sentinel
```

#### Test Redis:
```powershell
# Using redis-cli (if installed)
redis-cli ping

# Or using Docker:
docker exec -it cardio-redis redis-cli ping
```

### Test API Endpoints

```powershell
# Health check
curl http://localhost:5000/health

# Auth endpoints
curl http://localhost:5000/api/auth/register -X POST -H "Content-Type: application/json" -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"test123\"}'
```

### Test ML Service

```powershell
curl http://localhost:8000
```

## 📊 Service Architecture

```
┌─────────────────┐
│    Frontend     │ :5173
│   (React+Vite)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│     Backend     │ ───► │  ML Service  │ :8000
│  (Node.js+WS)   │ :5000│   (FastAPI)  │
└────────┬────────┘      └──────────────┘
         │
         ├──────────┐
         │          │
         ▼          ▼
┌─────────────┐ ┌──────────┐
│   MongoDB   │ │  Redis   │
│   :27017    │ │  :6379   │
└─────────────┘ └──────────┘
```

## 🔧 Useful Docker Commands

### View running containers:
```powershell
docker-compose ps
```

### View logs (all services):
```powershell
docker-compose logs -f
```

### View logs (specific service):
```powershell
docker-compose logs -f backend
docker-compose logs -f mongo
docker-compose logs -f redis
```

### Restart a service:
```powershell
docker-compose restart backend
```

### Stop all services:
```powershell
docker-compose down
```

### Stop and remove volumes (clean state):
```powershell
docker-compose down -v
```

### Rebuild a specific service:
```powershell
docker-compose up -d --build backend
```

## 🐛 Troubleshooting

### Docker Issues

**Problem:** Docker containers won't start
```powershell
# Check if Docker is running
docker info

# Check for port conflicts
docker-compose down
netstat -ano | findstr :5000
netstat -ano | findstr :27017
netstat -ano | findstr :6379
```

### MongoDB Issues

**Problem:** MongoDB connection errors
```powershell
# Check MongoDB container health
docker-compose ps mongo

# View MongoDB logs
docker-compose logs mongo

# Connect directly to MongoDB
docker exec -it cardio-mongo mongosh
```

### Redis Issues

**Problem:** Redis connection errors
```powershell
# Check Redis container health
docker-compose ps redis

# Test Redis connection
docker exec -it cardio-redis redis-cli ping

# View Redis logs
docker-compose logs redis
```

### Backend Issues

**Problem:** Backend won't start
```powershell
# Check dependencies are installed
cd backend
npm install

# Check environment variables
cat .env

# Run in debug mode
npm run dev
```

### Frontend Issues

**Problem:** Frontend won't start
```powershell
# Check dependencies
cd backend/frontend
npm install

# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Start with verbose logging
npm run dev -- --debug
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user  

### Health Monitoring Endpoints
- `GET /api/health/patient/:id` - Get patient health records
- `POST /api/health/record` - Create health record
- `GET /api/health/baseline/:patientId` - Get patient baseline

### Dashboard Endpoints
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/telemetry` - Get real-time telemetry (WebSocket available)

### Alert Endpoints
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/:id` - Get specific alert
- `PUT /api/alerts/:id` - Update alert status

## 🔐 Security Notes

- Change `JWT_SECRET` in production
- Use environment variables for sensitive data
- Enable MongoDB authentication for production
- Configure Redis password for production
- Use HTTPS in production
- Implement rate limiting (already configured)

## 📝 Development Notes

### Hot Reload
All services support hot reload in development mode:
- Frontend: Vite HMR
- Backend: Nodemon
- ML Service: Uvicorn --reload

### Database Persistence
Docker volumes persist data between restarts:
- `mongo-data` - MongoDB data
- `redis-data` - Redis data

To completely reset databases:
```powershell
docker-compose down -v
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Get Help

- Check logs: `docker-compose logs -f`
- Restart services: `docker-compose restart`
- Clean restart: `docker-compose down -v && docker-compose up -d`
- Report issues on GitHub

---

**Made with ❤️ by the Cardio Sentinel Team**
