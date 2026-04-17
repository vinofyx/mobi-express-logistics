import { createFileRoute } from "@tanstack/react-router";
import ShipmentManagement from "@/pages/ShipmentManagement";

export const Route = createFileRoute("/dashboard/admin/shipments")({
  component: () => <ShipmentManagement />,
});
