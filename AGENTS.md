# AGENTS.md

## 기술 스택

- Next.js (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui (Radix 기반 컴포넌트)
- Supabase (Google OAuth + Postgres)

## 설계 규칙

- Plan은 단일 레벨 엔티티다. 상위/하위 트리 구조를 만들지 않는다.
- Plan과 Label은 N:M(`plan_labels`)으로 연결한다.
- 라벨 필터는 멀티 선택 + OR 매칭으로 동작한다.
- 진행도 계산 규칙:
  - `current = SUM(progress_logs.delta) by plan`
  - `progressRate = target_value > 0 ? clamp(current / target_value, 0..1) : 0`

## 보안 / RLS 원칙

- 모든 테이블(`plans`, `labels`, `plan_labels`, `progress_logs`)에 RLS를 활성화한다.
- 기본 정책은 `auth.uid() = user_id`를 따른다.
- `plan_labels` insert/update는 참조하는 `plan_id`, `label_id`가 현재 사용자 소유인지 검증한다.
- `progress_logs` insert/update는 참조하는 `plan_id`가 현재 사용자 소유인지 검증한다.

## 상태관리 지침

- 기본은 서버 컴포넌트 + 서버 액션 중심으로 구현한다.
- 다음 경우에만 Zustand를 도입한다:
  - 페이지 간 공유되는 복잡한 클라이언트 상태가 생길 때
  - 필터/모달/선택 상태가 컴포넌트 경계를 넘어 크게 확장될 때
- 다음 경우에만 TanStack React Query를 도입한다:
  - 공격적인 캐싱/동기화가 필요할 때
  - 백그라운드 refetch, 요청 중복 제거, 낙관적 업데이트가 필수일 때

## 파일 구조 규칙

- `src/domain`: 타입, 진행 계산, 필터 함수
- `src/data`: Supabase 클라이언트 + CRUD/query
- `src/components`: 재사용 UI 및 화면 구성 컴포넌트
- `src/app`: 라우트(App Router), 페이지, 서버 액션
- `supabase/sql`: 스키마와 RLS 정책 SQL

## 요약

- 데이터 규칙은 `domain`, DB 접근은 `data`, 화면은 `app` + `components`로 분리한다.
- 모든 추가/등록 UX는 shadcn Dialog로 제공한다.
- 인증/데이터 접근은 Supabase + RLS를 기준으로 최소 권한 원칙을 유지한다.
