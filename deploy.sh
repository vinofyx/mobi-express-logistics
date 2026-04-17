#!/bin/bash

# MobiExpress Deployment Script
# This script helps deploy the full-stack application

echo "🚀 MobiExpress Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "backend" ] && [ ! -d "trackwell-system" ]; then
    print_error "Please run this script from the MobiExpress root directory"
    exit 1
fi

print_status "Found MobiExpress project structure"

# Step 1: Git Repository Setup
echo ""
echo "📋 Step 1: Git Repository Setup"
echo "--------------------------------"

if [ ! -d ".git" ]; then
    print_warning "Git repository not found. Initializing..."
    git init
    print_status "Git repository initialized"
else
    print_status "Git repository already exists"
fi

# Check if remote origin exists
if ! git remote get-url origin &> /dev/null; then
    print_warning "No remote origin found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/mobiexpress-logistics.git"
    echo "   git push -u origin main"
    echo ""
    read -p "Press Enter to continue after setting up GitHub repository..."
else
    print_status "Remote origin found"
fi

# Step 2: Environment Variables Check
echo ""
echo "🔧 Step 2: Environment Variables Check"
echo "--------------------------------------"

# Check backend environment
if [ ! -f "backend/.env" ]; then
    print_warning "Backend .env file not found. Please create it from .env.example"
    echo "   cp backend/.env.example backend/.env"
    echo "   Then update the values with your actual configuration"
    echo ""
    read -p "Press Enter after setting up backend environment variables..."
else
    print_status "Backend .env file found"
fi

# Check frontend environment
if [ ! -f "trackwell-system/.env" ]; then
    print_warning "Frontend .env file not found. Please create it from .env.example"
    echo "   cp trackwell-system/.env.example trackwell-system/.env"
    echo "   Then update VITE_API_URL with your backend URL"
    echo ""
    read -p "Press Enter after setting up frontend environment variables..."
else
    print_status "Frontend .env file found"
fi

# Step 3: Dependencies Check
echo ""
echo "📦 Step 3: Dependencies Check"
echo "------------------------------"

# Check backend dependencies
if [ ! -d "backend/node_modules" ]; then
    print_warning "Backend dependencies not found. Installing..."
    cd backend
    npm install
    cd ..
    print_status "Backend dependencies installed"
else
    print_status "Backend dependencies already installed"
fi

# Check frontend dependencies
if [ ! -d "trackwell-system/node_modules" ]; then
    print_warning "Frontend dependencies not found. Installing..."
    cd trackwell-system
    npm install
    cd ..
    print_status "Frontend dependencies installed"
else
    print_status "Frontend dependencies already installed"
fi

# Step 4: Build Check
echo ""
echo "🏗️  Step 4: Build Check"
echo "-------------------------"

# Test frontend build
print_status "Testing frontend build..."
cd trackwell-system
npm run build
if [ $? -eq 0 ]; then
    print_status "Frontend build successful"
else
    print_error "Frontend build failed. Please fix issues before deploying."
    cd ..
    exit 1
fi
cd ..

# Step 5: Git Status and Push
echo ""
echo "📤 Step 5: Git Status and Push"
echo "------------------------------"

git status
echo ""
read -p "Do you want to commit and push changes? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "Update for deployment - $(date)"
    git push origin main
    print_status "Changes pushed to GitHub"
fi

# Step 6: Deployment Instructions
echo ""
echo "🚀 Step 6: Deployment Instructions"
echo "----------------------------------"

echo "Backend Deployment (Render):"
echo "1. Go to https://render.com"
echo "2. Connect your GitHub repository"
echo "3. Create new Web Service with:"
echo "   - Root Directory: backend"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Environment Variables: See backend/.env.example"
echo ""

echo "Frontend Deployment (Vercel):"
echo "1. Go to https://vercel.com"
echo "2. Connect your GitHub repository"
echo "3. Configure with:"
echo "   - Root Directory: trackwell-system"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo "   - Environment Variables: VITE_API_URL=your-backend-url"
echo ""

echo "Database Setup (MongoDB Atlas):"
echo "1. Go to https://www.mongodb.com/atlas"
echo "2. Create free cluster"
echo "3. Create database user"
echo "4. Configure network access (0.0.0.0/0)"
echo "5. Get connection string and update environment variables"
echo ""

echo "🎉 Deployment guide completed!"
echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo "🔗 Live URLs will be available after deployment:"
echo "   Frontend: https://your-app.vercel.app"
echo "   Backend: https://your-app.onrender.com"
echo "   API Docs: https://your-app.onrender.com/health"
