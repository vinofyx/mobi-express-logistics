import { createFileRoute, Link } from "@tanstack/react-router";
import Signup from "@/pages/Signup";

export const Route = createFileRoute("/signup")({
  component: Signup,
  head: () => ({
    meta: [
      { title: "Create account - Mobi Express" },
      { name: "description", content: "Sign up for a Mobi Express account" }
    ],
  }),
});
