# ParkingMeter MVP 개발 로드맵

유료 주차장 이용 시 실시간 누적 요금을 계산하고, 최적의 출차 타이밍을 안내하는 모바일 퍼스트 웹앱

## 개요

**ParkingMeter**는 일상적으로 유료 주차장을 이용하는 운전자를 위한 실시간 주차 요금 계산기로, 다음 기능을 제공합니다:

- **실시간 요금 계산**: 입차 시간과 요금 체계를 기반으로 현재 누적 요금을 1초마다 갱신
- **출차 타이밍 비교**: 지금/+5분/+10분/+30분 출차 시 예상 요금을 카드 형태로 비교
- **예산 관리**: 세션별 예산 설정 및 소진율 Progress Bar 표시
- **주차 기록 및 통계**: 출차 완료 세션 자동 저장, 월별 통계 제공
- **즐겨찾기**: 자주 쓰는 주차장 요금 체계를 저장하여 빠르게 불러오기

> 기존 nextjs-supabase-app 프로젝트에 추가 구현 (인증/프로필 기능 이미 완성)

> **개발 전략: UI 먼저 개발 후 DB 연동**
> 목업 데이터로 모든 UI/UX를 먼저 완성한 뒤, 보완할 부분을 확인하고 데이터베이스 스키마 및 Supabase 설정을 진행합니다.
> 이를 통해 UI 검증 후 확정된 구조를 기반으로 안정적인 DB 설계가 가능합니다.

## 전체 진행 상황

| Phase    | 설명                                | 상태    | Task 수 |
| -------- | ----------------------------------- | ------- | ------- |
| Phase 0  | 홈 화면 교체 (랜딩/대시보드 UI)     | ✅ 완료 | 1       |
| Phase 1  | UI/UX 프로토타입 (목업 데이터)      | ✅ 완료 | 5       |
| Phase 2  | 요금 계산 로직 (순수 함수 + 타입)   | ✅ 완료 | 2       |
| Phase 3  | 데이터베이스 연동 (핵심 기능)       | ✅ 완료 | 3       |
| Phase 4  | 즐겨찾기 DB 연동                    | ✅ 완료 | 1       |
| Phase 5  | 기록/통계 DB 연동 및 최종 품질 보증 | ✅ 완료 | 2       |
| Phase 6  | 성능 최적화                         | ⏳ 예정 | 2       |
| Phase 7  | SEO 및 접근성                       | ⏳ 예정 | 1       |
| Phase 8  | 배포 및 모니터링                    | ⏳ 예정 | 2       |
| **합계** |                                     |         | **19**  |

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-calculator-ui.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - API/비즈니스 로직 작업 시 "테스트 체크리스트" 섹션 필수 포함

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 완료 표시로 변경

---

## 개발 단계

### Phase 0: 홈 화면 교체 (랜딩/대시보드 UI) ✅

Supabase 기본 템플릿 화면을 ParkingMeter 브랜드 UI로 교체하는 단계.

**완료 기준**: 공개 랜딩 페이지(`/`)와 인증된 홈 대시보드(`/protected`)가 ParkingMeter 맥락의 모바일 퍼스트 UI로 렌더링

- [x] **TASK-000: 홈 화면 교체** ✅ - 완료
  - ✅ `app/page.tsx` → ParkingMeter 브랜드 랜딩 페이지로 교체
    - ✅ `max-w-[430px]` 모바일 퍼스트 레이아웃
    - ✅ ParkingSquare 아이콘 + 앱명 + 핵심 가치 문구
    - ✅ 핵심 기능 3가지 소개 카드 (실시간 요금 계산, 출차 타이밍 비교, 예산 관리)
    - ✅ 시작하기(회원가입)/로그인 CTA 버튼
    - ✅ ThemeSwitcher 유지
  - ✅ `app/protected/page.tsx` → ParkingMeter 홈 대시보드로 교체
    - ✅ 인증된 사용자 환영 메시지 (이메일 기반 displayName)
    - ✅ 진행 중인 세션 카드 (있음/없음 조건부 UI)
    - ✅ 이번 달 주차비 요약 (`MonthlyStats` 재사용)
    - ✅ 빠른 액션 버튼 (새 주차 시작, 기록 보기)

---

### Phase 1: UI/UX 프로토타입 (목업 데이터) ✅

