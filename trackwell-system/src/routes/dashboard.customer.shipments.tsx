import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Package, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import type { ShipmentStatus } from "@/lib/shipment-utils";

export const Route = createFileRoute("/dashboard/customer/shipments")({
  component: MyShipments,
});

interface Row {
  id: string;
  tracking_number: string;
  status: ShipmentStatus;
  pickup_city: string;
  destination_city: string;
  recipient_name: string;
  created_at: string;
}

function MyShipments() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("shipments")
        .select("id, tracking_number, status, pickup_city, destination_city, recipient_name, created_at")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="font-semibold">All shipments</h2>
        <Button asChild size="sm">
          <Link to="/dashboard/customer/new">
            <Plus className="h-4 w-4" /> New pickup
          </Link>
        </Button>
      </div>

      {loading ? (
        <p className="p-6 text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center p-10 text-center">
          <Package className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No shipments yet</p>
        </div>
      ) : (
        <div className="divide-y">
          {rows.map((r) => (
            <Link
              key={r.id}
              to="/dashboard/customer/shipments/$id"
              params={{ id: r.id }}
              className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold">{r.tracking_number}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.pickup_city} → {r.destination_city} · {r.recipient_name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {format(new Date(r.created_at), "PPp")}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
