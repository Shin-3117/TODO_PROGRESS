"use client";

import { useState } from "react";
import { Chrome } from "lucide-react";
import { createSupabaseBrowserClient } from "@/data/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        setError(authError.message);
        setPending(false);
      } else {
        window.location.href = "/plans";
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "로그인 중 오류가 발생했습니다.";
      setError(message);
      setPending(false);
    }
  };

  const onGoogleLogin = async () => {
    setPending(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?next=/plans`;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo
        }
      });

      if (authError) {
        setError(authError.message);
        setPending(false);
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "로그인 요청 중 오류가 발생했습니다.";
      setError(message);
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={onEmailLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "로그인 중..." : "로그인"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">또는</span>
        </div>
      </div>

      <Button type="button" variant="outline" className="w-full gap-2" onClick={onGoogleLogin} disabled={pending}>
        <Chrome className="h-4 w-4" />
        {pending ? "Google 로그인 이동 중..." : "Google로 로그인"}
      </Button>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
