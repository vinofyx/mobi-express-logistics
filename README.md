# MobiExpress - Logistics Management System

A comprehensive logistics management system with role-based access control, shipment tracking, pickup management, and real-time parcel tracking.

## 🚀 Features

### Core Functionality
- **User Authentication** - Login, registration, role-based access
- **Shipment Management** - Create, track, and manage shipments
- **Pickup Management** - Schedule and manage pickups
- **Parcel Tracking** - Real-time tracking with status updates
- **Admin Dashboard** - Comprehensive management interface

### User Roles
- **Admin** - Full system access and user management
- **Agent** - Field operations and pickup management
- **Center Staff** - Hub operations and parcel management
- **Customer** - Booking, tracking, and basic dashboard

## 🛠️ Tech Stack

### Frontend
- **React** - Modern UI framework
- **TanStack Router** - Type-safe routing
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - Component library
- **Axios** - HTTP client
- **React Hook Form** - Form management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Joi** - Input validation

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Database hosting

## 📦 Project Structure

```
MobiExpress/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth and validation
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── validators/      # Input validation
│   └── package.json
├── trackwell-system/        # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities and services
│   │   └── routes/          # Route definitions
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- GitHub account
- Vercel account
- Render account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mobiexpress.git
   cd mobiexpress
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../trackwell-system
   npm install
   ```

### Environment Setup

1. **Backend Environment Variables**
   Create `backend/.env`:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_REFRESH_EXPIRES_IN=7d
   CLIENT_URL=https://your-frontend-domain.vercel.app
   ```

2. **Frontend Environment Variables**
   Create `trackwell-system/.env`:
   ```env
   VITE_API_URL=https://your-backend-domain.onrender.com
   ```

## 🌐 Deployment

### Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set environment variables
4. Deploy from the `main` branch
5. Configure health check: `/health`

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set the root directory to `trackwell-system`
3. Configure environment variables
4. Deploy from the `main` branch

### Database Setup (MongoDB Atlas)
1. Create a new cluster
2. Configure network access (allow all IPs for deployment)
3. Create a database user
4. Get the connection string
5. Update environment variables

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Shipment Endpoints
- `GET /api/shipments` - Get all shipments
- `POST /api/shipments` - Create new shipment
- `GET /api/shipments/:id` - Get shipment by ID
- `PUT /api/shipments/:id/status` - Update shipment status

### Pickup Endpoints
- `GET /api/pickups` - Get all pickups
- `POST /api/pickups` - Create new pickup
- `PUT /api/pickups/:id/status` - Update pickup status

### Tracking Endpoints
- `GET /api/parcels/track/:trackingId` - Track parcel
- `GET /api/shipments/track/:shipmentId` - Track shipment

## 🎯 Demo Accounts

### Pre-configured Users
- **Admin**: `admin@example.com` / `admin123`
- **Agent**: `agent@example.com` / `agent123`
- **Customer**: `customer@example.com` / `customer123`
- **Staff**: `staff@example.com` / `staff123`

## 🔧 Development

### Running Locally
1. **Start backend**
   ```bash
   cd backend
   npm start
   ```

2. **Start frontend**
   ```bash
   cd trackwell-system
   npm run dev
   ```

### Testing
- **Backend Tests**: `npm test` (in backend directory)
- **Frontend Tests**: `npm test` (in frontend directory)

## 📊 Features by Role

### Admin Features
- User management
- Full dashboard access
- Shipment creation and management
- System analytics
- Role assignment

### Agent Features
- Pickup management
- Field operations
- Limited dashboard access
- Shipment tracking

### Center Staff Features
- Parcel management
- Hub operations
- Status updates
- Limited dashboard access

### Customer Features
- Booking pickups
- Tracking parcels
- Basic dashboard
- Order history

## 🛡️ Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation with Joi
- CORS configuration
- Environment variable protection

## 📱 Mobile Responsiveness

- Responsive design for all screen sizes
- Touch-friendly interfaces
- Mobile-optimized forms
- Progressive Web App ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, please contact:
- Email: support@mobiexpress.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/mobiexpress/issues)

---

**Live Application**: [https://your-frontend-domain.vercel.app](https://your-frontend-domain.vercel.app)
**API Documentation**: [https://your-backend-domain.onrender.com](https://your-backend-domain.onrender.com)

---

*Built with ❤️ for logistics management*
