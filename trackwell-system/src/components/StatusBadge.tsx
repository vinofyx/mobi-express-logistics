import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, type ShipmentStatus } from "@/lib/shipment-utils";

export function StatusBadge({
  status,
  className,
}: {
  status: ShipmentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_COLORS[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
