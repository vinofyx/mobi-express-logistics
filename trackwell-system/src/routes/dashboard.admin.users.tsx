import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS, type AppRole } from "@/lib/shipment-utils";

export const Route = createFileRoute("/dashboard/admin/users")({
  component: UsersPage,
});

interface UserRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  roles: AppRole[];
}

const ROLES: AppRole[] = ["admin", "customer", "agent", "center_operator"];

function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<Record<string, AppRole>>({});

  const load = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .order("created_at", { ascending: false });
    const ids = (profiles ?? []).map((p) => p.id);
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const map = new Map<string, AppRole[]>();
    (roleRows ?? []).forEach((r) => {
      const list = map.get(r.user_id) ?? [];
      list.push(r.role as AppRole);
      map.set(r.user_id, list);
    });
    setRows(
      (profiles ?? []).map((p) => ({
        id: p.id,
        full_name: p.full_name,
        phone: p.phone,
        roles: map.get(p.id) ?? [],
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addRole = async (userId: string, role: AppRole) => {
    setBusy(userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(`Granted ${ROLE_LABELS[role]}`);
    load();
  };

  const removeRole = async (userId: string, role: AppRole) => {
    setBusy(userId);
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(`Removed ${ROLE_LABELS[role]}`);
    load();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="divide-y">
        {rows.map((u) => {
          const available = ROLES.filter((r) => !u.roles.includes(r));
          const selected = pendingRole[u.id] ?? available[0];
          return (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-medium">{u.full_name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{u.phone ?? "No phone"}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {u.roles.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No roles</span>
                  ) : (
                    u.roles.map((r) => (
                      <Badge
                        key={r}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeRole(u.id, r)}
                        title="Click to remove"
                      >
                        {ROLE_LABELS[r]} ✕
                      </Badge>
                    ))
                  )}
                </div>
              </div>
              {available.length > 0 && (
                <div className="flex items-center gap-2">
                  <Select
                    value={selected}
                    onValueChange={(v) => setPendingRole((p) => ({ ...p, [u.id]: v as AppRole }))}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {available.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={busy === u.id}
                    onClick={() => addRole(u.id, selected)}
                  >
                    Grant
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
