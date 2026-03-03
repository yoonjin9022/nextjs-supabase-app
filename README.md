# ParkingMeter

유료 주차장 이용 시 실시간 누적 요금을 계산하고, 최적의 출차 타이밍을 안내하는 모바일 퍼스트 웹앱.

## 주요 기능

- **실시간 요금 계산**: 입차 시간과 요금 체계를 기반으로 현재 누적 요금을 1초마다 갱신
- **출차 타이밍 비교**: 지금/+5분/+10분/+30분 출차 시 예상 요금을 카드 형태로 비교
- **예산 관리**: 세션별 예산 설정 및 소진율 Progress Bar 표시
- **주차 기록 및 통계**: 출차 완료 세션 자동 저장, 월별 통계 제공
- **즐겨찾기**: 자주 쓰는 주차장 요금 체계를 저장하여 빠르게 불러오기

## 기술 스택

| 영역        | 기술                               |
| ----------- | ---------------------------------- |
| 프레임워크  | Next.js 15 (App Router)            |
| 언어        | TypeScript 5                       |
| 스타일      | Tailwind CSS 4                     |
| UI 컴포넌트 | shadcn/ui                          |
| 백엔드      | Supabase (PostgreSQL + Auth + RLS) |
| 폼          | React Hook Form + Zod              |
| 모니터링    | Vercel Analytics                   |

## 아키텍처

```
app/                          # Next.js App Router 페이지
  protected/                  # 인증 필요 영역
    parking/                  # 주차 기능 허브
      session/[id]/           # 실시간 계산기
      history/                # 기록 및 통계
      favorites/              # 즐겨찾기
  auth/                       # 인증 페이지

components/
  parking/                    # 주차 기능 컴포넌트
  layout/                     # 앱 레이아웃 컴포넌트

lib/
  services/                   # 비즈니스 로직 레이어
  repositories/               # DB 접근 레이어
  types/                      # TypeScript 타입 정의
  utils/                      # 순수 함수 유틸리티
  supabase/                   # Supabase 클라이언트
```

**레이어드 아키텍처:**

```
Page (app/protected/*/page.tsx)
  └→ Service (lib/services/*.service.ts)
       └→ Repository (lib/repositories/*.repository.ts)
            └→ Supabase Client
```

## 로컬 개발 설정

### 1. 저장소 클론

```bash
git clone <repository-url>
cd nextjs-supabase-app
npm install
```

### 2. 환경 변수 설정

루트에 `.env.local` 파일을 생성하고 아래 값을 설정합니다:

```bash
# Supabase 프로젝트 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=<Supabase 프로젝트 URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable 또는 anon 키>
```

> **Supabase 설정값 확인**: Supabase 대시보드 → Project Settings → API에서 확인

### 3. 개발 서버 실행

```bash
npm run dev
# http://localhost:3000 에서 확인
```

## 개발 명령어

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint 검사
npm run lint:fix     # ESLint 자동 수정
npm run format       # Prettier 포맷
npm run typecheck    # TypeScript 타입 체크
npm run test         # Vitest 단위 테스트
npm run analyze      # 번들 크기 분석
```

## Vercel 배포 가이드

### 1. Vercel 프로젝트 연결

1. [Vercel Dashboard](https://vercel.com/dashboard)에서 **Add New Project** 클릭
2. GitHub 리포지토리 선택 후 **Import**
3. Framework Preset: **Next.js** 자동 감지 확인

### 2. 환경 변수 설정

Vercel Dashboard → Project → Settings → Environment Variables에서 아래 변수를 추가합니다:

| 변수명                                 | 설명                     | 환경                             |
| -------------------------------------- | ------------------------ | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase 프로젝트 URL    | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key | Production, Preview, Development |

> `VERCEL_URL`은 Vercel이 자동으로 설정하는 변수로 별도 설정이 필요하지 않습니다.

### 3. Supabase Auth Redirect URL 설정

Supabase Dashboard → Authentication → URL Configuration에서 아래 항목을 추가합니다:

**Site URL:**

```
https://your-project.vercel.app
```

**Redirect URLs:**

```
https://your-project.vercel.app/auth/confirm
https://your-project.vercel.app/auth/callback
https://*-your-vercel-team.vercel.app/auth/confirm
https://*-your-vercel-team.vercel.app/auth/callback
```

> Preview 배포용 와일드카드 URL을 추가하면 PR별 Preview 환경에서도 인증이 동작합니다.

### 4. 배포 확인 항목

배포 후 아래 기능을 순서대로 확인합니다:

- [ ] 로그인/회원가입 동작
- [ ] 주차 세션 시작 (요금 체계 입력 → 계산기 이동)
- [ ] 실시간 요금 계산 동작
- [ ] 출차 완료 및 결과 페이지
- [ ] 즐겨찾기 저장/불러오기
- [ ] 기록/월별 통계 조회

## 모니터링

### Vercel Analytics

[Vercel Dashboard](https://vercel.com) → Analytics 탭에서 아래 지표를 확인할 수 있습니다:

- 페이지뷰 및 방문자 통계
- Core Web Vitals (LCP, CLS, INP, TTFB, FCP) 자동 수집

### Lighthouse CI

`.lighthouserc.js`에 기준점이 설정되어 있습니다 (각 카테고리 90점 이상):

```bash
npx lhci autorun
```
