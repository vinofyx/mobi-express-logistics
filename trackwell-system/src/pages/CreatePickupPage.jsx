import React, { useState } from 'react';
import { pickupApi } from '../api/pickupApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, AlertCircle, Clock, MapPin, User, Phone } from 'lucide-react';

const CreatePickupPage = () => {
  // State design - exactly as specified
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    pickupDate: '',
    pickupTime: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  // Validation rules - exactly as specified
  const validate = () => {
    const newErrors = {};
    
    // name - required, min 2 chars
    if (!form.name || form.name.trim().length < 2) {
      newErrors.name = 'Name is required and must be at least 2 characters';
    }
    
    // phone - required, must match /^[6-9]\d{9}$/ (10-digit Indian mobile)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!form.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(form.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number starting with 6-9';
    }
    
    // address - required, min 5 chars
    if (!form.address || form.address.trim().length < 5) {
      newErrors.address = 'Address is required and must be at least 5 characters';
    }
    
    // pickupDate - required, must not be in the past
    if (!form.pickupDate) {
      newErrors.pickupDate = 'Pickup date is required';
    } else {
      const selectedDate = new Date(form.pickupDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for fair comparison
      
      if (selectedDate < today) {
        newErrors.pickupDate = 'Pickup date cannot be in the past';
      }
    }
    
    // pickupTime - required, must match HH:MM format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!form.pickupTime) {
      newErrors.pickupTime = 'Pickup time is required';
    } else if (!timeRegex.test(form.pickupTime)) {
      newErrors.pickupTime = 'Please enter a valid time in HH:MM format (e.g., 14:30)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form field handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Reset form after successful submission
  const resetForm = () => {
    setForm({
      name: '',
      phone: '',
      address: '',
      pickupDate: '',
      pickupTime: ''
    });
    setErrors({});
  };

  // API call flow - exactly as specified
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous API error
    setApiError('');
    
    // Validate first
    if (!validate()) {
      return; // Stop, show per-field errors
    }
    
    setLoading(true);
    
    try {
      // API call
      const response = await pickupApi.create(form);
      
      if (response.status === 201) {
        // Success case
        setSuccess(true);
        resetForm();
        // Hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (error) {
      // Error case
      setApiError(error.message || 'Failed to create pickup request');
    } finally {
      // Always runs - critical for button state
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Schedule a Pickup
            </CardTitle>
            <CardDescription className="text-blue-100">
              Fill in the details below to schedule a pickup request
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Success Banner */}
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Pickup request created successfully! We'll contact you shortly to confirm the details.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Banner */}
            {apiError && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {apiError}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter customer name"
                  value={form.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'border-red-500' : ''}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={form.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'border-red-500' : ''}
                  disabled={loading}
                  maxLength={10}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
                <p className="text-xs text-gray-500">Format: 10-digit Indian mobile number (e.g., 9876543210)</p>
              </div>

              {/* Pickup Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Pickup Address *
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Enter complete pickup address"
                  value={form.address}
                  onChange={handleInputChange}
                  className={errors.address ? 'border-red-500' : ''}
                  disabled={loading}
                />
                {errors.address && (
                  <p className="text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              {/* Pickup Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickupDate" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pickup Date *
                  </Label>
                  <Input
                    id="pickupDate"
                    name="pickupDate"
                    type="date"
                    value={form.pickupDate}
                    onChange={handleInputChange}
                    className={errors.pickupDate ? 'border-red-500' : ''}
                    disabled={loading}
                    min={today}
                  />
                  {errors.pickupDate && (
                    <p className="text-sm text-red-600">{errors.pickupDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupTime" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pickup Time *
                  </Label>
                  <Input
                    id="pickupTime"
                    name="pickupTime"
                    type="time"
                    value={form.pickupTime}
                    onChange={handleInputChange}
                    className={errors.pickupTime ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.pickupTime && (
                    <p className="text-sm text-red-600">{errors.pickupTime}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Pickup Request...
                    </>
                  ) : (
                    'Create Pickup Request'
                  )}
                </Button>
              </div>
            </form>

            {/* Help Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Need Help?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>â¢ Pickup requests are typically confirmed within 24 hours</li>
                <li>â¢ You'll receive a confirmation call/SMS before pickup</li>
                <li>â¢ Make sure the package is ready at the scheduled time</li>
                <li>â¢ For urgent pickups, call our helpline: 1800-XXX-XXXX</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePickupPage;
