# 🚀 Deployment Guide - MobiExpress Logistics System

## **Status: Ready for Deployment**

---

## **📋 Deployment Checklist**

### ✅ **Completed**
- [x] Git repository initialized
- [x] Code committed to local repository
- [x] Project structure optimized for deployment

### 🔄 **In Progress**
- [ ] GitHub repository setup
- [ ] MongoDB Atlas configuration
- [ ] Backend deployment (Render)
- [ ] Frontend deployment (Vercel)

---

## **🗂️ Step 1: GitHub Repository Setup**

### **Create GitHub Repository**
1. Go to [GitHub](https://github.com) and create a new repository
2. Name: `mobiexpress-logistics`
3. Description: `Complete logistics management system with authentication`
4. Set as Public (for free deployment)
5. Don't initialize with README (we have one)

### **Push to GitHub**
```bash
# Add remote origin
git remote add origin https://github.com/yourusername/mobiexpress-logistics.git

# Push to GitHub
git push -u origin main
```

---

## **🗄️ Step 2: MongoDB Atlas Setup**

### **Create MongoDB Atlas Cluster**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Create new cluster:
   - **Cloud Provider**: AWS
   - **Region**: Mumbai (ap-south-1) or nearest
   - **Cluster Tier**: M0 Sandbox (Free)

### **Configure Database Access**
1. **Create Database User**:
   - Username: `mobiexpress_user`
   - Password: Generate strong password
   - Save credentials for later

2. **Configure Network Access**:
   - Add IP: `0.0.0.0/0` (allows all IPs for deployment)
   - Or add specific deployment IPs

### **Get Connection String**
1. Go to Cluster → Connect → Connect your application
2. Copy connection string
3. Replace `<password>` with your database password
4. Format: `mongodb+srv://mobiexpress_user:<password>@cluster0.xxxxx.mongodb.net/mobiexpress`

---

## **🔧 Step 3: Backend Deployment (Render)**

### **Prepare Backend for Deployment**
1. Create `backend/Procfile`:
```web
web: node src/minimal-server.js
```

2. Create `backend/package.json` start script:
```json
{
  "scripts": {
    "start": "node src/minimal-server.js"
  }
}
```

### **Deploy to Render**
1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Click **New Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `mobiexpress-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node.js
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### **Set Environment Variables**
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://mobiexpress_user:password@cluster0.xxxxx.mongodb.net/mobiexpress
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### **Health Check**
- **Health Check Path**: `/health`
- **Auto-Deploy**: Yes (on push to main)

---

## **🎨 Step 4: Frontend Deployment (Vercel)**

### **Prepare Frontend for Deployment**
1. Update `trackwell-system/vite.config.ts`:
```typescript
export default defineConfig({
  vite: {
    server: {
      port: 8080,
      host: true,
      strictPort: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  },
});
```

2. Create `trackwell-system/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### **Deploy to Vercel**
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Click **New Project**
4. Select your GitHub repository
5. Configure:
   - **Project Name**: `mobiexpress-frontend`
   - **Root Directory**: `trackwell-system`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### **Set Environment Variables**
```env
VITE_API_URL=https://mobiexpress-backend.onrender.com
```

---

## **🔗 Step 5: CORS Configuration**

### **Update Backend CORS**
In `backend/src/minimal-server.js`:
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:8081',
    'https://mobiexpress-frontend.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## **🧪 Step 6: Testing and Verification**

### **Test Backend**
```bash
# Health check
curl https://mobiexpress-backend.onrender.com/health

# Test authentication
curl -X POST https://mobiexpress-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### **Test Frontend**
1. Visit `https://mobiexpress-frontend.vercel.app`
2. Test login with demo accounts
3. Verify dashboard functionality
4. Test role-based access

### **Test Integration**
1. Check CORS errors in browser console
2. Verify API calls work correctly
3. Test authentication flow
4. Verify real-time updates

---

## **📊 Deployment URLs**

### **Live URLs (After Deployment)**
- **Frontend**: `https://mobiexpress-frontend.vercel.app`
- **Backend**: `https://mobiexpress-backend.onrender.com`
- **API Docs**: `https://mobiexpress-backend.onrender.com/health`

### **Demo Accounts**
- **Admin**: `admin@example.com` / `admin123`
- **Agent**: `agent@example.com` / `agent123`
- **Customer**: `customer@example.com` / `customer123`
- **Staff**: `staff@example.com` / `staff123`

---

## **🔧 Troubleshooting**

### **Common Issues**

#### **Backend Deployment Issues**
- **Port**: Ensure backend listens on `process.env.PORT || 5000`
- **Database**: Check MongoDB connection string
- **Environment**: Verify all environment variables
- **Build**: Check `npm install` completes successfully

#### **Frontend Deployment Issues**
- **Build**: Ensure `npm run build` completes
- **API URL**: Check `VITE_API_URL` environment variable
- **Routing**: Verify SPA routing works
- **Assets**: Check static assets load correctly

#### **CORS Issues**
- **Origin**: Add frontend domain to CORS origins
- **Methods**: Include all HTTP methods needed
- **Headers**: Allow `Content-Type` and `Authorization`
- **Credentials**: Enable if using cookies/auth

#### **Database Issues**
- **Connection**: Check MongoDB Atlas connection string
- **Network**: Verify IP access in Atlas
- **User**: Confirm database user permissions
- **Cluster**: Ensure cluster is running

---

## **🚀 Production Optimization**

### **Backend Optimization**
- **Caching**: Implement Redis for session storage
- **Rate Limiting**: Add rate limiting middleware
- **Logging**: Set up proper logging
- **Monitoring**: Add health checks and monitoring

### **Frontend Optimization**
- **Bundle Size**: Optimize JavaScript bundle
- **Images**: Compress and optimize images
- **Caching**: Implement proper caching strategies
- **CDN**: Use CDN for static assets

---

## **📱 Mobile Deployment**

### **PWA Features**
- **Manifest**: Add PWA manifest
- **Service Worker**: Implement offline support
- **Responsive**: Ensure mobile compatibility
- **Performance**: Optimize for mobile networks

---

## **🔒 Security Checklist**

### **Production Security**
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation active
- [ ] Password hashing verified
- [ ] JWT secrets strong
- [ ] Database access restricted

---

## **📈 Monitoring and Maintenance**

### **Monitoring**
- **Uptime**: Monitor application uptime
- **Performance**: Track response times
- **Errors**: Log and monitor errors
- **Usage**: Track user activity

### **Maintenance**
- **Updates**: Regular dependency updates
- **Backups**: Database backups configured
- **Scaling**: Monitor and scale as needed
- **Security**: Regular security audits

---

## **🎯 Next Steps**

### **Post-Deployment**
1. **Analytics**: Set up Google Analytics
2. **SEO**: Optimize for search engines
3. **Performance**: Monitor and optimize
4. **User Feedback**: Collect user feedback
5. **Feature Updates**: Plan future updates

---

## **📞 Support**

### **Deployment Help**
- **GitHub**: [Create issue](https://github.com/yourusername/mobiexpress-logistics/issues)
- **Documentation**: Check this guide first
- **Community**: Ask in relevant communities
- **Email**: Contact support if needed

---

**Status**: **Ready for Production Deployment**

**Last Updated**: April 17, 2026

**Deployment Targets**: Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)
