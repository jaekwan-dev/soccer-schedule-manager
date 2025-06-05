# 축구 일정 관리 시스템 요구사항 (간소화 버전)

## 1. 프로젝트 개요
축구팀의 경기 일정과 참석 투표를 관리하는 간단한 웹 애플리케이션

## 2. 핵심 기능 요구사항

### 2.1 메인 화면 (일정 목록)
- [ ] 등록된 축구 일정을 카드 뷰로 표시
- [ ] 각 카드에 표시될 정보:
  - [ ] 경기 날짜 (크게 표시)
  - [ ] 참석 투표 결과 (참석/불참 인원수)
  - [ ] 실제 경기 날짜와 시간
  - [ ] 투표 마감 날짜
  - [ ] 상대팀 정보
  - [ ] 경기 장소

### 2.2 관리자 기능
- [ ] 간단한 비밀번호 인증 (1234)
- [ ] 경기 일정 등록
- [ ] 경기 일정 수정
- [ ] 경기 일정 삭제

## 3. 기술 스택
- **프레임워크**: Next.js 15 (App Router)
- **UI 라이브러리**: shadcn/ui
- **스타일링**: Tailwind CSS
- **상태 관리**: React useState (로컬 상태)
- **데이터 저장**: localStorage (임시)

## 4. 데이터 모델

### 4.1 경기 일정 (Match)
```typescript
interface Match {
  id: string
  date: string // 경기 날짜 (YYYY-MM-DD)
  time: string // 경기 시간 (HH:MM)
  venue: string // 경기 장소
  opponent: string // 상대팀
  voteDeadline: string // 투표 마감일 (YYYY-MM-DD)
  attendanceVotes: {
    attend: number // 참석 투표수
    absent: number // 불참 투표수
  }
}
```

## 5. 페이지 구성
- **메인 페이지** (`/`): 경기 일정 카드 목록
- **관리자 페이지** (`/admin`): 경기 일정 관리 (CRUD)

---

**작성일**: 2025-06-05  
**버전**: 1.0  
**작성자**: 개발팀 