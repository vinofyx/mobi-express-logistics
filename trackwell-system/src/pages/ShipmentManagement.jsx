import React, { useState, useEffect } from 'react';
import { shipmentsAPI, parcelsAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Package, 
  Truck, 
  Plus, 
  Edit, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Clock,
  RefreshCw,
  ArrowRight,
  Save,
  X
} from 'lucide-react';
import { format } from 'date-fns';

const ShipmentManagement = () => {
  // State for shipments list
  const [shipments, setShipments] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // State for shipment creation form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    originHub: '',
    destinationHub: '',
    expectedArrival: '',
    selectedParcels: []
  });
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);

  // State for status update
  const [updatingShipment, setUpdatingShipment] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      setError('');
      const [shipmentsResponse, parcelsResponse] = await Promise.all([
        shipmentsAPI.getAll(),
        parcelsAPI.getAll()
      ]);

      setShipments(shipmentsResponse.data?.data || []);
      setParcels(parcelsResponse.data?.data || []);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  // Validate create form
  const validateCreateForm = () => {
    const errors = {};
    
    if (!createForm.originHub.trim()) {
      errors.originHub = 'Origin hub is required';
    }
    
    if (!createForm.destinationHub.trim()) {
      errors.destinationHub = 'Destination hub is required';
    }
    
    if (createForm.originHub === createForm.destinationHub) {
      errors.destinationHub = 'Destination hub must be different from origin hub';
    }
    
    if (!createForm.expectedArrival) {
      errors.expectedArrival = 'Expected arrival date is required';
    } else {
      const selectedDate = new Date(createForm.expectedArrival);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        errors.expectedArrival = 'Expected arrival must be in the future';
      }
    }
    
    if (createForm.selectedParcels.length === 0) {
      errors.selectedParcels = 'Please select at least one parcel';
    }
    
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle parcel selection
  const handleParcelSelection = (parcelId, checked) => {
    setCreateForm(prev => ({
      ...prev,
      selectedParcels: checked
        ? [...prev.selectedParcels, parcelId]
        : prev.selectedParcels.filter(id => id !== parcelId)
    }));
    
    // Clear error when parcels are selected
    if (createErrors.selectedParcels) {
      setCreateErrors(prev => ({ ...prev, selectedParcels: '' }));
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setCreateForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (createErrors[field]) {
      setCreateErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Create shipment
  const handleCreateShipment = async (e) => {
    e.preventDefault();
    
    if (!validateCreateForm()) {
      return;
    }
    
    setCreating(true);
    
    try {
      const shipmentData = {
        originHub: createForm.originHub,
        destinationHub: createForm.destinationHub,
        expectedArrival: createForm.expectedArrival,
        parcelIds: createForm.selectedParcels
      };
      
      const response = await shipmentsAPI.create(shipmentData);
      
      if (response.status === 201) {
        // Reset form and close
        setCreateForm({
          originHub: '',
          destinationHub: '',
          expectedArrival: '',
          selectedParcels: []
        });
        setCreateErrors({});
        setShowCreateForm(false);
        
        // Refresh data
        await fetchData();
        
        // Show success message (you could add a toast here)
        console.log('Shipment created successfully');
      }
    } catch (err) {
      console.error('Create shipment error:', err);
      setError(err.message || 'Failed to create shipment');
    } finally {
      setCreating(false);
    }
  };

  // Update shipment status
  const handleUpdateStatus = async (shipmentId, newStatus) => {
    setUpdatingShipment(shipmentId);
    setUpdatingStatus(true);
    
    try {
      await shipmentsAPI.updateStatus(shipmentId, newStatus);
      
      // Refresh data
      await fetchData();
      
      // Show success message
      console.log(`Shipment ${shipmentId} status updated to ${newStatus}`);
    } catch (err) {
      console.error('Update status error:', err);
      setError(err.message || 'Failed to update shipment status');
    } finally {
      setUpdatingShipment(null);
      setUpdatingStatus(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'created':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'dispatched':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'in transit':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'received':
          return 'bg-green-100 text-green-800 border-green-200';
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

  // Get available status transitions
  const getNextStatuses = (currentStatus) => {
    const transitions = {
      'Created': ['Dispatched'],
      'Dispatched': ['In Transit'],
      'In Transit': ['Received'],
      'Received': []
    };
    return transitions[currentStatus] || [];
  };

  // Filter available parcels (not already in shipment)
  const availableParcels = parcels.filter(parcel => 
    !parcel.shipmentId || parcel.status !== 'In Transit'
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Shipment Management</h1>
            <p className="text-gray-600 mt-1">Create and manage shipments</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Shipment
            </Button>
          </div>
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

        {/* Create Shipment Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Shipment
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Select origin, destination, and parcels to create a new shipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateShipment} className="space-y-6">
                  {/* Origin and Destination */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="originHub">Origin Hub *</Label>
                      <Input
                        id="originHub"
                        placeholder="e.g., HYD, BLR, DEL"
                        value={createForm.originHub}
                        onChange={(e) => handleInputChange('originHub', e.target.value.toUpperCase())}
                        className={createErrors.originHub ? 'border-red-500' : ''}
                      />
                      {createErrors.originHub && (
                        <p className="text-sm text-red-600">{createErrors.originHub}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="destinationHub">Destination Hub *</Label>
                      <Input
                        id="destinationHub"
                        placeholder="e.g., BLR, DEL, MUM"
                        value={createForm.destinationHub}
                        onChange={(e) => handleInputChange('destinationHub', e.target.value.toUpperCase())}
                        className={createErrors.destinationHub ? 'border-red-500' : ''}
                      />
                      {createErrors.destinationHub && (
                        <p className="text-sm text-red-600">{createErrors.destinationHub}</p>
                      )}
                    </div>
                  </div>

                  {/* Expected Arrival */}
                  <div className="space-y-2">
                    <Label htmlFor="expectedArrival">Expected Arrival *</Label>
                    <Input
                      id="expectedArrival"
                      type="datetime-local"
                      value={createForm.expectedArrival}
                      onChange={(e) => handleInputChange('expectedArrival', e.target.value)}
                      className={createErrors.expectedArrival ? 'border-red-500' : ''}
                    />
                    {createErrors.expectedArrival && (
                      <p className="text-sm text-red-600">{createErrors.expectedArrival}</p>
                    )}
                  </div>

                  {/* Parcel Selection */}
                  <div className="space-y-2">
                    <Label>Select Parcels *</Label>
                    {createErrors.selectedParcels && (
                      <p className="text-sm text-red-600">{createErrors.selectedParcels}</p>
                    )}
                    
                    {availableParcels.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 border rounded-lg">
                        <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No available parcels for shipment</p>
                        <p className="text-sm">All parcels are already in transit or delivered</p>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
                        {availableParcels.map((parcel) => (
                          <div key={parcel._id} className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50">
                            <Checkbox
                              id={`parcel-${parcel._id}`}
                              checked={createForm.selectedParcels.includes(parcel._id)}
                              onCheckedChange={(checked) => handleParcelSelection(parcel._id, checked)}
                            />
                            <div className="flex-1 min-w-0">
                              <label 
                                htmlFor={`parcel-${parcel._id}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {parcel.trackingId}
                              </label>
                              <div className="text-xs text-gray-600 mt-1">
                                <div>From: {parcel.pickupAddress?.city}</div>
                                <div>To: {parcel.destinationAddress?.city}</div>
                                <div>Recipient: {parcel.recipientName}</div>
                              </div>
                              <StatusBadge status={parcel.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Parcels Summary */}
                  {createForm.selectedParcels.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            Selected Parcels: {createForm.selectedParcels.length}
                          </p>
                          <p className="text-xs text-blue-600">
                            {createForm.selectedParcels.map(id => {
                              const parcel = availableParcels.find(p => p._id === id);
                              return parcel?.trackingId;
                            }).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={creating || availableParcels.length === 0}
                      className="flex items-center gap-2"
                    >
                      {creating ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Create Shipment
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Shipments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Active Shipments
            </CardTitle>
            <CardDescription>
              Manage and update shipment statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {shipments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Truck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No shipments found</h3>
                <p className="text-sm mb-4">Create your first shipment to get started</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Shipment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {shipments.map((shipment) => (
                  <div key={shipment._id || shipment.shipmentId} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold font-mono">
                            {shipment.shipmentId}
                          </h3>
                          <StatusBadge status={shipment.status} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <div>
                              <span className="font-medium">From:</span> {shipment.originHub}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 text-gray-500" />
                            <div>
                              <span className="font-medium">To:</span> {shipment.destinationHub}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <div>
                              <span className="font-medium">Parcels:</span> {shipment.parcels?.length || 0}
                            </div>
                          </div>
                        </div>

                        {shipment.expectedArrival && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                            <Clock className="h-4 w-4" />
                            <span>Expected: {format(new Date(shipment.expectedArrival), 'PPp')}</span>
                          </div>
                        )}

                        {shipment.parcels && shipment.parcels.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Included Parcels:</p>
                            <div className="flex flex-wrap gap-2">
                              {shipment.parcels.map((parcel) => (
                                <Badge key={parcel.trackingId} variant="outline" className="text-xs">
                                  {parcel.trackingId}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status Update Actions */}
                      <div className="flex flex-col gap-2">
                        <div className="text-sm text-gray-600">
                          Created: {format(new Date(shipment.createdAt), 'PPp')}
                        </div>
                        
                        {getNextStatuses(shipment.status).length > 0 && (
                          <div className="flex gap-2">
                            {getNextStatuses(shipment.status).map((nextStatus) => (
                              <Button
                                key={nextStatus}
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(shipment._id, nextStatus)}
                                disabled={updatingShipment === shipment._id}
                                className="text-xs"
                              >
                                {updatingShipment === shipment._id && updatingStatus ? (
                                  <>
                                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                    Updating...
                                  </>
                                ) : (
                                  `Mark as ${nextStatus}`
                                )}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShipmentManagement;
