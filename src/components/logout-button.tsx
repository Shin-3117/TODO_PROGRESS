"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/data/supabase/browser";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const onLogout = async () => {
    setPending(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
    setPending(false);
  };

  return (
    <Button variant="outline" onClick={onLogout} disabled={pending} className="gap-2">
      <LogOut className="h-4 w-4" />
      {pending ? "로그아웃 중..." : "로그아웃"}
    </Button>
  );
}