모든 페이지와 컴포넌트를 목업 데이터로 먼저 구현하여 UI/UX를 검증하는 단계.
DB 연동 없이 하드코딩된 더미 데이터를 사용하며, 전체 사용자 플로우를 시각적으로 확인한다.

**완료 기준**: 모든 페이지가 목업 데이터로 렌더링되고, 세션 시작 - 실시간 계산기 - 출차 완료 - 기록/즐겨찾기 전체 네비게이션 플로우가 동작

- [x] **TASK-001: 핵심 계산기 UI 구현 (목업 데이터)** ✅ - 완료
  - ✅ `/protected/parking/session/[id]/page.tsx` 생성 (목업 세션 데이터 사용)
  - ✅ `components/parking/fee-counter.tsx` 구현 (Client Component)
    - ✅ `setInterval(1000ms)` 기반 1초마다 요금 갱신 (하드코딩된 요금 체계 사용)
    - ✅ 현재 누적 요금 (큰 폰트, 2xl 이상), 다음 요금 증가까지 카운트다운 (MM:SS)
    - ✅ 현재 구간 정보 표시, 총 경과 시간 표시 (HH:MM:SS)
    - ✅ unmount 시 `clearInterval` 처리 필수
  - ✅ `components/parking/timing-cards.tsx` 구현 (Client Component)
    - ✅ 지금/+5분/+10분/+30분 출차 시 예상 요금 카드 4개
    - ✅ 요금 동일 시 "절약 가능 X분" 배지, 증가 시 "+N원" 표시
    - ✅ 일 최대요금 도달 시 "최대요금" 배지
  - ✅ `components/parking/budget-bar.tsx` 구현 (Client Component)
    - ✅ shadcn/ui Progress 컴포넌트 활용
    - ✅ 소진율별 색상 변경 (0-79% 초록, 80-99% 노랑, 100%+ 빨강)
    - ✅ 예산 대비 현재 요금, 남은 금액, 예산 소진 예상 시간 표시
  - ✅ 모바일 퍼스트 레이아웃 (터치 타겟 44px 이상)

- [x] **TASK-002: 세션 시작 폼 및 출차 완료 결과 UI 구현** ✅ - 완료
  - ✅ `/protected/parking/session/new/page.tsx` 생성
  - ✅ `components/parking/fee-structure-form.tsx` 구현: React Hook Form + Zod 기반 요금 체계 입력 폼
    - ✅ 기본요금 시간(분), 기본요금(원), 추가 단위 시간(분), 추가 단위 요금(원), 일 최대요금(선택)
    - ✅ 주차장 이름(선택), 예산(선택) 입력 필드
    - ✅ 폼 제출 시 목업 세션 ID로 계산기 페이지 이동 (서버 액션 없이)
  - ✅ `/protected/parking/session/[id]/result/page.tsx` 생성
    - ✅ 주차 시간 / 총 요금 / 예산 대비 요약 표시 (목업 데이터)
    - ✅ "홈으로" / "기록 보기" 네비게이션 버튼
    - ✅ "즐겨찾기 저장" 옵션 (UI만 구현)

- [x] **TASK-003: 주차 허브 및 즐겨찾기/기록 페이지 UI 구현** ✅ - 완료
  - ✅ `/protected/parking/page.tsx` 생성 (허브 페이지)
    - ✅ 진행 중 세션 있음/없음 양쪽 상태 UI 구현 (목업 토글 가능)
    - ✅ "주차 시작" 버튼, 세션 정보 카드, 최근 기록 미리보기
  - ✅ `/protected/parking/favorites/page.tsx` 생성 (즐겨찾기 관리 페이지)
    - ✅ 즐겨찾기 목록 표시 (목업 데이터)
    - ✅ 새 즐겨찾기 추가 폼 UI (React Hook Form + Zod)
    - ✅ 수정/삭제 UI
    - ✅ 빈 상태 UI (즐겨찾기 없음)
  - ✅ `/protected/parking/history/page.tsx` 생성 (기록 및 통계 페이지)
    - ✅ `components/parking/monthly-stats.tsx` 구현 (월별 통계 카드, 목업 데이터)
    - ✅ `components/parking/session-list.tsx` 구현 (세션 목록, 목업 데이터)
    - ✅ 월 선택 필터 UI
    - ✅ 빈 상태 UI (기록 없음)

