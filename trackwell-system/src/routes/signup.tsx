import { createFileRoute, Link } from "@tanstack/react-router";
import SignupPage from "@/pages/SignupPage";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({
    meta: [
      { title: "Create account - Mobi Express" },
      { name: "description", content: "Sign up for a Mobi Express account" }
    ],
  }),
});
