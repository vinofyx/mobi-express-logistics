import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  MapPin, 
  BarChart3, 
  Plus, 
  Search, 
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';

const HomePage = () => {
  const stats = [
    { name: 'Total Parcels', value: '0', icon: Package, color: 'bg-blue-500' },
    { name: 'Active Shipments', value: '0', icon: Truck, color: 'bg-green-500' },
    { name: 'Pending Pickups', value: '0', icon: MapPin, color: 'bg-yellow-500' },
    { name: 'Delivered Today', value: '0', icon: CheckCircle, color: 'bg-purple-500' },
  ];

  const quickActions = [
    { 
      name: 'Add Parcel', 
      description: 'Create a new parcel shipment',
      icon: Plus, 
      href: '/parcels/new',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      name: 'Schedule Pickup', 
      description: 'Arrange a package pickup',
      icon: Clock, 
      href: '/pickups/new',
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      name: 'Track Shipment', 
      description: 'Track your package status',
      icon: Search, 
      href: '/track',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo/Brand */}
            <div className="flex items-center">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">BobbaExpress</span>
                <span className="ml-1 text-xl font-light text-gray-500">Logistics</span>
              </div>
            </div>

            {/* Right side - Navigation Links */}
            <div className="flex items-center space-x-8">
              <Link to="/auth" className="btn btn-primary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to BobbaExpress Logistics
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your complete logistics management solution. Track parcels, manage shipments, and schedule pickups all in one place.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/auth" className="btn btn-primary px-6 py-3">
              Get Started
            </Link>
            <button className="btn btn-secondary px-6 py-3">
              Learn More
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Section */}
        <div className="card mb-12">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="block p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-all duration-200 text-center group"
              >
                <div className={`inline-flex p-3 rounded-lg ${action.color} text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.name}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Parcel Management</h3>
            <p className="text-gray-600">Track and manage parcels with real-time updates and detailed status history.</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Shipment Tracking</h3>
            <p className="text-gray-600">Monitor shipments across hubs with comprehensive tracking and reporting.</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pickup Scheduling</h3>
            <p className="text-gray-600">Schedule and manage pickups with automated assignment and status updates.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
