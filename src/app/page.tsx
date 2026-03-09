import { redirect } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function Home() {
  // This is a server component, so we can't use the store directly
  // We'll use client-side redirect for now
  redirect("/concerts");
}
