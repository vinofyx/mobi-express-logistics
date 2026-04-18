import { createFileRoute, Link } from "@tanstack/react-router";
import SignupEnhanced from "@/pages/SignupEnhanced";

export const Route = createFileRoute("/signup")({
  component: SignupEnhanced,
  head: () => ({
    meta: [
      { title: "Create account - Mobi Express" },
      { name: "description", content: "Sign up for a Mobi Express account" }
    ],
  }),
});
