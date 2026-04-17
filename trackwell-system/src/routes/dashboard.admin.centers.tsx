import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/dashboard/admin/centers")({
  component: CentersPage,
});

interface Center {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
}

function CentersPage() {
  const [rows, setRows] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: "", name: "", city: "", address: "" });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("centers").select("*").order("city");
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("centers").insert({
      code: form.code.toUpperCase(),
      name: form.name,
      city: form.city,
      address: form.address,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Center added");
    setForm({ code: "", name: "", city: "", address: "" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this center?")) return;
    const { error } = await supabase.from("centers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={create} className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-1">
        <h2 className="font-semibold">New center</h2>
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label>Code</Label>
            <Input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              required
              maxLength={10}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Saving…" : "Add center"}
          </Button>
        </div>
      </form>

      <div className="rounded-xl border bg-card shadow-sm lg:col-span-2">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No centers.</p>
        ) : (
          <div className="divide-y">
            {rows.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    <span className="mr-2 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
                      {c.code}
                    </span>
                    {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.address} · {c.city}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(c.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
