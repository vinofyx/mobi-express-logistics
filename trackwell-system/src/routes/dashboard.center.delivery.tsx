import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCenter, CenterProvider } from "@/lib/center-context";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import type { ShipmentStatus } from "@/lib/shipment-utils";

export const Route = createFileRoute("/dashboard/center/delivery")({
  component: () => (
    <CenterProvider>
      <OutForDelivery />
    </CenterProvider>
  ),
});

interface Row {
  id: string;
  tracking_number: string;
  status: ShipmentStatus;
  destination_address: string;
  destination_city: string;
  recipient_name: string;
  recipient_phone: string;
}

function OutForDelivery() {
  const { centerId, loading: centerLoading } = useCenter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    if (!centerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("shipments")
      .select(
        "id, tracking_number, status, destination_address, destination_city, recipient_name, recipient_phone",
      )
      .eq("destination_center_id", centerId)
      .in("status", ["at_destination_center", "out_for_delivery"])
      .order("updated_at", { ascending: true });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!centerLoading) load();
  }, [centerId, centerLoading]);

  const update = async (id: string, status: ShipmentStatus) => {
    setBusy(id);
    const { error } = await supabase.from("shipments").update({ status }).eq("id", id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  if (centerLoading || loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!centerId)
    return (
      <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        You aren't assigned to a center yet.
      </p>
    );

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border-2 border-dashed bg-card py-16 text-center">
        <Truck className="h-10 w-10 text-muted-foreground" />
        <p className="mt-3 font-medium">No deliveries pending</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-semibold">{r.tracking_number}</p>
              <p className="mt-1 text-sm">
                {r.recipient_name} · {r.recipient_phone}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {r.destination_address}, {r.destination_city}
              </p>
            </div>
            <StatusBadge status={r.status} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {r.status === "at_destination_center" && (
              <Button size="sm" disabled={busy === r.id} onClick={() => update(r.id, "out_for_delivery")}>
                Send out for delivery
              </Button>
            )}
            {r.status === "out_for_delivery" && (
              <Button size="sm" disabled={busy === r.id} onClick={() => update(r.id, "delivered")}>
                Mark delivered
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={busy === r.id}
              onClick={() => update(r.id, "failed_delivery")}
            >
              Mark failed
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
