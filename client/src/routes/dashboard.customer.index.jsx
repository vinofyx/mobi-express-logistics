import { createFileRoute } from "@tanstack/react-router";
import CustomerDashboard from "@/pages/CustomerDashboard";

export const Route = createFileRoute("/dashboard/customer/")({
  component: CustomerDashboard,
});
