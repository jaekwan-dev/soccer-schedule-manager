"use client"

import MatchCard from "./MatchCard"
import { Match, Member, Comment } from "@/types"

interface MatchListProps {
  matches: Match[];
  expandedMatchId: string | null;
  onCardClick: (match: Match) => void;
  onVoteSubmit: (matchId: string) => Promise<void>;
  onCommentSubmit: (matchId: string) => Promise<void>;
  members: Member[];
  comments: Record<string, Comment[]>;
  newComment: string;
  setNewComment: (comment: string) => void;
  commentAuthor: string;
  setCommentAuthor: (author: string) => void;
}

export default function MatchList({
  matches,
  expandedMatchId,
  onCardClick,
  onVoteSubmit,
  onCommentSubmit,
  members,
  comments,
  newComment,
  setNewComment,
  commentAuthor,
  setCommentAuthor
}: MatchListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"]
    const weekday = weekdays[date.getDay()]

    return {
      day: day,
      weekday: weekday,
      monthDay: `${month}/${day}`,
      fullDate: `${month}월 ${day}일 (${weekday})`,
    }
  }

  // 오늘 이후의 경기만 필터링
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingMatches = matches.filter(match => {
    const matchDate = new Date(match.date);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate >= today;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (upcomingMatches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⚽</div>
        <p className="text-gray-500 mb-2">예정된 경기가 없습니다.</p>
      </div>
    );
  }

  const nextMatchDate = new Date(upcomingMatches[0].date);
  nextMatchDate.setHours(0, 0, 0, 0);
  const nextMatches = upcomingMatches.filter(match => {
    const matchDate = new Date(match.date);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate.getTime() === nextMatchDate.getTime();
  });
  const otherMatches = upcomingMatches.filter(match => {
    const matchDate = new Date(match.date);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate.getTime() !== nextMatchDate.getTime();
  });

  return (
    <div className="space-y-8">
      {/* 다음 일정 */}
      <div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">⚽</span>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-blue-900">다음 일정</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {nextMatches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              isNextSchedule={true}
              expandedMatchId={expandedMatchId}
              onCardClick={onCardClick}
              onVoteSubmit={onVoteSubmit}
              onCommentSubmit={onCommentSubmit}
              members={members}
              comments={comments}
              newComment={newComment}
              setNewComment={setNewComment}
              commentAuthor={commentAuthor}
              setCommentAuthor={setCommentAuthor}
            />
          ))}
        </div>
      </div>
      
      {/* 이후 일정 */}
      {otherMatches.length > 0 && (
        <div>
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">📅</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">이후 일정</h2>
                  <p className="text-sm text-gray-700">
                    {otherMatches.length}개 경기 • 예정된 경기들
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600 font-medium">다음 경기</div>
                <div className="text-sm text-gray-800 font-semibold">
                  {formatDate(otherMatches[0].date).fullDate}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {otherMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                isNextSchedule={false}
                expandedMatchId={expandedMatchId}
                onCardClick={onCardClick}
                onVoteSubmit={onVoteSubmit}
                onCommentSubmit={onCommentSubmit}
                members={members}
                comments={comments}
                newComment={newComment}
                setNewComment={setNewComment}
                commentAuthor={commentAuthor}
                setCommentAuthor={setCommentAuthor}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 