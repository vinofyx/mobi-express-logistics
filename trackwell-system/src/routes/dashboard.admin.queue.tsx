import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/dashboard/admin/queue")({
  component: PickupQueue,
});

interface QueueRow {
  id: string;
  tracking_number: string;
  pickup_address: string;
  pickup_city: string;
  destination_city: string;
  origin_center_id: string | null;
  assigned_agent_id: string | null;
}

interface AgentOption {
  user_id: string;
  full_name: string;
  assigned_center_id: string | null;
}

function PickupQueue() {
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: shipments }, { data: agentRows }] = await Promise.all([
      supabase
        .from("shipments")
        .select(
          "id, tracking_number, pickup_address, pickup_city, destination_city, origin_center_id, assigned_agent_id",
        )
        .eq("status", "pending_pickup")
        .order("created_at", { ascending: true }),
      supabase.from("agents").select("user_id, assigned_center_id"),
    ]);

    const rawAgents = agentRows ?? [];
    const userIds = rawAgents.map((a) => a.user_id);
    let profilesMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);
      profilesMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name ?? "Agent"]));
    }
    setAgents(
      rawAgents.map((a) => ({
        user_id: a.user_id,
        assigned_center_id: a.assigned_center_id,
        full_name: profilesMap[a.user_id] ?? "Agent",
      })),
    );
    setRows((shipments as QueueRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const assign = async (id: string, agentId: string) => {
    setBusy(id);
    const { error } = await supabase
      .from("shipments")
      .update({ assigned_agent_id: agentId })
      .eq("id", id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Agent assigned");
    load();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        No pickups awaiting assignment.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => {
        // Prefer agents at the origin center
        const eligible = agents.filter(
          (a) => !r.origin_center_id || a.assigned_center_id === r.origin_center_id,
        );
        const list = eligible.length > 0 ? eligible : agents;
        return (
          <div key={r.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold">{r.tracking_number}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.pickup_city} → {r.destination_city}
                </p>
                <p className="mt-1 text-xs">{r.pickup_address}</p>
              </div>
              <StatusBadge status="pending_pickup" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Select
                value={r.assigned_agent_id ?? undefined}
                onValueChange={(v) => assign(r.id, v)}
                disabled={busy === r.id || list.length === 0}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder={list.length === 0 ? "No agents" : "Assign agent"} />
                </SelectTrigger>
                <SelectContent>
                  {list.map((a) => (
                    <SelectItem key={a.user_id} value={a.user_id}>
                      {a.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      })}
    </div>
  );
}
