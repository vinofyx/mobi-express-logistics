import { createFileRoute } from "@tanstack/react-router";
import LoginEnhanced from "@/pages/LoginEnhanced";

export const Route = createFileRoute("/login")({
  component: LoginEnhanced,
  head: () => ({
    meta: [
      { title: "Sign in - Mobi Express" },
      { name: "description", content: "Sign in to your Mobi Express account" }
    ],
  }),
});
