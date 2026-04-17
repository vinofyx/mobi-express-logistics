import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Truck, CheckCircle2, Plus } from "lucide-react";
import { shipmentsAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import type { ShipmentStatus } from "@/lib/shipment-utils";

export const Route = createFileRoute("/dashboard/customer/")({
  component: CustomerOverview,
});

interface ShipmentRow {
  _id: string;
  shipmentId: string;
  status: ShipmentStatus;
  destinationHub: string;
  originHub: string;
  createdAt: string;
  parcels?: Array<{ trackingId: string; status: string }>;
}

function CustomerOverview() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<ShipmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const response = await shipmentsAPI.getAll();
        setShipments(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch shipments:', error);
        setShipments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const total = shipments.length;
  const inTransit = shipments.filter((s) =>
    ["Dispatched", "In Transit", "picked_up", "at_origin_center", "in_transit", "at_destination_center", "out_for_delivery"].includes(
      s.status,
    ),
  ).length;
  const delivered = shipments.filter((s) => s.status === "Received" || s.status === "delivered").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Package} label="Recent shipments" value={total} />
        <StatCard icon={Truck} label="In transit" value={inTransit} />
        <StatCard icon={CheckCircle2} label="Delivered" value={delivered} />
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recent shipments</h2>
          <Button asChild size="sm">
            <Link to="/dashboard/customer/new">
              <Plus className="h-4 w-4" /> New pickup
            </Link>
          </Button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : shipments.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-lg border-2 border-dashed py-10 text-center">
            <Package className="h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">No shipments yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first pickup request to get started.
            </p>
            <Button asChild className="mt-4">
              <Link to="/dashboard/customer/new">Request a pickup</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4 divide-y">
            {shipments.map((s) => (
              <Link
                key={s.id}
                to="/dashboard/customer/shipments/$id"
                params={{ id: s.id }}
                className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="font-mono text-sm font-medium">{s.tracking_number}</p>
                  <p className="text-xs text-muted-foreground">
                    To {s.recipient_name} · {s.destination_city}
                  </p>
                </div>
                <StatusBadge status={s.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
