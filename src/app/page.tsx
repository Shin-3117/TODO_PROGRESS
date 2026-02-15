import { redirect } from "next/navigation";
import { getCurrentUser } from "@/data/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  redirect(user ? "/plans" : "/login");
}
