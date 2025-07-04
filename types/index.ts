export interface Match {
  id: string;
  date: string;
  time: string;
  venue: string;
  voteDeadline: string;
  voteDeadlineTime?: string;
  maxAttendees?: number;
  attendanceVotes: {
    attend: number;
    absent: number;
  };
  voters: Array<{
    name: string;
    vote: 'attend' | 'absent';
    votedAt: string;
    type: 'member' | 'guest';
    inviter?: string;
  }>;
}

export interface Member {
  id: string;
  name: string;
  level: number;
}

export interface Comment {
  id: string;
  matchId: string;
  authorName: string;
  content: string;
  createdAt: string;
} 