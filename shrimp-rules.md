# AI Agent 개발 가이드라인

## 1. 프로젝트 개요

- **프레임워크**: Next.js 15 (App Router) + React 19
- **언어**: TypeScript
- **DB/인증**: Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **스타일**: Tailwind CSS + shadcn/ui (Radix UI 기반)
- **패키지 매니저**: npm

## 2. 디렉토리 구조

```
/
├── app/                    # Next.js App Router 페이지
│   ├── auth/               # 인증 관련 페이지 (login, sign-up, forgot-password 등)
│   ├── protected/          # 인증 필요 페이지 (layout.tsx + page.tsx)
│   └── page.tsx            # 공개 홈페이지
├── components/             # 재사용 UI 컴포넌트 (kebab-case 파일명)
│   └── ui/                 # shadcn/ui 컴포넌트
├── lib/
│   ├── repositories/       # DB 접근 레이어 (*.repository.ts)
│   ├── services/           # 비즈니스 로직 레이어 (*.service.ts)
│   ├── supabase/           # Supabase 클라이언트 설정
│   │   ├── server.ts       # 서버 컴포넌트용 클라이언트
│   │   ├── client.ts       # 클라이언트 컴포넌트용 클라이언트
│   │   └── proxy.ts        # 미들웨어용 세션 갱신
│   └── types/              # TypeScript 인터페이스 및 DTO (*.types.ts)
├── proxy.ts                # ⚠️ Next.js 미들웨어 진입점 (middleware.ts가 아님)
└── docs/                   # 개발 가이드 문서
```

## 3. 레이어드 아키텍처 규칙

### 3.1 레이어 책임

| 레이어     | 파일 위치                          | 책임                       | 반환 타입            |
| ---------- | ---------------------------------- | -------------------------- | -------------------- |
| Page       | `app/**/page.tsx`                  | 렌더링, Service 호출       | JSX                  |
| Service    | `lib/services/*.service.ts`        | 비즈니스 로직, 유효성 검증 | `Promise<Result<T>>` |
| Repository | `lib/repositories/*.repository.ts` | DB 접근만 담당             | `Promise<T \| null>` |

### 3.2 Service 구현 규칙

- 반드시 `try/catch`로 에러를 처리하고 `{ data, error }` 형식으로 반환
- 비즈니스 유효성 검증(포맷, 제약 조건 등)은 Service에서 처리
- Repository 반환이 `null`이면 에러 메시지와 함께 반환

```
// 올바른 패턴
export async function getXxx(id: string): Promise<XxxResult<Xxx>> {
  try {
    const data = await findXxxById(id)
    if (!data) return { data: null, error: '찾을 수 없습니다.' }
    return { data, error: null }
  } catch (err) {
    console.error('[XxxService] getXxx 오류:', err)
    return { data: null, error: '오류가 발생했습니다.' }
  }
}
```

### 3.3 Repository 구현 규칙

- `createClient()`를 **함수 내부**에서 매번 새로 호출 (전역 변수 저장 금지)
- 오류 발생 시 `console.error`로 로깅 후 `null` 반환
- `select()`, `update()`, `insert()`, `delete()` 결과에서 `error`가 있으면 `null` 반환

```
// 올바른 패턴
export async function findXxxById(id: string): Promise<Xxx | null> {
  const supabase = await createClient()  // ← 항상 함수 내부에서 새로 생성
  const { data, error } = await supabase.from('table').select('*').eq('id', id).single()
  if (error) {
    console.error('[XxxRepository] 오류:', error)
    return null
  }
  return data
}
```

## 4. Supabase 클라이언트 사용 규칙

| 사용 위치                                            | import 경로                                            |
| ---------------------------------------------------- | ------------------------------------------------------ |
| Server Component, Route Handler, Service, Repository | `import { createClient } from '@/lib/supabase/server'` |
| Client Component (`'use client'`)                    | `import { createClient } from '@/lib/supabase/client'` |
| proxy.ts (미들웨어)                                  | `import { updateSession } from '@/lib/supabase/proxy'` |

- **인증 확인**: `supabase.auth.getClaims()` 사용, `data.claims.sub`이 userId
- **서버 클라이언트**: `await createClient()` (비동기), 전역 변수에 저장 금지
- **클라이언트 클라이언트**: `createClient()` (동기)

## 5. 타입/DTO 규칙

- 모든 타입과 인터페이스는 `lib/types/*.types.ts`에 정의
- DB 테이블과 1:1 대응하는 인터페이스: `XxxName` (예: `Profile`)
- 생성/수정 요청 DTO: `CreateXxxDto`, `UpdateXxxDto`
- Service/Repository 공통 응답 타입: `XxxResult<T>` → `{ data: T | null, error: string | null }`
- 새 도메인 추가 시 반드시 `lib/types/xxx.types.ts` 파일 먼저 생성

## 6. 코드 컨벤션

### 6.1 포맷팅

