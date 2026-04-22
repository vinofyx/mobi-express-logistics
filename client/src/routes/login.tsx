import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "@/pages/LoginPage";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in - Mobi Express" },
      { name: "description", content: "Sign in to your Mobi Express account" },
    ],
  }),
});
