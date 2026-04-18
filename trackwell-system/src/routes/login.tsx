import { createFileRoute } from "@tanstack/react-router";
import Login from "@/pages/Login";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [
      { title: "Sign in - Mobi Express" },
      { name: "description", content: "Sign in to your Mobi Express account" }
    ],
  }),
});
