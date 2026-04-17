import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Users, Building2, ShieldCheck, Package, ClipboardList } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/admin/queue", label: "Pickup Queue", icon: ClipboardList },
  { to: "/dashboard/admin/shipments", label: "Shipments", icon: Package },
  { to: "/dashboard/admin/users", label: "Users & Roles", icon: Users },
  { to: "/dashboard/admin/centers", label: "Centers", icon: Building2 },
  { to: "/dashboard/admin/agents", label: "Agents", icon: ShieldCheck },
];

function AdminLayout() {
  const location = useLocation();
  const titles: Record<string, string> = {
    "/dashboard/admin": "Admin Overview",
    "/dashboard/admin/queue": "Pickup Queue",
    "/dashboard/admin/shipments": "All Shipments",
    "/dashboard/admin/users": "Users & Roles",
    "/dashboard/admin/centers": "Centers",
    "/dashboard/admin/agents": "Agents",
  };
  return (
    <DashboardLayout
      title={titles[location.pathname] ?? "Admin"}
      nav={NAV}
      roleLabel="Admin"
    >
      <Outlet />
    </DashboardLayout>
  );
}