- [x] **TASK-004: 로딩/에러/빈 상태 UI 및 모바일 최적화** ✅ - 완료
  - ✅ `app/protected/parking/loading.tsx` 추가 (Skeleton UI)
  - ✅ `app/protected/parking/session/[id]/loading.tsx` 추가
  - ✅ `app/protected/parking/error.tsx` 추가 (사용자 친화적 에러 메시지)
  - ✅ `app/protected/parking/session/[id]/error.tsx` 추가
  - ✅ 375px (iPhone SE) 기준 전체 페이지 레이아웃 점검
  - ✅ 터치 타겟 최소 44px 확인, 요금 숫자 최소 2xl 이상
  - ✅ 한 손 조작 고려 (주요 버튼 하단 배치)
  - ✅ 다크모드 호환 확인 (기존 ThemeSwitcher 연동)

- [x] **TASK-005: 네비게이션 연결 및 전체 플로우 검증** ✅ - 완료
  - ✅ `app/protected/layout.tsx` → AppShell + 하단 탭 네비게이션으로 교체
  - ✅ `components/layout/bottom-nav.tsx` 구현 (홈/주차/기록/프로필 4탭, active 상태)
  - ✅ `components/layout/app-shell.tsx` 구현 (max-w-[430px] 모바일 퍼스트 프레임)
  - ✅ `components/parking/favorite-selector.tsx` UI 구현 (Client Component, 목업 데이터)
    - ✅ 즐겨찾기 목록을 카드/리스트 형태로 표시
    - ✅ 선택 시 세션 시작 폼에 요금 체계 자동 입력
  - ✅ 세션 시작 페이지에 FavoriteSelector 통합 ("즐겨찾기에서 선택" / "직접 입력" 탭)
  - ✅ 전체 네비게이션 플로우 점검 (허브 - 세션 시작 - 계산기 - 결과 - 기록 - 즐겨찾기)
  - ✅ Playwright MCP로 모바일 뷰포트 UI 테스트 수행 (375px)

---

### Phase 2: 요금 계산 로직 (순수 함수 + 타입 정의) ✅

DB 없이 순수 함수와 타입만 구현하여 UI에 실제 계산 로직을 연결하는 단계.
Phase 1에서 하드코딩된 요금 계산을 실제 로직으로 교체한다.

**완료 기준**: `calculateFee` 함수 단위 테스트 통과, UI에서 실시간 요금 계산이 정확하게 동작

- [x] **TASK-006: 타입 정의 및 요금 계산 유틸리티 함수 작성** ✅ - 완료
  - ✅ `lib/types/parking.types.ts` 작성: FeeStructure, FeeResult, TimingOption, ParkingSessionData 인터페이스 정의
  - ✅ CreateParkingSessionDto, ParkingResult<T> 제네릭 응답 타입 정의
  - ✅ `lib/utils/parking-fee.ts` 작성: `calculateFee()` 순수 함수 구현 (기본요금 구간, 추가요금 구간, 일 최대요금 처리)
  - ✅ `calculateTimingOptions()` 함수 구현 (타이밍 비교용, 지금/+5분/+10분/+30분)
  - ✅ `estimateTimeToBudget()` 함수 구현 (예산 소진 시간 추정)
  - ✅ Vitest로 단위 테스트 30개 작성 및 통과 (경계값, 기본구간, 추가구간, 일최대요금, 포맷 함수)

- [x] **TASK-007: UI에 실제 계산 로직 연결** ✅ - 완료
  - ✅ FeeCounter 컴포넌트에서 `calculateFeeResult()` 결과를 props로 수신하여 표시
  - ✅ TimingCards 컴포넌트에서 `calculateTimingOptions()` 결과를 props로 수신하여 표시
  - ✅ BudgetBar 컴포넌트에서 `estimateTimeToBudget()` 연결 — 예산 소진 예상 시간 표시
  - ✅ FeeStructureForm에서 입력된 요금 체계가 searchParams를 통해 계산기 페이지까지 전달
  - ✅ Playwright MCP로 실제 계산 로직 기반 E2E 테스트 수행 (TASK-005에서 완료)

---

### Phase 3: 데이터베이스 연동 (핵심 기능) ✅

Supabase DB를 구축하고 핵심 세션 기능을 실제 데이터로 연동하는 단계.
목업 데이터를 실제 API 호출로 교체한다.

