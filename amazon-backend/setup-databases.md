# Database Setup Guide for Windows

## 🗄️ MongoDB Setup

### Option A: MongoDB Community Server (Recommended)

1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows x64, MSI Package
   - Download and run the installer

2. **Installation Steps**
   - Run the downloaded `.msi` file as Administrator
   - Choose "Complete" setup type
   - **Important**: Check "Install MongoDB as a Service"
   - **Important**: Check "Install MongoDB Compass" (GUI tool)
   - Click Install

3. **Verify Installation**
   ```bash
   # Open Command Prompt and test
   mongod --version
   mongo --version
   ```

4. **Start MongoDB Service**
   ```bash
   # MongoDB should start automatically as a service
   # If not, start it manually:
   net start MongoDB
   ```

### Option B: MongoDB Atlas (Cloud - Free Tier)

1. **Create Atlas Account**
   - Go to: https://cloud.mongodb.com
   - Sign up for free account
   - Create a new cluster (free M0 tier)

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

## 🔴 Redis Setup

### Option A: Redis for Windows (Recommended)

1. **Download Redis for Windows**
   - Go to: https://github.com/microsoftarchive/redis/releases
   - Download the latest `.msi` file
   - Run the installer

2. **Installation Steps**
   - Run the downloaded `.msi` file as Administrator
   - Follow the installation wizard
   - **Important**: Check "Add Redis to PATH"
   - **Important**: Check "Run Redis as Windows Service"

3. **Verify Installation**
   ```bash
   # Open Command Prompt and test
   redis-server --version
   redis-cli --version
   ```

4. **Test Redis Connection**
   ```bash
   # Start redis-cli and test
   redis-cli
   ping
   # Should return: PONG
   exit
   ```

### Option B: WSL + Redis (Alternative)

If you have Windows Subsystem for Linux:

```bash
# In WSL terminal
sudo apt update
sudo apt install redis-server
sudo service redis-server start
redis-cli ping
```

## 🔧 Quick Setup Script

Once both services are installed, you can test them:

```bash
# Test MongoDB connection
mongo --eval "db.version()"

# Test Redis connection  
redis-cli ping
```

## 🌐 Cloud Alternatives (No Local Installation)

### MongoDB Atlas (Free)
- Free 512MB cluster
- No local installation needed
- Update MONGODB_URI in .env with Atlas connection string

### Redis Cloud (Free)
- Free 30MB Redis instance
- Go to: https://redis.com/try-free/
- Get connection details for .env

## ✅ Next Steps

After installing both services:
1. Update your .env file with connection details
2. Start the backend server
3. Test the API endpoints

Choose which option works best for you, and I'll help you configure the .env file accordingly!