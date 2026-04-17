import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Package, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import type { ShipmentStatus } from "@/lib/shipment-utils";

export const Route = createFileRoute("/dashboard/agent/")({
  component: AgentActive,
});

interface AssignedShipment {
  id: string;
  tracking_number: string;
  status: ShipmentStatus;
  pickup_address: string;
  pickup_city: string;
  destination_city: string;
  recipient_name: string;
  recipient_phone: string;
}

function AgentActive() {
  const { user } = useAuth();
  const [rows, setRows] = useState<AssignedShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("shipments")
      .select(
        "id, tracking_number, status, pickup_address, pickup_city, destination_city, recipient_name, recipient_phone",
      )
      .eq("assigned_agent_id", user.id)
      .in("status", ["pending_pickup", "picked_up"])
      .order("created_at", { ascending: true });
    setRows((data as AssignedShipment[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const updateStatus = async (id: string, status: ShipmentStatus) => {
    setUpdatingId(id);
    const { error } = await supabase.from("shipments").update({ status }).eq("id", id);
    setUpdatingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Status updated");
    load();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border-2 border-dashed bg-card py-16 text-center">
        <Package className="h-10 w-10 text-muted-foreground" />
        <p className="mt-3 font-medium">No active pickups</p>
        <p className="mt-1 text-sm text-muted-foreground">
          New assignments from the admin will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((s) => (
        <div key={s.id} className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-semibold">{s.tracking_number}</p>
              <p className="mt-1 text-sm">
                {s.recipient_name} · {s.recipient_phone}
              </p>
            </div>
            <StatusBadge status={s.status} />
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium">{s.pickup_address}</p>
              <p className="text-xs text-muted-foreground">
                {s.pickup_city} <ArrowRight className="inline h-3 w-3" /> {s.destination_city}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {s.status === "pending_pickup" && (
              <Button
                size="sm"
                disabled={updatingId === s.id}
                onClick={() => updateStatus(s.id, "picked_up")}
              >
                Mark picked up
              </Button>
            )}
            {s.status === "picked_up" && (
              <Button
                size="sm"
                disabled={updatingId === s.id}
                onClick={() => updateStatus(s.id, "at_origin_center")}
              >
                Drop at origin hub
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={updatingId === s.id}
              onClick={() => updateStatus(s.id, "failed_delivery")}
            >
              Mark failed
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
