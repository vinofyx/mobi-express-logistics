import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge } from "@/components/StatusBadge";
import type { ShipmentStatus } from "@/lib/shipment-utils";

export const Route = createFileRoute("/dashboard/agent/history")({
  component: AgentHistory,
});

interface Row {
  id: string;
  tracking_number: string;
  status: ShipmentStatus;
  pickup_city: string;
  destination_city: string;
  updated_at: string;
}

function AgentHistory() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("shipments")
        .select("id, tracking_number, status, pickup_city, destination_city, updated_at")
        .eq("assigned_agent_id", user.id)
        .not("status", "in", "(pending_pickup,picked_up)")
        .order("updated_at", { ascending: false });
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      {rows.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">No completed pickups yet.</p>
      ) : (
        <div className="divide-y">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-mono text-sm font-semibold">{r.tracking_number}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.pickup_city} → {r.destination_city} · {format(new Date(r.updated_at), "PPp")}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
