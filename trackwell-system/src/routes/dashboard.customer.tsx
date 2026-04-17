import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Plus, Package } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

export const Route = createFileRoute("/dashboard/customer")({
  component: CustomerLayout,
});

const NAV = [
  { to: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/customer/new", label: "Request Pickup", icon: Plus },
  { to: "/dashboard/customer/shipments", label: "My Shipments", icon: Package },
];

function CustomerLayout() {
  const location = useLocation();
  const titles: Record<string, string> = {
    "/dashboard/customer": "Overview",
    "/dashboard/customer/new": "Request a Pickup",
    "/dashboard/customer/shipments": "My Shipments",
  };
  const title =
    titles[location.pathname] ||
    (location.pathname.includes("/shipments/") ? "Shipment Detail" : "Customer Dashboard");

  return (
    <DashboardLayout title={title} nav={NAV} roleLabel="Customer">
      <Outlet />
    </DashboardLayout>
  );
}
