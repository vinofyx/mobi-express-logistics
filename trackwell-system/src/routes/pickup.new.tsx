import { createFileRoute } from "@tanstack/react-router";
import CreatePickupPage from "@/pages/CreatePickupPage";

export const Route = createFileRoute("/pickup/new")({
  component: CreatePickupPage,
  head: () => ({
    meta: [
      { title: "Schedule Pickup - Mobi Express" },
      { name: "description", content: "Schedule a pickup request with Mobi Express logistics" },
    ],
  }),
});
