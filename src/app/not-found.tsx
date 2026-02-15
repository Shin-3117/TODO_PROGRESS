import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-4 py-12 text-center">
      <h1 className="text-2xl font-semibold">페이지를 찾을 수 없습니다.</h1>
      <p className="text-sm text-muted-foreground">요청한 계획이 없거나 접근 권한이 없습니다.</p>
      <Button asChild>
        <Link href="/plans">계획 목록으로 이동</Link>
      </Button>
    </main>
  );
}
