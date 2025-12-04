# Amazon Clone Backend - Development Setup Guide

## 🚀 Current Status: Phase 2 Complete ✅

Your backend now has a **complete authentication system**! Here's what's been completed:

### ✅ Phase 1 - Foundation (COMPLETED)
- ✅ **Project Structure**: Complete modular backend architecture
- ✅ **Dependencies**: All production packages installed
- ✅ **Server Configuration**: Express.js with security, CORS, rate limiting
- ✅ **Environment Setup**: .env configuration with all required variables
- ✅ **Logging System**: Winston logger with different log levels
- ✅ **Error Handling**: Global error handler and not found middleware
- ✅ **Health Endpoints**: `/health` and `/api/status` endpoints working

### ✅ Phase 2 - Authentication System (COMPLETED)
- ✅ **User Registration**: With email verification and validation
- ✅ **User Login/Logout**: JWT-based authentication with refresh tokens
- ✅ **Password Management**: Reset, update, security features
- ✅ **User Profiles**: Profile management, addresses, preferences
- ✅ **Role-Based Access**: Customer, admin, seller, moderator roles
- ✅ **Email Service**: Professional email templates and notifications
- ✅ **Security Features**: Rate limiting, validation, account lockout
- ✅ **Admin Features**: User management, statistics, search

### 🔧 Prerequisites for Full Functionality

To run the complete backend, you'll need:

#### 1. MongoDB Database
```bash
# Option A: Install MongoDB locally
# Download from: https://www.mongodb.com/try/download/community
# Or use MongoDB Atlas (cloud): https://cloud.mongodb.com

# Option B: Run with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Note**: Redis has been removed from the tech stack. All caching, sessions, and queues are now handled by MongoDB for simplicity and consistency.

### 🏃‍♂️ Quick Start (Development Mode)

#### Option 1: Run without external dependencies
```bash
cd amazon-backend
npm run dev:standalone
```

#### Option 2: Run with MongoDB
```bash
# 1. Start MongoDB (see above)
# 2. Update .env file with your credentials
# 3. Start the backend
cd amazon-backend
npm run dev
```

### 📊 Test the Backend

Once running, you can test these endpoints:

```bash
# Health check
curl http://localhost:5000/health

# API status (shows Phase 2 complete)
curl http://localhost:5000/api/status

# Welcome message
curl http://localhost:5000/

# Authentication endpoints
curl http://localhost:5000/api/auth/me  # Should return 401

# User registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john@example.com",
    "password": "StrongPass123!",
    "passwordConfirm": "StrongPass123!"
  }'
```

### 🗂️ Project Structure
```
amazon-backend/
├── src/
│   ├── config/          # Database & Redis configurations
│   ├── controllers/     # Route handlers (Phase 2+)
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models (Phase 2+)
│   ├── routes/          # API routes (Phase 2+)
│   ├── services/        # Business logic (Phase 2+)
│   ├── utils/           # Utility functions
│   ├── validators/      # Input validation (Phase 2+)
│   ├── app.js           # Express app configuration
│   └── server.js        # Server entry point
├── package.json         # Dependencies and scripts
├── .env                 # Environment variables
└── README.md           # Documentation
```

### 🎯 Next Development Phases

Your backend roadmap is ready! Here's what comes next:

#### Phase 2 - Authentication System (Next)
- User registration and login
- JWT token management  
- Password reset functionality
- Role-based access control

#### Phase 3 - Product Management
- Product CRUD operations
- Category management
- Search and filtering
- Image upload integration

#### Phase 4 - Order Processing
- Shopping cart management
- Order creation and tracking
- Inventory management

#### Phase 5 - Payment Integration
- Stripe payment processing
- Order confirmation emails
- Receipt generation

#### Phase 6 - Advanced Features
- Real-time notifications
- Product recommendations
- Advanced search with Elasticsearch

#### Phase 7 - AI & Analytics
- AI-powered recommendations
- User behavior analytics
- Performance monitoring

#### Phase 8 - Production Deployment
- Docker containerization
- CI/CD pipeline setup
- Performance optimization
- Security hardening

### 🔗 Frontend Integration

Your React frontend (running on port 3000) is already configured to work with this backend (port 5000). The CORS settings allow communication between them.

### 📝 Environment Variables

Key variables in your `.env` file:
- `NODE_ENV`: Set to 'development' for local development
- `PORT`: Backend server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token signing
- `FRONTEND_URL`: Your React app URL (http://localhost:3000)

### 🐛 Troubleshooting

#### Backend won't start?
1. Check if MongoDB/Redis are running
2. Verify .env variables are set
3. Ensure port 5000 is available
4. Check logs for specific errors

#### Can't connect to database?
1. Verify MongoDB is running on port 27017
2. Check MONGODB_URI in .env
3. Ensure database name exists

#### Redis connection issues?
1. Redis is optional for development
2. Backend will continue without Redis (with warnings)
3. Check Redis is running on port 6379

### 🚀 Ready for Phase 3?

**Phase 2 Authentication is now COMPLETE!** 🎉

Your backend now includes:
- ✅ Complete user authentication system
- ✅ JWT token management with refresh tokens
- ✅ Role-based access control (customer/admin/seller/moderator)
- ✅ Email verification and password reset
- ✅ User profile and address management
- ✅ Input validation and security features
- ✅ Professional email templates
- ✅ Admin user management tools

**Next Phase Available:**
- **Phase 3 - Product Management**: Product CRUD, categories, search, images, inventory
- **Phase 4 - Order Processing**: Shopping cart, order management, inventory tracking
- **Phase 5 - Payment Integration**: Stripe payments, order confirmation, receipts

Ready to continue with Phase 3 (Product Management)?