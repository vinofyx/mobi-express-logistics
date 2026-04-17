import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/admin/agents")({
  component: AgentsPage,
});

interface AgentRow {
  id: string;
  user_id: string;
  assigned_center_id: string | null;
  full_name: string | null;
}

interface CandidateUser {
  id: string;
  full_name: string | null;
}

interface Center {
  id: string;
  name: string;
  city: string;
}

function AgentsPage() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [candidates, setCandidates] = useState<CandidateUser[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickedUser, setPickedUser] = useState<string>("");
  const [pickedCenter, setPickedCenter] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: agentRows }, { data: profiles }, { data: centerRows }, { data: roleRows }] =
      await Promise.all([
        supabase.from("agents").select("id, user_id, assigned_center_id"),
        supabase.from("profiles").select("id, full_name"),
        supabase.from("centers").select("id, name, city").order("city"),
        supabase.from("user_roles").select("user_id, role"),
      ]);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
    setAgents(
      (agentRows ?? []).map((a) => ({
        ...a,
        full_name: profileMap.get(a.user_id) ?? null,
      })),
    );
    setCenters(centerRows ?? []);

    const agentIds = new Set((agentRows ?? []).map((a) => a.user_id));
    // Candidates = users with 'agent' or 'center_operator' role but not yet linked
    const eligibleIds = new Set(
      (roleRows ?? [])
        .filter((r) => r.role === "agent" || r.role === "center_operator")
        .map((r) => r.user_id),
    );
    setCandidates(
      (profiles ?? []).filter((p) => eligibleIds.has(p.id) && !agentIds.has(p.id)),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const link = async () => {
    if (!pickedUser || !pickedCenter) return toast.error("Pick a user and a center");
    setBusy(true);
    const { error } = await supabase
      .from("agents")
      .insert({ user_id: pickedUser, assigned_center_id: pickedCenter });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Linked");
    setPickedUser("");
    setPickedCenter("");
    load();
  };

  const updateCenter = async (id: string, centerId: string) => {
    const { error } = await supabase
      .from("agents")
      .update({ assigned_center_id: centerId })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Unlink this user from their center?")) return;
    const { error } = await supabase.from("agents").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold">Link a user to a center</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Users must already have the "Field Agent" or "Center Operator" role assigned in Users.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <Select value={pickedUser} onValueChange={setPickedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Choose user" />
              </SelectTrigger>
              <SelectContent>
                {candidates.length === 0 ? (
                  <SelectItem value="_" disabled>
                    No eligible users
                  </SelectItem>
                ) : (
                  candidates.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name ?? u.id}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[200px] flex-1">
            <Select value={pickedCenter} onValueChange={setPickedCenter}>
              <SelectTrigger>
                <SelectValue placeholder="Choose center" />
              </SelectTrigger>
              <SelectContent>
                {centers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={link} disabled={busy}>
            Link
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        {agents.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No agents linked yet.</p>
        ) : (
          <div className="divide-y">
            {agents.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{a.full_name ?? a.user_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={a.assigned_center_id ?? undefined}
                    onValueChange={(v) => updateCenter(a.id, v)}
                  >
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="Assign center" />
                    </SelectTrigger>
                    <SelectContent>
                      {centers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.city})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => remove(a.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
