import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { ClipboardList, Package } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

export const Route = createFileRoute("/dashboard/agent")({
  component: AgentLayout,
});

const NAV = [
  { to: "/dashboard/agent", label: "Active Pickups", icon: ClipboardList },
  { to: "/dashboard/agent/history", label: "History", icon: Package },
];

function AgentLayout() {
  const location = useLocation();
  const title =
    location.pathname === "/dashboard/agent/history" ? "Pickup History" : "Active Pickups";
  return (
    <DashboardLayout title={title} nav={NAV} roleLabel="Field Agent">
      <Outlet />
    </DashboardLayout>
  );
}
