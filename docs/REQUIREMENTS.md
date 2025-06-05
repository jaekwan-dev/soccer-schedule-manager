# 축구 일정 관리 시스템 요구사항

## 프로젝트 개요
축구팀의 경기 일정을 관리하고 팀원들의 참석 여부를 투표로 관리하는 웹 애플리케이션

## 주요 기능

### 1. 메인 페이지 (사용자)
- **경기 일정 목록**: 카드 형태로 경기 일정 표시
- **참석 투표**: 각 경기에 대한 참석/불참 투표 기능
- **투표 현황**: 실시간 참석률 및 투표 결과 표시
- **모바일 최적화**: iPhone 12 Pro 화면에 최적화된 UI

#### 경기 카드 정보
- 경기 날짜 (크게 표시)
- 경기 시간
- 경기 장소
- 참석률 (참석/불참 투표 수)
- 투표 마감일
- 투표 참여자 목록 (확장 시)

### 2. 관리자 페이지
- **로그인**: 비밀번호 인증 (1234)
- **경기 등록**: 새로운 경기 일정 추가
- **경기 수정**: 기존 경기 정보 수정
- **경기 삭제**: 경기 일정 삭제
- **경기 목록 관리**: 등록된 모든 경기 목록 표시

## 기술 스택
- **Frontend**: Next.js 15, React, TypeScript
- **UI Library**: shadcn/ui, Tailwind CSS
- **Data Storage**: localStorage (클라이언트 사이드)
- **Icons**: Lucide React

## 데이터 구조

### Match 타입
```typescript
interface Match {
  id: string
  date: string          // YYYY-MM-DD 형식
  time: string          // HH:MM 형식
  venue: string         // 경기장 이름
  voteDeadline: string  // YYYY-MM-DD 형식
  attendanceVotes: {
    attend: number      // 참석 투표 수
    absent: number      // 불참 투표 수
  }
  voters: Array<{
    name: string        // 투표자 이름
    vote: 'attend' | 'absent'
    votedAt: string     // ISO 날짜 문자열
  }>
}
```

## UI/UX 요구사항
- **모바일 우선**: iPhone 12 Pro 화면 기준 최적화
- **직관적 인터페이스**: 간단하고 명확한 사용자 경험
- **실시간 업데이트**: 투표 결과 즉시 반영
- **접근성**: 터치 친화적인 버튼 크기 및 간격

## 보안 요구사항
- 관리자 페이지 비밀번호 보호
- 클라이언트 사이드 데이터 저장 (localStorage)

## 브라우저 지원
- 모던 브라우저 (Chrome, Safari, Firefox, Edge)
- 모바일 브라우저 지원 