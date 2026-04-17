import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Inbox, Send, Truck } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

export const Route = createFileRoute("/dashboard/center")({
  component: CenterLayout,
});

const NAV = [
  { to: "/dashboard/center", label: "Inbound", icon: Inbox },
  { to: "/dashboard/center/dispatch", label: "Dispatch", icon: Send },
  { to: "/dashboard/center/delivery", label: "Out for Delivery", icon: Truck },
];

function CenterLayout() {
  const location = useLocation();
  const titles: Record<string, string> = {
    "/dashboard/center": "Inbound",
    "/dashboard/center/dispatch": "Dispatch",
    "/dashboard/center/delivery": "Out for Delivery",
  };
  return (
    <DashboardLayout
      title={titles[location.pathname] ?? "Center Operations"}
      nav={NAV}
      roleLabel="Center Operator"
    >
      <Outlet />
    </DashboardLayout>
  );
}
