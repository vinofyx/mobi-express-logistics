import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Package } from "lucide-react";
import { parcelsAPI, shipmentsAPI } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ShipmentTimeline, type TimelineEvent } from "@/components/ShipmentTimeline";
import type { ShipmentStatus } from "@/lib/shipment-utils";

export const Route = createFileRoute("/track/$trackingNumber")({
  head: ({ params }) => ({
    meta: [
      { title: `Track ${params.trackingNumber} — Mobi Express` },
      { name: "description", content: `Live tracking for shipment ${params.trackingNumber}` },
    ],
  }),
  component: TrackPage,
});

interface ParcelSummary {
  _id: string;
  trackingId: string;
  status: ShipmentStatus;
  senderName?: string;
  recipientName?: string;
  pickupAddress?: {
    city: string;
    state: string;
  };
  destinationAddress?: {
    city: string;
    state: string;
  };
  createdAt: string;
  statusHistory?: Array<{
    status: string;
    location?: string;
    note?: string;
    timestamp: string;
  }>;
}

interface ShipmentSummary {
  _id: string;
  shipmentId: string;
  status: ShipmentStatus;
  originHub: string;
  destinationHub: string;
  createdAt: string;
  statusHistory?: Array<{
    status: string;
    location?: string;
    note?: string;
    timestamp: string;
  }>;
  parcels?: Array<{
    trackingId: string;
    status: string;
  }>;
}

function TrackPage() {
  const { trackingNumber } = Route.useParams();
  const [parcel, setParcel] = useState<ParcelSummary | null>(null);
  const [shipment, setShipment] = useState<ShipmentSummary | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      
      try {
        // First try to find as a parcel using public tracking endpoint
        const parcelResponse = await parcelsAPI.track(trackingNumber);
        if (parcelResponse.data.success && parcelResponse.data.data) {
          if (!cancelled) {
            setParcel(parcelResponse.data.data);
            setEvents(parcelResponse.data.data.statusHistory?.map((event: any) => ({
              id: event.timestamp,
              status: event.status,
              location: event.location || 'Unknown',
              notes: event.note || '',
              created_at: event.timestamp,
            })) || []);
            setLoading(false);
          }
          return;
        }

        // If not found as parcel, try as shipment
        const shipmentResponse = await shipmentsAPI.track(trackingNumber);
        if (shipmentResponse.data.success && shipmentResponse.data.data) {
          if (!cancelled) {
            setShipment(shipmentResponse.data.data);
            setEvents(shipmentResponse.data.data.statusHistory?.map((event: any) => ({
              id: event.timestamp,
              status: event.status,
              location: event.location || 'Unknown',
              notes: event.note || '',
              created_at: event.timestamp,
            })) || []);
            setLoading(false);
          }
          return;
        }

        // Not found anywhere
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Tracking error:', error);
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      }
    })();
    
    return () => {
      cancelled = true;
    };
  }, [trackingNumber]);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link to="/">
            <Logo />
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {parcel ? 'Parcel' : 'Shipment'} Tracking number
              </p>
              <h1 className="font-mono text-2xl font-bold">{trackingNumber}</h1>
            </div>
            {(parcel || shipment) && <StatusBadge status={(parcel || shipment)!.status} />}
          </div>

          {loading ? (
            <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
          ) : notFound ? (
            <div className="mt-8 flex flex-col items-center py-10 text-center">
              <Package className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">Package not found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Double-check the tracking number and try again.
              </p>
            </div>
          ) : parcel ? (
            <>
              <div className="mt-6 grid gap-4 rounded-lg bg-muted/50 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="font-medium">
                    {parcel.pickupAddress?.city}, {parcel.pickupAddress?.state}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">To</p>
                  <p className="font-medium">
                    {parcel.destinationAddress?.city}, {parcel.destinationAddress?.state}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Recipient</p>
                  <p className="font-medium">{parcel.recipientName}</p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="mb-4 text-lg font-semibold">Tracking history</h2>
                <ShipmentTimeline events={events} />
              </div>
            </>
          ) : shipment ? (
            <>
              <div className="mt-6 grid gap-4 rounded-lg bg-muted/50 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="font-medium">{shipment.originHub}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">To</p>
                  <p className="font-medium">{shipment.destinationHub}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Parcels</p>
                  <p className="font-medium">{shipment.parcels?.length || 0} parcel(s)</p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="mb-4 text-lg font-semibold">Tracking history</h2>
                <ShipmentTimeline events={events} />
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
