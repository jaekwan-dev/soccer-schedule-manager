# ⚽ 뻥랩 축구 일정 관리 시스템

축구팀을 위한 종합적인 일정 관리 및 팀편성 시스템입니다. 경기 일정 등록부터 참석 투표, 자동 팀편성까지 모든 기능을 제공합니다.

## 🌟 주요 기능

### 📅 경기 일정 관리
- **경기 등록**: 날짜, 시간, 장소, 투표 마감일시, 최대인원 설정
- **투표 시스템**: 참석/불참 투표 및 실시간 현황 확인
- **최대인원 제한**: 설정된 인원 도달 시 자동 마감
- **투표 마감**: 지정된 날짜/시간에 자동 마감

### 👥 팀원 관리
- **팀원 등록**: 이름과 실력 레벨(1-5) 관리
- **자동완성**: 투표 시 등록된 팀원 이름 자동완성
- **한글 정렬**: 가나다 순으로 정렬된 팀원 목록

### 🏆 자동 팀편성
- **스마트 알고리즘**: 레벨 가중치를 고려한 공평한 팀 배분
- **유연한 팀 수**: 2팀~8팀까지 자유롭게 설정
- **복사 기능**: 팀편성 결과를 클립보드로 복사하여 쉽게 공유

### 📱 반응형 UI
- **모바일 최적화**: iPhone 12 Pro 기준 최적화
- **직관적 네비게이션**: 경기목록, 달력, 팀원 탭
- **실시간 업데이트**: 투표 현황 실시간 반영

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Deployment**: Vercel

## 📦 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd soccer-schedule-manager
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가:
```env
DATABASE_URL=your_neon_database_url
```

### 4. 데이터베이스 마이그레이션
```bash
npm run db:generate
npm run db:migrate
```

### 5. 개발 서버 실행
```bash
npm run dev
```

## 📱 사용 방법

### 일반 사용자

#### 1. 경기 일정 확인
- 메인 페이지에서 등록된 경기 일정 확인
- 경기 카드 클릭으로 상세 정보 및 투표 폼 표시

#### 2. 참석 투표
- 이름 입력 시 자동완성 기능 활용
- 참석/불참 선택 후 투표
- 투표 변경은 동일한 이름으로 재투표

#### 3. 달력 보기
- 월별 달력에서 경기 일정 확인
- 날짜 클릭으로 해당일 경기 상세 정보 확인

#### 4. 팀원 목록
- 등록된 전체 팀원 목록 확인
- 편집 버튼으로 관리자 페이지 접근 (비밀번호 필요)

### 관리자 (비밀번호: 1234)

#### 1. 경기 관리
- **경기 등록**: 새로운 경기 일정 등록
- **경기 수정**: 기존 경기 정보 수정
- **경기 삭제**: 불필요한 경기 삭제
- **투표 현황**: 실시간 참석자/불참자 명단 확인

#### 2. 팀원 관리
- **팀원 등록**: 새 팀원 추가 (이름, 레벨)
- **팀원 수정**: 기존 팀원 정보 수정
- **팀원 삭제**: 팀원 제거
- **자동 정렬**: 가나다 순 자동 정렬

#### 3. 자동 팀편성
- **조건**: 참석자 2명 이상인 경기에서 사용 가능
- **팀 수 선택**: 2팀~8팀 중 선택
- **알고리즘**: 레벨 가중치 기반 공평한 배분
- **결과 복사**: 팀편성 결과를 클립보드로 복사

## 🎯 팀편성 알고리즘

### 작동 원리
1. **참석자 수집**: 해당 경기의 참석 투표자 명단 수집
2. **레벨 매칭**: 등록된 팀원의 레벨 정보와 매칭 (미등록 시 레벨 3)
3. **레벨순 정렬**: 높은 레벨부터 낮은 레벨 순으로 정렬
4. **균등 배분**: 가장 약한 팀에 높은 레벨 선수 우선 배정
5. **결과 생성**: 각 팀의 구성원과 평균 레벨 표시

### 결과 예시
```
🏆 자동 팀편성 결과 (2팀)
📅 경기일: 12월 25일 (수) 19:00
📍 장소: 서울월드컵경기장
👥 총 참석자: 8명

⚽ 1팀 (평균 레벨: 3.2)
  • 김철수 (레벨 5)
  • 박영희 (레벨 3)
  • 이민수 (레벨 2)
  총 레벨: 10

⚽ 2팀 (평균 레벨: 3.0)
  • 최지훈 (레벨 4)
  • 정수진 (레벨 3)
  • 한동욱 (레벨 2)
  총 레벨: 9

💡 팀편성 기준: 레벨 가중치를 고려하여 각 팀의 전력을 균등하게 배분했습니다.
```

## 📊 데이터베이스 스키마

### matches 테이블
```sql
- id: 경기 고유 ID
- date: 경기 날짜
- time: 경기 시간
- venue: 경기장
- voteDeadline: 투표 마감 날짜
- voteDeadlineTime: 투표 마감 시간 (기본: 23:59)
- maxAttendees: 최대 참석 인원 (기본: 20명)
- voters: 투표자 정보 (JSON)
```

### members 테이블
```sql
- id: 팀원 고유 ID
- name: 팀원 이름
- level: 실력 레벨 (1-5)
- createdAt: 등록일
- updatedAt: 수정일
```

## 🚀 배포

### Vercel 배포
1. Vercel 계정 연결
2. 환경 변수 설정
3. 자동 배포 완료

### 환경 변수
- `DATABASE_URL`: Neon PostgreSQL 연결 URL

## 🔧 개발 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 데이터베이스 스키마 생성
npm run db:generate

# 데이터베이스 마이그레이션
npm run db:migrate

# 데이터베이스 스튜디오 (GUI)
npm run db:studio
```

## 📝 주요 업데이트

### v2.0.0 (최신)
- ✅ 자동 팀편성 기능 추가
- ✅ 팀원 관리 시스템 구현
- ✅ 자동완성 기능 추가
- ✅ 최대인원 제한 기능
- ✅ 한글 정렬 지원
- ✅ 달력 뷰 추가
- ✅ 반응형 UI 개선

### v1.0.0
- ✅ 기본 경기 일정 관리
- ✅ 투표 시스템
- ✅ 관리자 페이지
- ✅ 실시간 현황 확인

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이나 버그 리포트는 Issues 탭을 이용해 주세요.

---

**⚽ 뻥랩과 함께 더 체계적인 축구 활동을 즐겨보세요!**