**완료 기준**: 세션 시작 - 실시간 요금 확인 - 출차 완료까지 전체 플로우가 실제 DB와 연동되어 동작

- [x] **TASK-008: 데이터베이스 스키마 및 RLS 정책 설정** ✅ - 완료
  - ✅ Supabase 마이그레이션으로 `parking_lots` 테이블 생성 (UUID PK, user_id FK, 요금 체계 컬럼)
  - ✅ Supabase 마이그레이션으로 `parking_sessions` 테이블 생성 (요금 체계 스냅샷 컬럼 포함)
  - ✅ 두 테이블에 RLS 활성화 및 `auth.uid() = user_id` 정책 적용
  - ✅ `parking_sessions(user_id, entered_at DESC)` 인덱스 생성
  - ✅ 마이그레이션 실행 후 Supabase 대시보드에서 테이블 및 RLS 정상 동작 확인

- [x] **TASK-009: Repository 및 Service 레이어 작성** ✅ - 완료
  - ✅ `lib/repositories/parking-lot.repository.ts`: findByUserId, findById, create, update, remove 구현
  - ✅ `lib/repositories/parking-session.repository.ts`: findActiveByUserId, findById, findByUserIdAndMonth, create, updateExitedAt 구현
  - ✅ `lib/services/parking-lot.service.ts`: CRUD 비즈니스 로직 (이름 중복 체크 포함)
  - ✅ `lib/services/parking-session.service.ts`: 세션 시작(진행 중 세션 중복 체크), 세션 종료(최종 요금 계산), 월별 조회 로직
  - ✅ 모든 Service 메서드는 `ParkingResult<T>` 형태로 반환

- [x] **TASK-010: 핵심 세션 기능 DB 연동** ✅ - 완료
  - ✅ `app/protected/parking/actions.ts`: startParkingSession/endParkingSession 서버 액션 구현
  - ✅ `app/protected/parking/session/new/page.tsx`: Server Component로 변경, 진행 중 세션 중복 체크 및 redirect
  - ✅ `components/parking/new-session-tabs.tsx`: 탭 상태 관리 Client Component 분리 (서버 액션 prop 전달)
  - ✅ `components/parking/fee-structure-form.tsx`: formAction prop 추가, 서버 액션 연동
  - ✅ `components/parking/end-session-button.tsx`: 출차 버튼 Client Component (useTransition 기반)
  - ✅ `app/protected/parking/session/[id]/page.tsx`: DB 조회로 교체, 종료 세션 redirect 처리
  - ✅ `app/protected/parking/session/[id]/result/page.tsx`: DB 조회로 교체, 미종료 세션 redirect 처리
  - ✅ `app/protected/parking/page.tsx`: 목업 제거, DB 조회(활성 세션 + 이번 달 최근 3개) 연동

---

### Phase 4: 즐겨찾기 DB 연동 ✅

즐겨찾기 기능을 실제 DB와 연동하여 CRUD 및 세션 시작 폼 연동을 완성하는 단계.

**완료 기준**: 즐겨찾기 저장 후 세션 시작 시 요금 체계 자동 입력 동작 (실제 DB 연동)

- [x] **TASK-011: 즐겨찾기 CRUD DB 연동 및 세션 시작 폼 연동** ✅ - 완료
  - ✅ 즐겨찾기 관리 페이지의 목업 데이터를 서버 액션 + DB 연동으로 교체
  - ✅ 새 즐겨찾기 추가, 수정, 삭제 서버 액션 구현
  - ✅ FavoriteSelector 컴포넌트에서 DB 조회로 교체
  - ✅ 출차 완료 결과 페이지에서 "즐겨찾기 저장" 기능 서버 액션 구현
  - ✅ Playwright MCP로 즐겨찾기 선택 후 세션 시작 플로우 테스트

---

### Phase 5: 기록/통계 DB 연동 및 최종 품질 보증 ✅

기록/통계 기능을 DB와 연동하고, 전체 앱의 품질을 최종 점검하는 단계.

**완료 기준**: 지난 3개월 이상의 기록 조회 및 월별 통계 정상 동작, 주요 디바이스에서 UI 정상 확인

