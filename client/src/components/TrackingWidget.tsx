import React, { useState } from 'react';
import { Search, Package, Truck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { parcelsAPI, shipmentsAPI } from '@/lib/api';
import type { ShipmentStatus } from '@/lib/shipment-utils';

interface TrackingResult {
  type: 'parcel' | 'shipment';
  data: any;
}

export function TrackingWidget() {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // First try to find as a parcel using public tracking endpoint
      const parcelResponse = await parcelsAPI.track(trackingId.trim());
      if (parcelResponse.data.success && parcelResponse.data.data) {
        setResult({
          type: 'parcel',
          data: parcelResponse.data.data
        });
        return;
      }

      // If not found as parcel, try as shipment
      const shipmentResponse = await shipmentsAPI.track(trackingId.trim());
      if (shipmentResponse.data.success && shipmentResponse.data.data) {
        setResult({
          type: 'shipment',
          data: shipmentResponse.data.data
        });
        return;
      }

      setError('Tracking number not found');
    } catch (err) {
      setError('Failed to track. Please try again.');
      console.error('Tracking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg border">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Track Package</h3>
      </div>

      <form onSubmit={handleTrack} className="space-y-4">
        <div className="relative">
          <Input
            placeholder="Enter tracking number (e.g., LMS-HYD-20260417-XYZ1)"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
            className="font-mono pr-10"
          />
          {trackingId && (
            <button
              type="button"
              onClick={() => setTrackingId('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Tracking...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Track Package
            </>
          )}
        </Button>
      </form>

      {/* Error State */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">{error}</p>
            <p className="text-xs text-red-600 mt-1">
              Please check the tracking number and try again.
            </p>
          </div>
        </div>
      )}

      {/* Success State */}
      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2 mb-3">
            {result.type === 'parcel' ? (
              <Package className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Truck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                {result.type === 'parcel' ? 'Parcel Found' : 'Shipment Found'}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Tracking ID: {result.data.trackingId || result.data.shipmentId}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Status:</span>
              <StatusBadge status={result.data.status} />
            </div>

            {result.type === 'parcel' && (
              <>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">From:</span>
                  <span className="text-xs font-medium">
                    {result.data.pickupAddress?.city}, {result.data.pickupAddress?.state}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">To:</span>
                  <span className="text-xs font-medium">
                    {result.data.destinationAddress?.city}, {result.data.destinationAddress?.state}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Recipient:</span>
                  <span className="text-xs font-medium">{result.data.recipientName}</span>
                </div>
              </>
            )}

            {result.type === 'shipment' && (
              <>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">From:</span>
                  <span className="text-xs font-medium">{result.data.originHub}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">To:</span>
                  <span className="text-xs font-medium">{result.data.destinationHub}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Parcels:</span>
                  <span className="text-xs font-medium">{result.data.parcels?.length || 0}</span>
                </div>
              </>
            )}

            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Created:</span>
              <span className="text-xs font-medium">
                {formatDate(result.data.createdAt)}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-green-200">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full"
            >
              <a href={`/track/${trackingId}`} target="_blank" rel="noopener noreferrer">
                View Full Details →
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
