# ParkingMeter MVP PRD

> 작성일: 2026-03-02
> 대상: 솔로 개발자 / 소규모 팀
> 현황: nextjs-supabase-app 프로젝트에 추가 구현 (인증/프로필 기능 이미 완성)

---

## 목차

1. [개요](#1-개요)
2. [문제 정의 및 목표](#2-문제-정의-및-목표)
3. [사용자 스토리](#3-사용자-스토리)
4. [기능 요구사항](#4-기능-요구사항)
5. [비기능 요구사항](#5-비기능-요구사항)
6. [기술 스택](#6-기술-스택)
7. [DB 스키마](#7-db-스키마)
8. [라우트 및 페이지 구조](#8-라우트-및-페이지-구조)
9. [구현 우선순위 (Phase)](#9-구현-우선순위-phase)
10. [성공 지표](#10-성공-지표)

---

## 1. 개요

**ParkingMeter**는 유료 주차장 이용 시 실시간 누적 요금을 계산하고, 다음 요금 증가 시점을 미리 알려주는 모바일 퍼스트 웹앱입니다.

- **핵심 가치**: "지금 나가면 얼마?" 를 즉시 알 수 있게 한다
- **타겟 사용자**: 일상적으로 유료 주차장을 이용하는 개인 운전자
- **환경**: 모바일 브라우저 (PWA 미포함, 반응형 웹)

---

## 2. 문제 정의 및 목표

### 문제

| #   | 문제 상황             | 현재 불편함                                                   |
| --- | --------------------- | ------------------------------------------------------------- |
| 1   | 요금이 얼마인지 모름  | 주차요금 안내판을 다시 찾아보거나 암산해야 함                 |
| 2   | 요금 증가 시점 모름   | 10분 단위 요금인데 9분에 나가면 손해, 1분 더 있다 나오면 이득 |
| 3   | 예산 초과 인지 늦음   | 출차 후에야 요금이 예산을 초과했다는 걸 알게 됨               |
| 4   | 월 주차비 파악 어려움 | 한 달에 주차비를 얼마 썼는지 따로 기록하지 않으면 모름        |

### 목표 (MVP 범위)

- 입차 시간과 요금 체계를 입력하면 현재 요금을 실시간으로 계산한다
- 다음 요금 구간까지 남은 시간을 카운트다운으로 보여준다
- 출차 타이밍 비교 카드로 지금/5분 후/10분 후 요금을 한눈에 비교한다
- 세션별 예산 설정 및 예산 소진 경보를 제공한다
- 출차 완료 세션을 저장하고 월별 통계를 제공한다
- 자주 쓰는 주차장 요금 체계를 즐겨찾기로 저장해 빠르게 불러온다

---

## 3. 사용자 스토리

### 핵심 플로우 (로그인 후)

```
[주차 허브 페이지]
  └─ 진행 중 세션 없음 → "주차 시작" 버튼
  └─ 진행 중 세션 있음 → 실시간 계산기로 자동 이동

[세션 시작 페이지]
  1. 즐겨찾기에서 선택 OR 직접 요금 체계 입력
  2. 주차장 이름 (선택)
  3. 예산 금액 (선택)
  4. "주차 시작" 버튼 클릭 → 입차 시간 자동 기록

[실시간 계산기 페이지]
  ├─ 현재 누적 요금 (1초마다 갱신)
  ├─ 다음 요금 증가까지 카운트다운 (MM:SS)
  ├─ 출차 타이밍 비교 카드 (지금/+5분/+10분/+30분)
  ├─ 예산 Progress Bar (예산 설정 시)
  └─ "출차 완료" 버튼 → 출차 완료 결과 페이지

[출차 완료 결과 페이지]
  ├─ 주차 시간 / 총 요금 / 예산 대비 요약
  └─ "홈으로" OR "기록 보기" 이동

[주차 기록 페이지]
  ├─ 월별 통계 (이번 달 총 요금, 세션 수)
  └─ 세션 목록 (날짜, 장소, 시간, 요금)

[즐겨찾기 관리 페이지]
  ├─ 즐겨찾기 주차장 목록
  ├─ 새 즐겨찾기 추가
  └─ 수정 / 삭제
```

### 사용자 스토리 상세

```
As a 운전자,
  I want to 입차 시간과 요금 체계를 입력하면,
  So that 현재까지 쌓인 주차 요금을 실시간으로 확인할 수 있다.

As a 운전자,
  I want to 다음 요금이 오르기까지 남은 시간을 보고 싶다,
  So that 요금 낭비 없이 최적의 출차 타이밍을 잡을 수 있다.

As a 운전자,
  I want to 예산을 설정하고 소진 경보를 받고 싶다,
  So that 예상치 못한 요금 초과를 사전에 방지할 수 있다.

As a 운전자,
  I want to 출차 후 기록이 자동으로 저장되길 바란다,
  So that 월말에 주차비를 따로 계산하지 않아도 된다.

As a 운전자,
  I want to 자주 가는 주차장 요금 체계를 저장해두고 싶다,
  So that 매번 요금 체계를 다시 입력하지 않아도 된다.
```

---

## 4. 기능 요구사항

### F001 - 실시간 요금 계산기 (최우선)

**개요**: 입차 시간과 요금 체계를 기반으로 현재 누적 요금을 1초마다 갱신하여 표시한다.

**요금 체계 구조**:

| 필드                 | 설명                      | 예시     |
| -------------------- | ------------------------- | -------- |
| `base_minutes`       | 기본요금 적용 시간 (분)   | 30분     |
| `base_fee`           | 기본요금 (원)             | 1,000원  |
| `extra_unit_minutes` | 추가요금 단위 시간 (분)   | 10분     |
| `extra_unit_fee`     | 추가요금 단위당 금액 (원) | 500원    |
| `daily_max_fee`      | 일 최대 요금 (원, 선택)   | 10,000원 |

**요금 계산 로직**:

```
function calculateFee(feeStructure, enteredAt, now):
  elapsedMinutes = (now - enteredAt) / 60000
  if elapsedMinutes <= base_minutes:
    fee = base_fee
  else:
    extraMinutes = elapsedMinutes - base_minutes
    extraUnits = ceil(extraMinutes / extra_unit_minutes)
    fee = base_fee + (extraUnits * extra_unit_fee)
  if daily_max_fee:
    fee = min(fee, daily_max_fee)
  return fee
```

**표시 정보**:

- 현재 누적 요금 (1초마다 갱신, 원 단위)
- 현재 구간 정보 (예: "기본요금 구간" / "추가요금 3구간")
- 다음 요금 증가까지 남은 시간 (MM:SS 카운트다운)
- 총 경과 시간 (HH:MM:SS)

---

### F002 - 출차 타이밍 비교 카드

**개요**: 지금/+5분/+10분/+30분 출차 시 예상 요금을 카드 형태로 비교한다.

**카드 구성**:

| 카드      | 설명                                  |
| --------- | ------------------------------------- |
| 지금 출차 | 현재 요금 (현재 구간 강조 하이라이트) |
| +5분 후   | 5분 후 예상 요금                      |
| +10분 후  | 10분 후 예상 요금                     |
| +30분 후  | 30분 후 예상 요금                     |

**표시 규칙**:

- 요금이 현재와 동일하면 "절약 가능 X분" 배지 표시
- 요금이 증가하는 카드에는 증가 금액 표시 (예: "+500원")
- 일 최대요금 도달 시 "최대요금" 배지 표시

---

### F003 - 예산 관리

**개요**: 세션 시작 시 예산을 설정하면 현재 소진율을 Progress Bar로 표시한다.

**Progress Bar 색상 기준**:

| 소진율    | 색상          |
| --------- | ------------- |
| 0 ~ 79%   | 초록 (green)  |
| 80 ~ 99%  | 노랑 (yellow) |
| 100% 이상 | 빨강 (red)    |

**표시 정보**:

- 예산 대비 현재 요금 (예: "3,000 / 5,000원")
- 예산까지 남은 금액
- 예산 소진 시까지 남은 예상 시간 (예: "약 12분 후 예산 소진")
- 예산 초과 시: "예산 초과!" 경고 텍스트 표시

---

### F004 - 주차 세션 저장 및 기록 조회

**개요**: 출차 완료 시 세션을 저장하고, 기록 페이지에서 월별 통계와 목록을 제공한다.

**출차 완료 시 저장 항목**:

- 입차 시간 / 출차 시간
- 총 주차 시간 (분)
- 총 요금 (원)
- 주차장 이름 (입력한 경우)
- 사용된 요금 체계 스냅샷 (원본 수정 시에도 기록 보존)

**기록 페이지 표시**:

- 이번 달 총 주차 요금 합계
- 이번 달 세션 수
- 세션 목록 (날짜 내림차순): 날짜/시간, 주차장명, 주차 시간, 요금
- 이전 달 기록 조회 (월 선택)

---

### F005 - 즐겨찾기 주차장 관리

**개요**: 자주 사용하는 주차장의 요금 체계를 저장하고 세션 시작 시 빠르게 불러온다.

**즐겨찾기 저장 필드**:

- 주차장 이름 (필수)
- 주소 (선택)
- 요금 체계 (base_minutes, base_fee, extra_unit_minutes, extra_unit_fee, daily_max_fee)

**사용 흐름**:

- 세션 시작 페이지에서 즐겨찾기 목록 표시
- 선택 시 요금 체계 자동 입력
- 세션 완료 후 현재 요금 체계를 즐겨찾기로 저장하는 옵션 제공

---

### F006 - 인증 (기존 구현 활용)

기존 nextjs-supabase-app의 인증 기능을 그대로 사용한다.

- 로그인 / 로그아웃 / 회원가입 (이미 구현됨)
- `app/protected/parking/` 하위 모든 라우트는 인증 필수
- 미인증 사용자는 `/auth/login`으로 리다이렉트 (기존 미들웨어 처리)

---

## 5. 비기능 요구사항

### 모바일 퍼스트 UI

- 기준 화면: 375px (iPhone SE) 이상
- 터치 타겟 최소 44px
- 한 손 조작 고려 (주요 버튼은 하단 배치)
- 가독성: 요금 숫자는 최소 2xl (32px) 이상으로 크게 표시

### 성능

- 실시간 타이머: `setInterval(1000ms)` 기반, 컴포넌트 unmount 시 반드시 `clearInterval`
- 요금 계산: 순수 함수로 구현 (부수효과 없음), 클라이언트에서 실행
- DB 호출 최소화: 세션 시작/종료, 즐겨찾기 CRUD 시에만 호출

### 데이터 무결성

- 진행 중 세션은 `exited_at = null` 로 구분
- 사용자당 진행 중 세션은 1개만 허용 (시작 전 체크)
- 요금 체계 스냅샷: `parking_sessions` 에 복사 저장 (즐겨찾기 수정과 독립)
- RLS: 본인 데이터만 접근 가능

### 에러 처리

- 네트워크 오류 시 사용자 친화적 메시지 표시
- 세션 시작 실패 시 롤백 처리
- 브라우저 뒤로가기로 진행 중 세션 이탈 시 세션 유지 (허브에서 재진입 가능)

---

## 6. 기술 스택

기존 프로젝트 스택을 그대로 활용한다.

### 프론트엔드

| 기술         | 버전            | 용도                                           |
| ------------ | --------------- | ---------------------------------------------- |
| Next.js      | 15 (App Router) | 풀스택 프레임워크                              |
| React        | 19              | UI 라이브러리                                  |
| TypeScript   | 5.6+            | 타입 안전성                                    |
| Tailwind CSS | v4              | 스타일링                                       |
| shadcn/ui    | 최신            | UI 컴포넌트 (Card, Progress, Badge, Button 등) |
| Lucide React | 최신            | 아이콘                                         |

### 상태 관리

| 상태 종류          | 방법                       | 이유                               |
| ------------------ | -------------------------- | ---------------------------------- |
| 타이머/실시간 요금 | `useState` + `setInterval` | 컴포넌트 로컬 상태, Zustand 불필요 |
| 세션 데이터        | 서버 컴포넌트 fetch        | DB 데이터, 캐시 불필요             |
| 전역 로그인 상태   | Supabase 기존 처리         | 기존 구현 활용                     |

### 폼

| 기술            | 용도                       |
| --------------- | -------------------------- |
| React Hook Form | 세션 시작 폼, 즐겨찾기 폼  |
| Zod             | 요금 체계 입력 유효성 검증 |

### 백엔드 / DB

| 기술                   | 용도                        |
| ---------------------- | --------------------------- |
| Supabase               | 인증, PostgreSQL, RLS       |
| Supabase Server Client | Service / Repository 레이어 |

### 아키텍처 패턴

기존 레이어드 아키텍처를 그대로 따른다.

```
Page (app/protected/parking/*/page.tsx)
  └→ Service (lib/services/parking*.service.ts)
       └→ Repository (lib/repositories/parking*.repository.ts)
```

---

## 7. DB 스키마

### 테이블: `parking_lots` (즐겨찾기 주차장)

```sql
CREATE TABLE parking_lots (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  address             TEXT,
  base_minutes        INTEGER NOT NULL DEFAULT 30,   -- 기본요금 적용 시간 (분)
  base_fee            INTEGER NOT NULL DEFAULT 1000, -- 기본요금 (원)
  extra_unit_minutes  INTEGER NOT NULL DEFAULT 10,   -- 추가요금 단위 시간 (분)
  extra_unit_fee      INTEGER NOT NULL DEFAULT 500,  -- 추가요금 단위당 금액 (원)
  daily_max_fee       INTEGER,                        -- 일 최대요금 (원, NULL=제한없음)
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- RLS 설정
ALTER TABLE parking_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 데이터만 접근" ON parking_lots
  FOR ALL USING (auth.uid() = user_id);
```

### 테이블: `parking_sessions` (주차 세션)

```sql
CREATE TABLE parking_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parking_lot_id      UUID REFERENCES parking_lots(id) ON DELETE SET NULL,  -- NULL 허용 (직접 입력)
  lot_name            TEXT,             -- 주차장 이름 (스냅샷)
  -- 요금 체계 스냅샷 (즐겨찾기 수정 시에도 기록 보존)
  base_minutes        INTEGER NOT NULL,
  base_fee            INTEGER NOT NULL,
  extra_unit_minutes  INTEGER NOT NULL,
  extra_unit_fee      INTEGER NOT NULL,
  daily_max_fee       INTEGER,
  -- 세션 데이터
  entered_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  exited_at           TIMESTAMPTZ,      -- NULL = 진행 중
  budget              INTEGER,          -- 세션 예산 (원, NULL=설정 안 함)
  total_fee           INTEGER,          -- 출차 완료 후 최종 요금 (원)
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- RLS 설정
ALTER TABLE parking_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 데이터만 접근" ON parking_sessions
  FOR ALL USING (auth.uid() = user_id);

-- 인덱스 (월별 통계 조회 성능)
CREATE INDEX idx_parking_sessions_user_entered
  ON parking_sessions(user_id, entered_at DESC);
```

### 타입 정의 위치

```
lib/types/parking.types.ts
  ├── ParkingLot              (DB 행 타입)
  ├── CreateParkingLotDto     (생성 DTO)
  ├── UpdateParkingLotDto     (수정 DTO)
  ├── ParkingSession          (DB 행 타입)
  ├── CreateParkingSessionDto (생성 DTO)
  ├── FeeStructure            (요금 체계 공통 인터페이스)
  └── ParkingResult<T>        (= { data: T | null, error: string | null })
```

---

## 8. 라우트 및 페이지 구조

### 라우트 맵

```
app/protected/parking/
├── page.tsx                      # 허브: 진행 중 세션 분기
├── session/
│   ├── new/
│   │   └── page.tsx              # 세션 시작 (요금 체계 입력)
│   └── [id]/
│       ├── page.tsx              # 실시간 계산기
│       └── result/
│           └── page.tsx          # 출차 완료 결과
├── history/
│   └── page.tsx                  # 기록 + 월별 통계
└── favorites/
    └── page.tsx                  # 즐겨찾기 관리
```

### 페이지별 역할

| 페이지                                   | 역할                                      | 주요 컴포넌트                            |
| ---------------------------------------- | ----------------------------------------- | ---------------------------------------- |
| `/protected/parking`                     | 허브. 진행 중 세션 유무 체크 후 분기      | `SessionStatusCard`, `StartButton`       |
| `/protected/parking/session/new`         | 세션 시작 폼 (즐겨찾기 선택 OR 직접 입력) | `FavoriteSelector`, `FeeStructureForm`   |
| `/protected/parking/session/[id]`        | 실시간 계산기 (핵심 화면)                 | `FeeCounter`, `TimingCards`, `BudgetBar` |
| `/protected/parking/session/[id]/result` | 출차 완료 요약                            | `SessionSummary`                         |
| `/protected/parking/history`             | 월별 통계 + 세션 목록                     | `MonthlyStats`, `SessionList`            |
| `/protected/parking/favorites`           | 즐겨찾기 CRUD                             | `FavoriteList`, `FavoriteForm`           |

### 컴포넌트 파일 구조 (권장)

```
components/parking/
├── fee-counter.tsx          # 현재 요금 + 카운트다운 (Client)
├── timing-cards.tsx         # 출차 타이밍 비교 카드 (Client)
├── budget-bar.tsx           # 예산 Progress Bar (Client)
├── fee-structure-form.tsx   # 요금 체계 입력 폼 (Client)
├── favorite-selector.tsx    # 즐겨찾기 선택 UI (Client)
├── session-list.tsx         # 세션 목록 (Server)
└── monthly-stats.tsx        # 월별 통계 카드 (Server)

lib/
├── types/parking.types.ts
├── utils/parking-fee.ts        # calculateFee() 순수 함수
├── services/
│   ├── parking-session.service.ts
│   └── parking-lot.service.ts
└── repositories/
    ├── parking-session.repository.ts
    └── parking-lot.repository.ts
```

### 네비게이션 연결

기존 `app/protected/layout.tsx` 헤더에 "주차" 링크 추가:

```tsx
<Link href="/protected/parking">주차</Link>
```

---

## 9. 구현 우선순위 (Phase)

### Phase 1: 기반 작업 (DB + 타입 + 유틸)

- [ ] DB 마이그레이션 실행 (`parking_lots`, `parking_sessions` 테이블 생성)
- [ ] RLS 정책 설정 확인
- [ ] `lib/types/parking.types.ts` 작성 (인터페이스 + DTO 전체)
- [ ] `lib/utils/parking-fee.ts` 작성 (`calculateFee` 순수 함수 + 테스트)
- [ ] Repository 레이어 작성 (기본 CRUD)
- [ ] Service 레이어 작성 (비즈니스 로직 포함)

**완료 기준**: `calculateFee` 함수 단위 테스트 통과, DB 쿼리 정상 동작 확인

---

### Phase 2: 핵심 계산기 (세션 시작 → 진행 → 종료)

- [ ] `/protected/parking/session/new/page.tsx`: 직접 입력 폼 (즐겨찾기 없이)
- [ ] `/protected/parking/session/[id]/page.tsx`: 실시간 계산기
  - `FeeCounter` 컴포넌트 (1초 타이머)
  - `TimingCards` 컴포넌트 (지금/+5/+10/+30분 비교)
  - `BudgetBar` 컴포넌트 (예산 Progress)
  - "출차 완료" 버튼 처리
- [ ] `/protected/parking/session/[id]/result/page.tsx`: 완료 결과 화면
- [ ] `/protected/parking/page.tsx`: 허브 (진행 중 세션 분기)
- [ ] `app/protected/layout.tsx` 헤더에 "주차" 링크 추가

**완료 기준**: 세션 시작 → 실시간 요금 확인 → 출차 완료까지 전체 플로우 동작

---

### Phase 3: 즐겨찾기

- [ ] `/protected/parking/favorites/page.tsx`: 목록 + 추가/수정/삭제
- [ ] `FavoriteSelector` 컴포넌트 세션 시작 폼에 연동

**완료 기준**: 즐겨찾기 저장 후 세션 시작 시 자동 입력 동작

---

### Phase 4: 기록 및 통계

- [ ] `/protected/parking/history/page.tsx`: 세션 목록 + 월별 통계
- [ ] 월 선택 필터 구현

**완료 기준**: 지난 3개월 이상의 기록 조회 및 통계 표시

---

### Phase 5: UI 마무리

- [ ] 모바일 레이아웃 최적화 (375px 기준 점검)
- [ ] 로딩 상태 처리 (`loading.tsx`, Skeleton)
- [ ] 에러 상태 처리 (`error.tsx`)
- [ ] 빈 상태 UI (기록 없음, 즐겨찾기 없음 등)
- [ ] 다크모드 호환 확인 (기존 ThemeSwitcher와 연동)

**완료 기준**: 주요 디바이스(iPhone SE, iPhone 14, Galaxy S23)에서 UI 확인

---

## 10. 성공 지표

### 기능적 완성 기준

| 항목             | 기준                                   |
| ---------------- | -------------------------------------- |
| 요금 계산 정확도 | 수동 계산과 100% 일치                  |
| 타이머 정확도    | 1초 이내 오차                          |
| 세션 데이터 저장 | 출차 완료 후 기록 페이지에서 즉시 확인 |
| RLS 보안         | 다른 사용자의 데이터에 접근 불가       |

### 사용성 기준

| 항목                | 기준                                              |
| ------------------- | ------------------------------------------------- |
| 세션 시작 소요 시간 | 즐겨찾기 선택 시 30초 이내, 직접 입력 시 2분 이내 |
| 실시간 화면 가독성  | 현재 요금이 화면 진입 즉시 보임                   |
| 모바일 레이아웃     | 가로 스크롤 없음, 주요 버튼 한 손 도달 가능       |

---

## 부록: 핵심 계산 함수 명세

```typescript
// lib/utils/parking-fee.ts

export interface FeeStructure {
  baseMinutes: number // 기본요금 적용 시간 (분)
  baseFee: number // 기본요금 (원)
  extraUnitMinutes: number // 추가요금 단위 시간 (분)
  extraUnitFee: number // 추가요금 단위당 금액 (원)
  dailyMaxFee?: number // 일 최대요금 (원, undefined=제한없음)
}

export interface FeeResult {
  currentFee: number // 현재 누적 요금 (원)
  nextIncreaseSec: number // 다음 요금 증가까지 초
  currentInterval: number // 현재 요금 구간 (0=기본, 1=추가 1구간, ...)
  isMaxFee: boolean // 일 최대요금 도달 여부
}

// 핵심 함수
export function calculateFee(feeStructure: FeeStructure, enteredAt: Date, now: Date): FeeResult

// 타이밍 비교 함수
export function calculateFeeAtOffset(
  feeStructure: FeeStructure,
  enteredAt: Date,
  now: Date,
  offsetMinutes: number // 0, 5, 10, 30
): number

// 예산 소진까지 남은 시간
export function estimateTimeTobudget(
  feeStructure: FeeStructure,
  enteredAt: Date,
  now: Date,
  budget: number
): number | null // null = 이미 초과 or 최대요금 이하
```

---

_이 PRD는 살아있는 문서입니다. 구현 과정에서 발견되는 엣지 케이스나 변경 사항은 해당 섹션에 직접 업데이트하세요._
