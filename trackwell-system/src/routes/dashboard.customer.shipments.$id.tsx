import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ShipmentTimeline, type TimelineEvent } from "@/components/ShipmentTimeline";
import { PACKAGE_TYPE_LABELS, type PackageType, type ShipmentStatus } from "@/lib/shipment-utils";

export const Route = createFileRoute("/dashboard/customer/shipments/$id")({
  component: ShipmentDetail,
});

interface FullShipment {
  id: string;
  tracking_number: string;
  status: ShipmentStatus;
  recipient_name: string;
  recipient_phone: string;
  pickup_address: string;
  pickup_city: string;
  destination_address: string;
  destination_city: string;
  weight_kg: number;
  package_type: PackageType;
  description: string | null;
  created_at: string;
}

function ShipmentDetail() {
  const { id } = Route.useParams();
  const [shipment, setShipment] = useState<FullShipment | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("shipments")
        .select(
          "id, tracking_number, status, recipient_name, recipient_phone, pickup_address, pickup_city, destination_address, destination_city, weight_kg, package_type, description, created_at",
        )
        .eq("id", id)
        .maybeSingle();
      setShipment(data as FullShipment | null);
      const { data: evs } = await supabase
        .from("shipment_events")
        .select("id, status, location, notes, created_at")
        .eq("shipment_id", id)
        .order("created_at", { ascending: false });
      setEvents((evs as TimelineEvent[]) ?? []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!shipment) return <p className="text-sm text-muted-foreground">Shipment not found.</p>;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/dashboard/customer/shipments">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </Button>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Tracking number</p>
            <p className="font-mono text-xl font-bold">{shipment.tracking_number}</p>
          </div>
          <StatusBadge status={shipment.status} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Detail label="Pickup">
            {shipment.pickup_address}
            <br />
            {shipment.pickup_city}
          </Detail>
          <Detail label="Destination">
            {shipment.destination_address}
            <br />
            {shipment.destination_city}
          </Detail>
          <Detail label="Recipient">
            {shipment.recipient_name}
            <br />
            {shipment.recipient_phone}
          </Detail>
          <Detail label="Package">
            {PACKAGE_TYPE_LABELS[shipment.package_type]} · {shipment.weight_kg} kg
            {shipment.description && (
              <>
                <br />
                <span className="text-muted-foreground">{shipment.description}</span>
              </>
            )}
          </Detail>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Tracking history</h2>
        <ShipmentTimeline events={events} />
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/40 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{children}</p>
    </div>
  );
}
