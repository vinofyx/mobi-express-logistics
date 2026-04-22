# MobiExpress Logistics Management System

A comprehensive logistics management platform with customer management, pickup scheduling, parcel tracking, and shipment coordination.

## 🚀 Features

### **Customer Management**
- **B2B/B2C Support**: Handle both business and individual customers
- **Advanced Validation**: Phone, email, pincode validation
- **Real-time Search**: Multi-field customer search
- **Status Management**: Active/inactive customer tracking
- **Address Management**: Complete address structure

### **Pickup Management**
- **Customer Lookup**: Phone-based customer identification
- **Address Auto-fill**: Auto-populate customer addresses
- **Scheduling System**: Date and time selection
- **Type Classification**: Delivery and parcel type options
- **Status Tracking**: Complete pickup workflow

### **Parcel Management**
- **Real-time Tracking**: Public and private tracking
- **Status Management**: Multiple parcel statuses
- **Type Classification**: Document, parcel, fragile, electronics, bulk
- **COD Support**: Cash on delivery handling
- **Search & Filter**: Advanced parcel search

### **Shipment Management**
- **Hub-to-Hub Logistics**: Complete shipment workflow
- **Vehicle Management**: Driver and vehicle tracking
- **Route Planning**: Origin and destination hub management
- **Status Transitions**: Validated status changes
- **Parcel Assignment**: Link parcels to shipments

### **Authentication System**
- **JWT-based Security**: Secure token authentication
- **Role-based Access**: Admin, customer, agent roles
- **Token Management**: Access and refresh tokens
- **Session Management**: Secure session handling

## 🛠️ Tech Stack

### **Frontend**
- **React 18**: Modern React with hooks
- **Vite**: Fast development and build tool
- **CSS-in-JS**: Inline styling approach
- **Axios**: HTTP client with interceptors
- **Redux Toolkit**: State management

### **Backend**
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing

### **Development Tools**
- **PowerShell**: Command line interface
- **Git**: Version control
- **VS Code**: Development environment
- **Postman**: API testing

## 📋 Installation & Setup

### **Prerequisites**
- Node.js 16+
- MongoDB database
- Git

### **Backend Setup**
```bash
cd server
npm install
cp .env.example .env
# Configure MongoDB connection and JWT secrets
npm start
```

### **Frontend Setup**
```bash
cd client
npm install
npm run dev
```

### **Environment Variables**
```env
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/mobiexpress
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
NODE_ENV=development

# Frontend (.env)
VITE_API_URL=http://localhost:5000/api
```

## 🌐 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Token refresh
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### **Customers**
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### **Pickups**
- `GET /api/pickups` - List pickups
- `POST /api/pickups` - Create pickup
- `GET /api/pickups/:id` - Get pickup
- `PUT /api/pickups/:id` - Update pickup
- `DELETE /api/pickups/:id` - Delete pickup

### **Parcels**
- `GET /api/parcels` - List parcels
- `POST /api/parcels` - Create parcel
- `GET /api/parcels/:id` - Get parcel
- `GET /api/parcels/track/:trackingId` - Public tracking
- `PUT /api/parcels/:id` - Update parcel
- `DELETE /api/parcels/:id` - Delete parcel

### **Shipments**
- `GET /api/shipments` - List shipments
- `POST /api/shipments` - Create shipment
- `GET /api/shipments/:id` - Get shipment
- `PATCH /api/shipments/:id/status` - Update status
- `DELETE /api/shipments/:id` - Delete shipment

## 🏗️ Project Structure

```
MobiExpress/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── lib/          # API and utilities
│   │   ├── store/        # Redux store
│   │   └── components/   # Reusable components
│   ├── package.json
│   └── vite.config.js
├── server/                # Node.js backend
│   ├── src/
│   │   ├── modules/     # Feature modules
│   │   ├── shared/      # Shared utilities
│   │   ├── middleware/   # Express middleware
│   │   └── server.js     # Server entry
│   ├── package.json
│   └── .env.example
├── docs/                 # Documentation
└── README.md
```

## 🚀 Deployment

### **Frontend Deployment**
```bash
cd client
npm run build
# Deploy dist/ folder to your hosting service
```

### **Backend Deployment**
```bash
cd server
npm install --production
npm start
# Configure production environment variables
```

## 📊 Database Schema

### **Customers**
- Personal and business information
- Address details
- Contact information
- B2B/B2C classification
- Active status tracking

### **Pickups**
- Customer references
- Pickup addresses
- Scheduling information
- Status workflow
- Agent assignment

### **Parcels**
- Tracking information
- Type and weight details
- Status history
- COD support
- Shipment linking

### **Shipments**
- Vehicle and driver details
- Hub-to-hub routing
- Status transitions
- Parcel assignments
- Route planning

## 🔧 Development Workflow

### **1. Backend Development**
```bash
cd server
npm run dev  # Start with nodemon
```

### **2. Frontend Development**
```bash
cd client
npm run dev  # Start Vite dev server
```

### **3. API Testing**
```bash
# Use PowerShell or Postman
# Test endpoints with provided examples
```

## 📱 Features Overview

### **Real-time Capabilities**
- Live status updates
- Real-time search
- Instant form validation
- Dynamic UI updates

### **User Experience**
- Responsive design
- Modern UI components
- Intuitive navigation
- Error handling

### **Data Management**
- Comprehensive validation
- Secure authentication
- Efficient queries
- Proper indexing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**MobiExpress Logistics Management System** - Complete logistics solution for modern businesses.
