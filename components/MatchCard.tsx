"use client"

import { MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import VoteForm from "./VoteForm"
import CommentSection from "./CommentSection"
import { Match, Member, Comment } from "@/types"

interface MatchCardProps {
  match: Match;
  isNextSchedule: boolean;
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

export default function MatchCard({
  match,
  isNextSchedule,
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
}: MatchCardProps) {
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

  const isVoteDeadlinePassed = (deadline: string, deadlineTime?: string) => {
    const now = new Date()
    const deadlineDateTime = new Date(`${deadline}T${deadlineTime || '23:59'}:00`)
    return now > deadlineDateTime
  }

  const dateInfo = formatDate(match.date)
  const deadlineInfo = formatDate(match.voteDeadline)
  const isPassed = isVoteDeadlinePassed(match.voteDeadline, match.voteDeadlineTime)
  const isExpanded = expandedMatchId === match.id
  const maxAttendees = match.maxAttendees || 20
  const isMaxReached = match.attendanceVotes.attend >= maxAttendees

  return (
    <div id={`match-card-${match.id}`}>
      <div
        className={`border rounded-lg p-4 space-y-3 hover:shadow-md transition-all duration-200 cursor-pointer ${
          isPassed ? 'border-red-200 bg-red-50' : 
          isNextSchedule ? 'border-2 border-blue-400 bg-white' : 'border-gray-200 bg-white'
        } ${isExpanded ? 'shadow-md' : 'shadow-sm'}`}
        onClick={() => onCardClick(match)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* 경기 날짜 - 가장 중요한 정보 */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-lg font-bold text-gray-900">{dateInfo.fullDate}</div>
                <div className="text-base font-semibold text-blue-600">{match.time}</div>
                {isPassed && (
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                    투표 마감
                  </span>
                )}
                {!isPassed && isMaxReached && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                    인원마감
                  </span>
                )}
              </div>
            </div>

            {/* 경기장 정보와 참석 정보 */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{match.venue}</span>
              </div>

              {/* 참석/불참 정보 - 칩 모양 */}
              <div className="flex flex-col gap-1 text-xs">
                <div className="px-2 py-1 bg-green-100 text-green-700 border border-green-300 rounded-full flex items-center gap-1">
                  <span className="font-medium">참석</span>
                  <span className="font-bold">{match.attendanceVotes.attend}/{match.maxAttendees || 20}</span>
                </div>
                <div className="px-2 py-1 bg-red-50 text-red-500 border border-red-200 rounded-full flex items-center gap-1 opacity-60">
                  <span className="font-medium">불참</span>
                  <span className="font-bold">{match.attendanceVotes.absent}</span>
                </div>
              </div>
            </div>

            {/* 투표 마감일시 */}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>투표 마감: {deadlineInfo.fullDate} {match.voteDeadlineTime || '23:59'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {isExpanded ? 
              <ChevronUp className="h-4 w-4 text-gray-400" /> : 
              <ChevronDown className="h-4 w-4 text-gray-400" />
            }
          </div>
        </div>
      </div>

      {/* 투표 폼 또는 참석자 명단 - 카드 아래 펼쳐짐 */}
      {isExpanded && !isPassed && (
        <VoteForm
          match={match}
          members={members}
          onVoteSubmit={onVoteSubmit}
          onCancel={() => onCardClick(match)}
        />
      )}

      {/* 마감된 경기의 참석자 명단 */}
      {isExpanded && isPassed && (
        <div className="border rounded-lg p-4 mt-4 bg-gray-50 border-gray-200 shadow-sm">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-1">참석자 명단</h3>
              <p className="text-xs text-gray-500 leading-tight">
                투표가 마감된 경기입니다.
              </p>
            </div>

            {/* 참석자 목록만 표시 */}
            {match.voters && match.voters.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">참석자</span>
                  <span className="text-xs text-gray-500">
                    {match.voters.filter(v => v.vote === 'attend').length}명
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {match.voters
                    .filter(voter => voter.vote === 'attend')
                    .map((voter, index) => (
                      <span key={index} className={`px-2 py-1 text-xs border rounded ${
                        voter.type === 'guest' 
                          ? 'bg-purple-50 text-purple-700 border-purple-200' 
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {voter.name}
                        {voter.type === 'guest' && voter.inviter && ` (${voter.inviter} 지인)`}
                      </span>
                    ))}
                  {match.voters.filter(v => v.vote === 'attend').length === 0 && (
                    <span className="text-xs text-gray-400">참석자가 없습니다</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <span className="text-sm text-gray-400">아직 투표한 사람이 없습니다</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 댓글 섹션 */}
      {isExpanded && (
        <CommentSection
          comments={comments[match.id] || []}
          newComment={newComment}
          setNewComment={setNewComment}
          commentAuthor={commentAuthor}
          setCommentAuthor={setCommentAuthor}
          onCommentSubmit={() => onCommentSubmit(match.id)}
        />
      )}
    </div>
  )
} 