import { format } from "date-fns";
import { CheckCircle2, Circle } from "lucide-react";
import { STATUS_LABELS, type ShipmentStatus } from "@/lib/shipment-utils";

export interface TimelineEvent {
  id: string;
  status: ShipmentStatus;
  location: string | null;
  notes: string | null;
  created_at: string;
}

export function ShipmentTimeline({ events }: { events: TimelineEvent[] }) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground">No events yet.</p>;
  }

  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {sorted.map((e, i) => {
        const isLatest = i === 0;
        return (
          <li key={e.id} className="relative">
            <span
              className={`absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${
                isLatest ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {isLatest ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium">{STATUS_LABELS[e.status]}</p>
              <time className="text-xs text-muted-foreground">
                {format(new Date(e.created_at), "PPp")}
              </time>
            </div>
            {e.location && <p className="text-sm text-muted-foreground">{e.location}</p>}
            {e.notes && <p className="mt-1 text-sm">{e.notes}</p>}
          </li>
        );
      })}
    </ol>
  );
}
