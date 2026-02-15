import { redirect } from "next/navigation";
import { LoginForm } from "@/app/login/login-form";
import { getCurrentUser } from "@/data/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/plans");
  }

  return (
    <main className="container flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md border-amber-200/60 bg-card/95 backdrop-blur">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl">TODO Progress</CardTitle>
          <CardDescription>Google 계정으로 로그인하고 계획과 진행률을 관리하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
