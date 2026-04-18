import React, { useState, useEffect } from 'react';
import { pickupApi } from '../api/pickupApi';
import { parcelsAPI, shipmentsAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  User, 
  Phone,
  RefreshCw,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  // State variables for data
  const [pickups, setPickups] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [shipments, setShipments] = useState([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setError('');
      
      // Fetch all data in parallel
      const [pickupsResponse, parcelsResponse, shipmentsResponse] = await Promise.all([
        pickupApi.getAll(),
        parcelsAPI.getAll(),
        shipmentsAPI.getAll()
      ]);

      // Extract data from responses with better error handling
      const pickupsData = Array.isArray(pickupsResponse.data?.data) ? pickupsResponse.data.data : [];
      const parcelsData = Array.isArray(parcelsResponse.data?.data) ? parcelsResponse.data.data : [];
      const shipmentsData = Array.isArray(shipmentsResponse.data?.data) ? shipmentsResponse.data.data : [];

      console.log('Dashboard data fetched:', { pickupsData, parcelsData, shipmentsData });

      setPickups(pickupsData);
      setParcels(parcelsData);
      setShipments(shipmentsData);
      
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
      // Set empty arrays on error to prevent map errors
      setPickups([]);
      setParcels([]);
      setShipments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  // Calculate summary statistics with safe array operations
  const stats = {
    totalPickups: (pickups || []).length,
    totalParcels: (parcels || []).length,
    totalShipments: (shipments || []).length,
    pendingPickups: (pickups || []).filter(p => p?.status === 'Pending').length,
    inTransitParcels: (parcels || []).filter(p => p?.status === 'In Transit').length,
    activeShipments: (shipments || []).filter(s => s?.status && ['Created', 'Dispatched', 'In Transit'].includes(s.status)).length
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'pending':
        case 'created':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'confirmed':
        case 'picked':
        case 'dispatched':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'in transit':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'delivered':
        case 'received':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelled':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <Badge className={`text-xs font-medium ${getStatusColor(status)}`}>
        {status || 'Unknown'}
      </Badge>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Logistics system overview and management</p>
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-blue-900">{stats.totalPickups}</p>
                <p className="text-sm text-blue-700">Total Pickups</p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.pendingPickups} pending
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-purple-900">{stats.totalParcels}</p>
                <p className="text-sm text-purple-700">Total Parcels</p>
                <p className="text-xs text-purple-600 mt-1">
                  {stats.inTransitParcels} in transit
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-green-900">{stats.totalShipments}</p>
                <p className="text-sm text-green-700">Total Shipments</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.activeShipments} active
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Pickups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Recent Pickups
              </CardTitle>
              <CardDescription>
                Latest pickup requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(!pickups || pickups.length === 0) ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No pickups found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(pickups || []).slice(0, 5).map((pickup) => (
                    <div key={pickup._id || pickup.pickupId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{pickup.customer?.name || pickup.name}</span>
                            <StatusBadge status={pickup.status} />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {pickup.customer?.phone || pickup.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {pickup.pickupDate} {pickup.pickupTime}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {pickup.customer?.address || pickup.address}
                          </div>
                        </div>
                      </div>
                      {pickup.pickupId && (
                        <div className="text-xs text-gray-500 mt-2">
                          ID: {pickup.pickupId}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Shipments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Recent Shipments
              </CardTitle>
              <CardDescription>
                Latest shipment updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(!shipments || shipments.length === 0) ? (
                <div className="text-center py-8 text-gray-500">
                  <Truck className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No shipments found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(shipments || []).slice(0, 5).map((shipment) => (
                    <div key={shipment._id || shipment.shipmentId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-medium">
                              {shipment.shipmentId}
                            </span>
                            <StatusBadge status={shipment.status} />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">From:</span> {shipment.originHub}
                            </div>
                            <div>
                              <span className="font-medium">To:</span> {shipment.destinationHub}
                            </div>
                          </div>
                          {shipment.parcels && shipment.parcels.length > 0 && (
                            <div className="text-sm text-gray-600 mt-1">
                              <Package className="h-3 w-3 inline mr-1" />
                              {shipment.parcels.length} parcel(s)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Created: {format(new Date(shipment.createdAt), 'PPp')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Pickups</p>
                <p className="text-lg font-semibold">{stats.pendingPickups}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-lg font-semibold">{stats.inTransitParcels}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-lg font-semibold">
                  {(parcels || []).filter(p => p?.status === 'Delivered').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Shipments</p>
                <p className="text-lg font-semibold">{stats.activeShipments}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