- [x] **TASK-012: 기록 및 통계 DB 연동** ✅ - 완료
  - ✅ 기록 페이지의 목업 데이터를 DB 조회로 교체
  - ✅ 월별 통계 (총 주차 요금 합계, 세션 수) 실제 계산
  - ✅ 월 선택 필터를 실제 DB 쿼리와 연동 (searchParams 기반 URL 상태)
  - ✅ 세션 목록 날짜 내림차순 정렬 확인
  - ✅ 빈 상태 및 데이터 없는 월 처리 확인

- [x] **TASK-013: 최종 통합 테스트 및 품질 보증** ✅ - 완료
  - ✅ Playwright MCP를 사용한 전체 앱 E2E 테스트
    - ✅ 세션 시작 - 실시간 계산 - 출차 완료 - 기록 확인 전체 플로우
    - ✅ 즐겨찾기 저장 및 불러오기 플로우
    - ✅ 월별 통계 정확성 검증
  - ✅ 모바일 뷰포트 테스트 (375px)
  - ✅ 에러 핸들링 및 엣지 케이스 테스트

---

### Phase 6: 성능 최적화 ⏳

Web Vitals 지표를 개선하고 사용자 체감 성능을 높이는 단계.
실시간 타이머가 핵심인 앱 특성상 렌더링 최적화가 중요하다.

**완료 기준**: Lighthouse 성능 점수 90점 이상, LCP 2.5초 이하, CLS 0.1 이하

- [ ] **TASK-014: 렌더링 및 번들 최적화**
  - [ ] `next/dynamic`으로 무거운 클라이언트 컴포넌트 지연 로딩 (FeeCounter, TimingCards 등)
  - [ ] `React.memo`로 TimingCards, BudgetBar 불필요한 리렌더링 방지
  - [ ] `useMemo` / `useCallback`으로 계산 비용이 큰 함수 최적화 (calculateTimingOptions 등)
  - [ ] `next build && next analyze`로 번들 크기 분석 및 불필요한 의존성 제거
  - [ ] `next/image`로 이미지 최적화 (랜딩 페이지 아이콘/이미지)
  - [ ] 폰트 최적화: `next/font`로 웹폰트 로딩 최적화

- [ ] **TASK-015: Web Vitals 측정 및 개선**
  - [ ] `app/layout.tsx`에 `reportWebVitals` 설정 (LCP, FID, CLS, TTFB 수집)
  - [ ] Vercel Analytics 또는 `web-vitals` 라이브러리 연동
  - [ ] Lighthouse CI 기준점 설정 (성능 90, 접근성 90 이상)
  - [ ] Supabase 쿼리 최적화: N+1 쿼리 제거, 불필요한 재조회 방지
  - [ ] 서버 컴포넌트 데이터 패칭 병렬화 (`Promise.all` 활용)
  - [ ] Playwright MCP로 Core Web Vitals 기준 충족 확인

---

### Phase 7: SEO 및 접근성 ⏳

검색 엔진 최적화와 웹 접근성 기준을 충족하는 단계.
모바일 퍼스트 앱으로 소셜 공유 시 프리뷰가 올바르게 표시되어야 한다.

**완료 기준**: Lighthouse SEO / 접근성 점수 각 90점 이상, OG 태그 정상 동작

- [ ] **TASK-016: 메타데이터 및 SEO 설정**
  - [ ] `app/layout.tsx`: `Metadata` 객체로 title, description, keywords 설정
  - [ ] 동적 메타데이터: 페이지별 title 템플릿 (`title: { template: '%s | ParkingMeter' }`)
  - [ ] Open Graph 태그 설정 (og:title, og:description, og:image, og:url)
  - [ ] Twitter Card 메타태그 설정
  - [ ] `app/robots.txt` 생성 (`/protected` 경로 비공개 처리)
  - [ ] `app/sitemap.ts` 생성 (공개 페이지만 포함)
  - [ ] Favicon 및 Apple Touch Icon 설정 (`app/icon.tsx` 또는 정적 파일)
  - [ ] 접근성 점검: aria-label, role, tabIndex, 키보드 네비게이션 확인
  - [ ] 색상 대비 비율 WCAG AA 기준 충족 확인 (특히 BudgetBar 색상)

---

### Phase 8: 배포 및 모니터링 ⏳

Vercel 프로덕션 배포 환경을 구성하고 운영 중 이슈를 감지하는 단계.

**완료 기준**: Vercel 프로덕션 URL에서 전체 기능 정상 동작, 에러 모니터링 대시보드 확인

