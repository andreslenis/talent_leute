import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { homeForRole } from "@/lib/types";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }
  redirect(homeForRole(profile.role));
}
