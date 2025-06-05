export interface Match {
  id: string
  date: string // 경기 날짜 (YYYY-MM-DD)
  time: string // 경기 시간 (HH:MM)
  venue: string // 경기 장소
  voteDeadline: string // 투표 마감일 (YYYY-MM-DD)
  attendanceVotes: {
    attend: number // 참석 투표수
    absent: number // 불참 투표수
  }
  voters: Voter[] // 투표자 목록
}

export interface Voter {
  name: string
  vote: 'attend' | 'absent'
  votedAt: string // 투표 시간
}

export interface UserVote {
  matchId: string
  vote: 'attend' | 'absent' | null // null은 아직 투표하지 않음
  userName?: string // 선택적으로 사용자 이름 저장
}
