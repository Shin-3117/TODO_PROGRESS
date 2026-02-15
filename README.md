# TODO Progress MVP

Next.js(App Router, TypeScript) + Supabase(Auth: Google OAuth) + Postgres 기반의 계획/라벨/진행 로그 관리 MVP입니다.

## 핵심 기능

- `/plans` 목록 화면
  - 계획 추가 (Dialog)
  - 라벨 추가 (Dialog)
  - 검색(title/description)
  - 라벨 멀티 필터(OR)
  - 진행 등록 (Dialog, `delta`/`note`, 날짜 기본값 오늘)
- `/plans/[id]` 상세 화면
  - 제목/설명/진행률
  - Calendar 로그 표시
  - 일별 합계 표시
  - 로그 리스트(최신순)
- Google OAuth 로그인/로그아웃
- 미로그인 사용자 `/login` 리다이렉트

## 기술 스택

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui (Radix primitives)
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`)

## 진행도 계산 규칙

- `current = SUM(progress_logs.delta) by plan`
- `progressRate = target_value > 0 ? clamp(current / target_value, 0..1) : 0`
- UI에는 다음을 함께 표시합니다.
  - Progress bar
  - `%`
  - `current / target + unit`

## 로컬 실행 방법

1. 의존성 설치
```bash
npm install
```
2. 환경변수 파일 생성
```bash
Copy-Item .env.example .env.local
```
3. `.env.local`에 값 입력
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
4. 개발 서버 실행
```bash
npm run dev
```
5. 브라우저에서 `http://localhost:3000` 접속

## Supabase 설정 방법

### 1) 프로젝트 생성

- Supabase에서 새 프로젝트를 생성합니다.

### 2) DB 스키마 적용

SQL Editor에서 아래 파일 순서대로 실행:

1. `supabase/sql/001_schema.sql`
2. `supabase/sql/002_rls.sql`

### 3) Google OAuth 설정

1. Google Cloud Console에서 OAuth Client를 생성합니다.
2. Supabase Dashboard → Authentication → Providers → Google 활성화
3. Client ID/Secret 입력
4. Redirect URL 설정
  - Local: `http://localhost:3000/auth/callback`
  - Production: `https://<your-domain>/auth/callback`
5. Supabase Authentication URL 설정
  - Site URL: `http://localhost:3000` (개발 시)
  - Redirect URLs에 위 callback URL들을 추가

## RLS 설정 방법

`supabase/sql/002_rls.sql`에서 다음 원칙을 적용합니다.

- 모든 테이블 RLS 활성화
- 기본 정책: `auth.uid() = user_id`
- 추가 검증:
  - `plan_labels` insert/update 시 plan/label 소유권 검증
  - `progress_logs` insert/update 시 plan 소유권 검증

## 환경변수

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Vercel 배포 방법

1. Git 저장소를 Vercel에 Import
2. Framework Preset은 Next.js
3. Environment Variables에 아래 값 설정
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 배포 후 Supabase Redirect URL에 배포 도메인 callback 추가
   - `https://<vercel-domain>/auth/callback`
5. 재배포

## 디렉터리 구조

```text
src/
  app/             # 라우트, 페이지, 서버 액션
  components/      # 재사용 UI 및 페이지 구성 컴포넌트
  data/            # Supabase client + CRUD/query
  domain/          # 타입, 진행 계산, 필터 로직
supabase/
  sql/             # 스키마, RLS 정책 SQL
```

## 참고

- 상태 관리는 서버 컴포넌트 + 서버 액션 중심으로 유지했습니다.
- MVP 범위에서는 Zustand / React Query를 추가하지 않았습니다.
