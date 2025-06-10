# 축구 일정 관리 시스템

뻥랩 축구팀의 경기 일정을 관리하고 참석 투표를 할 수 있는 웹 애플리케이션입니다.

## 기능

- 📅 경기 일정 조회 (메인 페이지)
- 🗳️ 참석/불참 투표
- 👥 투표 현황 실시간 확인
- 🔐 관리자 페이지 (비밀번호: 1234)
- ➕ 경기 일정 등록/수정/삭제

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM

## 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd soccer-schedule-manager
npm install
```

### 2. Neon Database 설정

1. [Neon Console](https://console.neon.tech)에서 새 프로젝트 생성
2. 데이터베이스 연결 URL 복사
3. 프로젝트 루트에 `.env.local` 파일 생성:

```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### 3. 데이터베이스 스키마 생성

```bash
# 마이그레이션 파일 생성
npm run db:generate

# 데이터베이스에 스키마 적용
npm run db:push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 데이터베이스 관리

```bash
# 스키마 변경사항 생성
npm run db:generate

# 데이터베이스에 변경사항 적용
npm run db:push

# Drizzle Studio로 데이터베이스 관리 (GUI)
npm run db:studio
```

## 환경 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DATABASE_URL` | Neon PostgreSQL 연결 URL | `postgresql://user:pass@host/db?sslmode=require` |

## 프로젝트 구조

```
soccer-schedule-manager/
├── app/
│   ├── api/matches/          # 경기 일정 API
│   ├── admin/               # 관리자 페이지
│   └── page.tsx            # 메인 페이지
├── lib/
│   └── db/                 # 데이터베이스 설정
│       ├── index.ts        # DB 연결
│       └── schema.ts       # 테이블 스키마
├── components/ui/          # UI 컴포넌트
└── drizzle.config.ts      # Drizzle 설정
```

## 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경 변수 `DATABASE_URL` 설정
3. 자동 배포 완료

### 기타 플랫폼

Next.js를 지원하는 모든 플랫폼에서 배포 가능합니다.

## 라이선스

MIT License
