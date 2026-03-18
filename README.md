# Cheongju Festival Archive

현장 QR로 접속해 회원가입 없이 참여하는 모바일 우선 축제 기록 웹앱입니다. 현재 구조는 게스트 참여 앱 + 운영자 CMS + 아카이브 모드 + 멀티 권한 관리자 대시보드까지 포함합니다.

최근 반영된 기능:

- 메인 배너 자동 슬라이드
- 작가/책 소개 카드 정리
- 책 찜하기 / 관심작가 저장 / 현장 일정 알림 저장
- 지도 포인트에서 부스 상세 모달 열기
- 관리자에서 부스 등록, 작가 등록, 지도 포인트-부스 연결 설정
- QR 사용 여부와 방문 인증 흐름 표시
- 아카이브 갤러리 프리뷰

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 환경변수

`.env.example`를 참고해 `.env.local`을 만듭니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `ADMIN_PASSWORD`
- `ADMIN_SUPER_CODE`
- `ADMIN_CONTENT_CODE`
- `ADMIN_MODERATOR_CODE`

기본 구현은 메모리 저장소로 동작합니다. Supabase를 연결하면 `site_settings`, `stamp_points`, `public_guestbooks`, `public_moments`, `generated_cards` 등을 실제 DB로 전환할 수 있습니다.

## 관리자 권한

- `super_admin`
  - 접근 코드 발급/폐기
  - 전체 설정 수정
  - 사이트 상태를 `archive`까지 변경
  - 운영 로그 열람
- `content_manager`
  - 실무 운영자 역할
  - 기본 설정/랜딩/프로그램/스탬프/부스/문장/카드 설정 수정
  - 부스 등록, 작가 등록, 지도 포인트와 부스 연결 관리
  - 콘텐츠 moderation
  - 사이트 상태는 `preparing/live/ended`까지만 변경
- `field_moderator`
  - 프로그램 상태 일부 관리
  - 방명록/순간 기록 moderation

관리자 로그인 경로는 `/admin/login`입니다. 로그인 성공 시 서버가 `httpOnly` 쿠키 세션을 발급합니다.

슈퍼관리자는 관리자 대시보드의 `접근 관리` 탭에서 실무 운영자용 접근 코드를 생성할 수 있습니다.

## 주요 라우트

- `/`
- `/tour`
- `/stamp/point-1`
- `/guestbook`
- `/moments`
- `/card`
- `/booths`
- `/about`
- `/admin/login`
- `/admin`

## 스키마

`db/schema` 아래에 운영용 SQL 스키마 초안을 추가했습니다.

- `site_settings.sql`
- `landing_sections.sql`
- `program_items.sql`
- `stamp_points.sql`
- `booth_profiles.sql`
- `quote_items.sql`
- `card_templates.sql`
- `public_guestbooks.sql`
- `public_moments.sql`
- `stamp_logs.sql`
- `generated_cards.sql`
- `admin_access_codes.sql`
- `admin_sessions.sql`
- `admin_audit_logs.sql`

## 검증

- `npm run lint`
- `npm run build`

Windows 환경에서는 Next 16 SWC 경고가 있을 수 있어 `--webpack` 스크립트로 고정했습니다.

## Firebase 배포 준비

프로젝트는 Firebase 프로젝트 `market-a00ea`에 맞춰 `.firebaserc`와 `apphosting.yaml`을 포함하도록 준비했습니다.

- Firebase 프로젝트 설정 상수: `src/lib/firebase-project.ts`
- App Hosting 설정: `apphosting.yaml`
- 기본 프로젝트 지정: `.firebaserc`

배포 자체는 Firebase CLI 로그인과 실제 App Hosting 백엔드 연결이 필요합니다.