- 들여쓰기: 스페이스 2칸
- 세미콜론: **사용하지 않음**
- 따옴표: **작은 따옴표('')** 사용
- 임포트 별칭: **`@/`** 사용 (상대 경로 `../` 금지)

### 6.2 네이밍

- 파일명: `kebab-case.tsx` (예: `profile-form.tsx`)
- 컴포넌트명: `PascalCase` (예: `ProfileForm`)
- 함수명/변수명: `camelCase`
- 타입/인터페이스: `PascalCase`

### 6.3 컴포넌트 export

- 페이지(`page.tsx`): `export default function Page`
- 그 외 컴포넌트: `export function ComponentName` (named export)
- 레이아웃(`layout.tsx`): `export default function Layout`

### 6.4 임포트 순서 (simple-import-sort 자동 적용)

1. 외부 패키지
2. 내부 모듈 (`@/...`)
3. 상대 경로 (최소화)

## 7. 상태관리 규칙

| 상태 종류                                 | 사용 방법                               |
| ----------------------------------------- | --------------------------------------- |
| 로컬 UI 상태 (카운터, 토글, 모달, 입력값) | `useState` / `useReducer`               |
| 전역 클라이언트 상태 (로그인, 테마)       | Zustand (현재 미설치, 필요 시 설치)     |
| 서버 데이터 (DB 조회 결과)                | 서버 컴포넌트 fetch (Zustand 캐시 금지) |

- Zustand 스토어를 사용하는 컴포넌트는 반드시 `'use client'` 선언
- 서버 데이터를 Zustand에 캐시하지 말 것

## 8. 폼 구현 규칙

- **단순 폼**: `useState`로 관리 (현재 `ProfileForm` 방식)
- **복잡한 폼**: React Hook Form + Zod (현재 미설치, 필요 시 `npm install react-hook-form zod @hookform/resolvers`)
- 클라이언트 유효성 검증 + 서버 사이드 유효성 검증 이중 적용
- 서버 액션은 `'use server'` 디렉티브로 별도 파일에 정의

## 9. 라우트 및 인증 규칙

- **미들웨어 파일**: `proxy.ts` (루트 경로, `middleware.ts`가 아님)
- 미인증 사용자 리다이렉트: `/auth/login` (루트 `/` 제외)
- 이메일 인증 콜백: `app/auth/confirm/route.ts`
- 소셜 로그인 콜백: `app/auth/callback/route.ts`
- 보호된 페이지는 `app/protected/` 하위에 배치

## 10. 새 기능 추가 시 파일 생성 순서

새 도메인(예: `Post`)을 추가할 때 아래 순서를 따를 것:

1. `lib/types/post.types.ts` — 인터페이스 및 DTO 정의
2. `lib/repositories/post.repository.ts` — DB 접근 함수
3. `lib/services/post.service.ts` — 비즈니스 로직
4. `app/protected/posts/page.tsx` — 페이지 (서버 컴포넌트)
5. `components/post-form.tsx` — 클라이언트 컴포넌트 (필요 시)

## 11. shadcn/ui 컴포넌트 규칙

- `components/ui/` 폴더에 자동 설치됨
- 직접 수정하지 말 것 (업그레이드 시 덮어쓰여짐)
- 설치 후 `npm run format` 실행 필요 (따옴표 스타일 통일)
- 컴포넌트 추가: `npx shadcn@latest add <component-name>`

## 12. 금지 사항

- `../` 상대 경로 임포트 사용 (→ `@/` 사용)
- Supabase 서버 클라이언트를 전역 변수에 저장
- `middleware.ts` 파일 생성 (미들웨어는 `proxy.ts`)
- 서버 데이터를 Zustand에 캐시
- `components/ui/` 하위 shadcn 컴포넌트 직접 수정
- Repository에서 비즈니스 로직 처리 (→ Service에서 처리)
- Service에서 직접 Supabase 클라이언트 사용 (→ Repository를 통해 접근)
- `export default`를 페이지/레이아웃 외 컴포넌트에 사용
- 세미콜론 추가
- 큰 따옴표("") 사용 (→ 작은 따옴표('') 사용)
- 파일당 300줄 초과 (분리 필요)

## 13. AI 의사결정 규칙

### 13.1 컴포넌트 배치 결정

```
클라이언트 상태/이벤트 핸들러/브라우저 API 필요?
  → YES: 'use client' 선언 후 components/ 에 배치
  → NO: 서버 컴포넌트로 app/**/page.tsx 에 직접 구현
```

### 13.2 데이터 조회 결정

```
데이터가 사용자별로 다른가?
  → YES: Server Component에서 Service 호출 후 props 전달
  → NO (공통 데이터): 동일하게 Server Component에서 처리
절대로 클라이언트에서 Supabase 직접 조회 금지 (보안)
```

### 13.3 에러 처리 결정

```
Repository 레이어: error 발생 → console.error → null 반환
Service 레이어: null 수신 → { data: null, error: '메시지' } 반환
Page 레이어: error 수신 → 사용자에게 에러 표시
```
