import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PACKAGE_TYPE_LABELS, type PackageType } from "@/lib/shipment-utils";

export const Route = createFileRoute("/dashboard/customer/new")({
  component: NewPickup,
});

interface Center {
  id: string;
  name: string;
  city: string;
}

function NewPickup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [centers, setCenters] = useState<Center[]>([]);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    recipient_name: "",
    recipient_phone: "",
    pickup_address: "",
    pickup_city: "",
    destination_address: "",
    destination_city: "",
    origin_center_id: "",
    destination_center_id: "",
    weight_kg: "1",
    package_type: "parcel" as PackageType,
    description: "",
  });

  useEffect(() => {
    supabase
      .from("centers")
      .select("id, name, city")
      .order("city")
      .then(({ data }) => setCenters(data ?? []));
  }, []);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.origin_center_id || !form.destination_center_id) {
      toast.error("Please select both origin and destination hubs.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase
      .from("shipments")
      .insert({
        customer_id: user.id,
        tracking_number: "", // trigger will fill
        recipient_name: form.recipient_name,
        recipient_phone: form.recipient_phone,
        pickup_address: form.pickup_address,
        pickup_city: form.pickup_city,
        destination_address: form.destination_address,
        destination_city: form.destination_city,
        origin_center_id: form.origin_center_id,
        destination_center_id: form.destination_center_id,
        weight_kg: parseFloat(form.weight_kg) || 1,
        package_type: form.package_type,
        description: form.description || null,
      })
      .select("id, tracking_number")
      .single();
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Pickup booked! Tracking: ${data.tracking_number}`);
    navigate({ to: "/dashboard/customer/shipments/$id", params: { id: data.id } });
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Pickup details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Pickup address" required>
            <Input
              value={form.pickup_address}
              onChange={(e) => update("pickup_address", e.target.value)}
              required
            />
          </Field>
          <Field label="Pickup city" required>
            <Input
              value={form.pickup_city}
              onChange={(e) => update("pickup_city", e.target.value)}
              required
            />
          </Field>
          <Field label="Origin hub" required>
            <Select
              value={form.origin_center_id}
              onValueChange={(v) => update("origin_center_id", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hub" />
              </SelectTrigger>
              <SelectContent>
                {centers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Recipient & destination</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Recipient name" required>
            <Input
              value={form.recipient_name}
              onChange={(e) => update("recipient_name", e.target.value)}
              required
            />
          </Field>
          <Field label="Recipient phone" required>
            <Input
              value={form.recipient_phone}
              onChange={(e) => update("recipient_phone", e.target.value)}
              required
            />
          </Field>
          <Field label="Destination address" required>
            <Input
              value={form.destination_address}
              onChange={(e) => update("destination_address", e.target.value)}
              required
            />
          </Field>
          <Field label="Destination city" required>
            <Input
              value={form.destination_city}
              onChange={(e) => update("destination_city", e.target.value)}
              required
            />
          </Field>
          <Field label="Destination hub" required>
            <Select
              value={form.destination_center_id}
              onValueChange={(v) => update("destination_center_id", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hub" />
              </SelectTrigger>
              <SelectContent>
                {centers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Package</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Package type" required>
            <Select
              value={form.package_type}
              onValueChange={(v) => update("package_type", v as PackageType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PACKAGE_TYPE_LABELS) as PackageType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {PACKAGE_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Weight (kg)" required>
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={form.weight_kg}
              onChange={(e) => update("weight_kg", e.target.value)}
              required
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description (optional)">
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Any handling notes…"
                rows={3}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate({ to: "/dashboard/customer" })}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Booking…" : "Book pickup"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
