import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCenter, CenterProvider } from "@/lib/center-context";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import type { ShipmentStatus } from "@/lib/shipment-utils";

export const Route = createFileRoute("/dashboard/center/")({
  component: () => (
    <CenterProvider>
      <Inbound />
    </CenterProvider>
  ),
});

interface Row {
  id: string;
  tracking_number: string;
  status: ShipmentStatus;
  pickup_city: string;
  destination_city: string;
  recipient_name: string;
}

function Inbound() {
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
    // Origin: arriving from agent (picked_up)
    // Destination: arriving from transit (in_transit)
    const { data } = await supabase
      .from("shipments")
      .select("id, tracking_number, status, pickup_city, destination_city, recipient_name")
      .or(
        `and(origin_center_id.eq.${centerId},status.eq.picked_up),and(destination_center_id.eq.${centerId},status.eq.in_transit)`,
      )
      .order("updated_at", { ascending: true });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!centerLoading) load();
  }, [centerId, centerLoading]);

  const receive = async (id: string, current: ShipmentStatus) => {
    const next: ShipmentStatus =
      current === "picked_up" ? "at_origin_center" : "at_destination_center";
    setBusy(id);
    const { error } = await supabase.from("shipments").update({ status: next }).eq("id", id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Marked as received");
    load();
  };

  if (centerLoading || loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!centerId)
    return (
      <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        You aren't assigned to a center yet. Contact an admin.
      </p>
    );

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border-2 border-dashed bg-card py-16 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground" />
        <p className="mt-3 font-medium">No inbound packages</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="divide-y">
        {rows.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-mono text-sm font-semibold">{r.tracking_number}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {r.pickup_city} → {r.destination_city} · {r.recipient_name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={r.status} />
              <Button size="sm" disabled={busy === r.id} onClick={() => receive(r.id, r.status)}>
                Mark received
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