- [ ] **TASK-017: Vercel 프로덕션 배포 설정**
  - [ ] Vercel 프로젝트 연결 및 GitHub 리포지토리 연동
  - [ ] 환경 변수 설정 (Vercel Dashboard → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
  - [ ] Supabase 프로덕션 설정: Auth Redirect URL에 Vercel 도메인 추가
  - [ ] Preview 브랜치 배포 확인 (PR별 자동 Preview URL)
  - [ ] `vercel.json` 설정: 보안 헤더 (CSP, X-Frame-Options, HSTS) 추가
  - [ ] 프로덕션 배포 후 전체 기능 E2E 검증 (Playwright MCP)

- [ ] **TASK-018: 에러 모니터링 및 운영 설정**
  - [ ] Sentry 연동 (`@sentry/nextjs`): 클라이언트/서버 에러 수집
  - [ ] Sentry Source Maps 업로드 설정 (프로덕션 스택트레이스 해독)
  - [ ] Vercel Analytics 활성화 (페이지뷰, Web Vitals 대시보드)
  - [ ] Supabase 대시보드: DB 사용량 / API 호출 수 / 슬로우 쿼리 모니터링 설정
  - [ ] 에러 알림 설정 (Sentry → Slack 또는 이메일)
  - [ ] README.md 업데이트: 배포 방법, 환경 변수 설명, 아키텍처 다이어그램

---

## 파일 구조

```
app/protected/parking/
  page.tsx                          # 허브 (TASK-003)
  loading.tsx                       # 로딩 상태 (TASK-004)
  error.tsx                         # 에러 상태 (TASK-004)
  session/
    new/
      page.tsx                      # 세션 시작 (TASK-002)
    [id]/
      page.tsx                      # 실시간 계산기 (TASK-001)
      loading.tsx                   # 로딩 상태 (TASK-004)
      error.tsx                     # 에러 상태 (TASK-004)
      result/
        page.tsx                    # 출차 완료 결과 (TASK-002)
  history/
    page.tsx                        # 기록 + 월별 통계 (TASK-003)
  favorites/
    page.tsx                        # 즐겨찾기 관리 (TASK-003)

components/parking/
  fee-counter.tsx                   # 현재 요금 + 카운트다운 (TASK-001)
  timing-cards.tsx                  # 출차 타이밍 비교 카드 (TASK-001)
  budget-bar.tsx                    # 예산 Progress Bar (TASK-001)
  fee-structure-form.tsx            # 요금 체계 입력 폼 (TASK-002)
  favorite-selector.tsx             # 즐겨찾기 선택 UI (TASK-005)
  session-list.tsx                  # 세션 목록 (TASK-003)
  monthly-stats.tsx                 # 월별 통계 카드 (TASK-003)

lib/
  types/parking.types.ts            # 타입 + DTO (TASK-006)
  utils/parking-fee.ts              # 요금 계산 순수 함수 (TASK-006)
  services/
    parking-session.service.ts      # 세션 비즈니스 로직 (TASK-009)
    parking-lot.service.ts          # 즐겨찾기 비즈니스 로직 (TASK-009)
  repositories/
    parking-session.repository.ts   # 세션 DB 접근 (TASK-009)
    parking-lot.repository.ts       # 즐겨찾기 DB 접근 (TASK-009)
```

## 기술적 참고 사항

- **기존 인증 활용**: 로그인/회원가입/세션 관리는 기존 구현 그대로 사용 (`app/auth/`, `lib/supabase/`)
- **레이어드 아키텍처**: Page - Service - Repository 3계층 구조 유지
- **Supabase 클라이언트**: 서버에서는 `lib/supabase/server.ts`, 클라이언트에서는 `lib/supabase/client.ts` 사용
- **상태 관리**: 타이머/실시간 요금은 `useState` + `setInterval`, 서버 데이터는 서버 컴포넌트 fetch
- **폼 처리**: React Hook Form + Zod 조합, 클라이언트 + 서버 이중 검증
- **개발 전략**: Phase 1-2에서 UI와 계산 로직을 먼저 완성하여 사용자 경험을 검증한 뒤, Phase 3-5에서 DB 연동을 진행

---

_최종 업데이트: 2026-03-03_ | **📊 진행 상황**: Phase 0–5 완료 (14/19 Tasks 완료), Phase 6–8 예정
