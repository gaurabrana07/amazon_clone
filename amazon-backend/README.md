# 🛒 Amazon Clone - Backend API

A comprehensive e-commerce backend system built with Node.js, Express, and MongoDB, designed to power a full-featured Amazon clone.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based auth with role management
- **Product Management** - Complete CRUD operations with advanced filtering
- **Shopping Cart & Wishlist** - Persistent cart and wishlist functionality
- **Order Management** - Full order lifecycle from creation to delivery
- **Payment Processing** - Multiple payment gateways (Stripe, PayPal)
- **Reviews & Ratings** - User review system with rating aggregation
- **Search & Recommendations** - Elasticsearch-powered search with ML recommendations

### Advanced Features
- **Real-time Updates** - Socket.IO for live notifications and updates
- **Caching System** - Redis-based caching for improved performance
- **File Upload** - Cloudinary integration for image management
- **Analytics** - Comprehensive business analytics and reporting
- **Security** - Advanced security measures and rate limiting
- **API Documentation** - Swagger/OpenAPI documentation

## 🏗️ Architecture

```
amazon-backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # MongoDB configuration
│   │   ├── redis.js      # Redis configuration
│   │   └── cloudinary.js # File upload configuration
│   ├── controllers/      # Route controllers
│   │   ├── auth.js       # Authentication controller
│   │   ├── products.js   # Product management
│   │   ├── orders.js     # Order management
│   │   └── users.js      # User management
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js       # Authentication middleware
│   │   ├── validation.js # Input validation
│   │   └── errorHandler.js # Error handling
│   ├── models/          # Database models
│   │   ├── User.js       # User model
│   │   ├── Product.js    # Product model
│   │   ├── Order.js      # Order model
│   │   └── Review.js     # Review model
│   ├── routes/          # API routes
│   │   ├── auth.js       # Authentication routes
│   │   ├── products.js   # Product routes
│   │   ├── orders.js     # Order routes
│   │   └── users.js      # User routes
│   ├── services/        # Business logic
│   │   ├── email.js      # Email service
│   │   ├── payment.js    # Payment service
│   │   └── search.js     # Search service
│   ├── utils/           # Utility functions
│   │   ├── logger.js     # Logging utility
│   │   ├── helpers.js    # Helper functions
│   │   └── constants.js  # Application constants
│   └── validators/      # Input validation
│       ├── auth.js       # Auth validation
│       ├── product.js    # Product validation
│       └── order.js      # Order validation
├── tests/               # Test suites
├── docs/               # API documentation
├── scripts/            # Deployment scripts
└── docker/             # Docker configuration
```

## 🛠️ Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Cache:** Redis
- **Search:** Elasticsearch
- **Authentication:** JWT
- **File Storage:** Cloudinary
- **Payment:** Stripe, PayPal
- **Real-time:** Socket.IO
- **Testing:** Jest, Supertest
- **Documentation:** Swagger/OpenAPI

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (v5.0 or higher)
- **Redis** (v6.0 or higher)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd amazon-backend

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Required Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/amazon_clone

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 4. Start the Application

```bash
# Development mode
npm run dev

# Production mode
npm start

# Run tests
npm test
```

## 📚 API Documentation

Once the server is running, you can access:

- **API Documentation:** `http://localhost:5000/api/docs`
- **Health Check:** `http://localhost:5000/health`
- **API Status:** `http://localhost:5000/api/status`

## 🔗 API Endpoints

### Authentication
```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/logout       # User logout
POST   /api/auth/refresh      # Refresh token
POST   /api/auth/forgot       # Forgot password
POST   /api/auth/reset        # Reset password
```

### Products
```
GET    /api/products          # Get all products
GET    /api/products/:id      # Get single product
POST   /api/products          # Create product (admin)
PUT    /api/products/:id      # Update product
DELETE /api/products/:id      # Delete product
GET    /api/products/search   # Search products
```

### Orders
```
GET    /api/orders            # Get user orders
POST   /api/orders            # Create order
GET    /api/orders/:id        # Get order details
PUT    /api/orders/:id/cancel # Cancel order
```

### Users
```
GET    /api/users/profile     # Get user profile
PUT    /api/users/profile     # Update profile
GET    /api/users/orders      # Get user orders
GET    /api/users/wishlist    # Get wishlist
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```

## 🐳 Docker Support

```bash
# Build Docker image
npm run docker:build

# Run with Docker
npm run docker:run

# Using docker-compose
docker-compose up -d
```

## 📊 Monitoring & Logging

The application includes comprehensive logging:

- **Error Logs:** `logs/error.log`
- **Combined Logs:** `logs/combined.log`
- **Access Logs:** `logs/access.log`

### Log Levels
- `error`: Error conditions
- `warn`: Warning conditions
- `info`: Informational messages
- `debug`: Debug-level messages

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request rate limiting
- **Input Validation** - Request validation
- **JWT Authentication** - Secure authentication
- **Password Hashing** - Bcrypt password hashing
- **SQL Injection Protection** - Mongoose ODM

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - [ ] Set `NODE_ENV=production`
   - [ ] Configure production database
   - [ ] Set secure JWT secrets
   - [ ] Configure email service
   - [ ] Set up file storage

2. **Security**
   - [ ] Enable HTTPS
   - [ ] Configure firewall
   - [ ] Set up monitoring
   - [ ] Configure backups

3. **Performance**
   - [ ] Enable compression
   - [ ] Configure caching
   - [ ] Set up CDN
   - [ ] Database indexing

### Deployment Options

- **AWS EC2** with PM2
- **Heroku** with add-ons
- **Docker** containers
- **DigitalOcean** droplets
- **Google Cloud Platform**

## 📈 Performance Optimization

- **Database Indexing** - Optimized queries
- **Redis Caching** - Frequently accessed data
- **Compression** - Gzip compression
- **Connection Pooling** - Database connections
- **Load Balancing** - Multiple server instances

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Documentation:** `/api/docs`
- **Issues:** GitHub Issues
- **Email:** support@amazon-clone.com

## 🎯 Roadmap

### Phase 1: ✅ Foundation (Completed)
- [x] Project setup and configuration
- [x] Database connections
- [x] Basic middleware and error handling
- [x] Logging system

### Phase 2: 🚧 Authentication (In Progress)
- [ ] User registration and login
- [ ] JWT token management
- [ ] Password reset functionality
- [ ] Email verification

### Phase 3: 📋 Planned Features
- [ ] Product management system
- [ ] Shopping cart functionality
- [ ] Order management
- [ ] Payment integration
- [ ] Search and recommendations
- [ ] Admin dashboard

---

**Built with ❤️ by [Your Name]**