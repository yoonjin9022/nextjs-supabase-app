# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```

## 환경 변수 설정

`.env.local` 파일에 아래 값을 설정해야 앱이 정상 동작합니다:

```
NEXT_PUBLIC_SUPABASE_URL=<Supabase 프로젝트 URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable 또는 anon 키>
```

## 아키텍처 개요

### 레이어드 아키텍처

비즈니스 로직은 아래 3계층으로 분리됩니다:

```
Page (app/protected/*/page.tsx)
  └→ Service (lib/services/*.service.ts)       # 비즈니스 로직 + 유효성 검증
       └→ Repository (lib/repositories/*.repository.ts)  # DB 접근
```

- **Service**는 `ProfileResult<T>` 형태로 `{ data, error }` 반환
- **Repository**는 Supabase 클라이언트를 직접 사용하고 오류 발생 시 `null` 반환
- **Types**는 `lib/types/` 에 DTO 포함 인터페이스로 정의

### Supabase 클라이언트 사용 규칙

| 상황                                                    | 사용 함수                                   |
| ------------------------------------------------------- | ------------------------------------------- |
| Server Component / Route Handler / Service / Repository | `lib/supabase/server.ts`의 `createClient()` |
| Client Component (`'use client'`)                       | `lib/supabase/client.ts`의 `createClient()` |
| 프록시 미들웨어                                         | `lib/supabase/proxy.ts`의 `updateSession()` |

> **중요**: 서버 클라이언트는 Fluid compute 지원을 위해 전역 변수에 저장하지 말고, 항상 함수 호출마다 새로 생성해야 합니다.

### 인증 흐름

- `proxy.ts`가 Next.js 미들웨어 역할을 하며 모든 요청에서 세션을 갱신
- 미인증 사용자는 `/auth/login`으로 리다이렉트 (루트 `/` 제외)
- 인증 확인: `supabase.auth.getClaims()` 사용 (`data.claims.sub`이 userId)
- 이메일 인증 콜백: `app/auth/confirm/route.ts`에서 OTP 검증 처리

### 라우트 구조

```
app/
├── page.tsx                 # 공개 홈페이지
├── auth/
│   ├── login/page.tsx       # 로그인
│   ├── sign-up/page.tsx     # 회원가입
│   ├── forgot-password/     # 비밀번호 찾기
│   ├── update-password/     # 비밀번호 변경
│   ├── confirm/route.ts     # 이메일 인증 콜백
│   └── error/page.tsx       # 인증 에러
└── protected/               # 인증 필요 영역
    ├── layout.tsx            # 네비게이션 + 공통 레이아웃
    ├── page.tsx              # 대시보드 (사용자 정보 표시)
    └── profile/page.tsx      # 프로필 설정 (Server Component → ProfileForm Client Component)
```

## 코드 컨벤션

- **임포트 별칭**: `@/` 사용 (상대 경로 금지)
- **컴포넌트 export**: Named export 사용 (페이지는 default export)
- **파일명**: kebab-case (`profile-form.tsx`)
- **컴포넌트명**: PascalCase (`ProfileForm`)
- 파일당 300줄 이하 권장

## 상태관리 전략

- **로컬 UI 상태** (카운터/토글/인풋): `useState`
- **전역 클라이언트 상태** (로그인/테마): Zustand (`'use client'` 필요)
- **서버 데이터** (DB 조회): 서버 컴포넌트 fetch (Zustand에 캐시 금지)

## 폼 패턴

새로운 폼 구현 시 권장 패턴:

- React Hook Form + Zod 조합 사용
- 클라이언트 검증(Zod resolver) + 서버 사이드 검증 이중 적용
- 서버 액션은 `'use server'`로 별도 파일 정의

현재 `ProfileForm`은 간단한 폼으로 `useState`만 사용 중이며, 복잡한 폼에는 `docs/guides/forms-react-hook-form.md` 패턴 참조.

## 개발 가이드 문서

`docs/guides/`에 상세 가이드 포함:

- `project-structure.md` - 폴더 구조 및 네이밍 규칙
- `component-patterns.md` - 컴포넌트 설계 패턴
- `forms-react-hook-form.md` - React Hook Form + Zod 활용
- `nextjs-15.md` - Next.js 15 특화 패턴
- `styling-guide.md` - Tailwind CSS 스타일링 가이드
