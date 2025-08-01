import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Edit, Trash2, Users } from "lucide-react";
import React from "react";

interface Match {
  id: string;
  date: string;
  time: string;
  venue: string;
  voteDeadline: string;
  voteDeadlineTime?: string;
  maxAttendees?: number;
  attendanceVotes: { attend: number; absent: number };
  voters: Array<{
    name: string;
    vote: 'attend' | 'absent';
    votedAt: string;
    type: 'member' | 'guest';
    inviter?: string;
  }>;
}

interface MatchListProps {
  ongoingMatches: Match[];
  closedMatches: Match[];
  activeTab: 'ongoing' | 'closed';
  setActiveTab: (tab: 'ongoing' | 'closed') => void;
  formatDate: (date: string) => {
    fullDate: string;
    isToday: boolean;
    isTomorrow: boolean;
  };
  isVoteDeadlinePassed: (deadline: string, deadlineTime?: string) => boolean;
  handleEdit: (match: Match) => void;
  handleDelete: (id: string) => void;
  handleOpenTeamModal: (match: Match) => void;
  handleDeleteVote: (matchId: string, voterName: string, voteType: 'attend' | 'absent') => void;
}

export default function MatchList({
  ongoingMatches,
  closedMatches,
  activeTab,
  setActiveTab,
  formatDate,
  isVoteDeadlinePassed,
  handleEdit,
  handleDelete,
  handleOpenTeamModal,
  handleDeleteVote,
}: MatchListProps) {
  const matches = activeTab === 'ongoing' ? ongoingMatches : closedMatches;
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />등록된 경기 목록
        </CardTitle>
        {/* 탭 메뉴 */}
        <div className="flex gap-1 mt-4">
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'ongoing'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            투표 진행중 ({ongoingMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'closed'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            투표 마감 ({closedMatches.length})
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>{activeTab === 'ongoing' ? '진행중인 경기가 없습니다.' : '마감된 경기가 없습니다.'}</p>
              <p className="text-sm text-gray-400 mt-1">새 경기를 등록해보세요!</p>
            </div>
          ) : (
            matches.map((match) => {
              const dateInfo = formatDate(match.date);
              const deadlineInfo = formatDate(match.voteDeadline);
              const isPassed = isVoteDeadlinePassed(match.voteDeadline, match.voteDeadlineTime);
              return (
                <div
                  key={match.id}
                  className={`border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow bg-white ${
                    isPassed ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* 경기 날짜와 시간 */}
                      <div className="mb-3">
                        <div className="flex flex-col gap-1">
                          <div className="text-lg font-bold text-gray-900">{dateInfo.fullDate}</div>
                          <div className="text-base font-semibold text-blue-600">{match.time}</div>
                        </div>
                      </div>
                      
                      {/* 투표 상태 */}
                      <div className="mb-3">
                        {isPassed ? (
                          <span className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-full font-medium">
                            투표 마감
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full font-medium">
                            투표 진행중
                          </span>
                        )}
                      </div>
                      
                      {/* 경기장 정보 */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{match.venue}</span>
                        </div>
                      </div>

                      {/* 참석/불참 정보 */}
                      <div className="mb-3">
                        <div className="flex flex-col gap-2">
                          <div className="px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center justify-between">
                            <span className="font-medium text-sm">참석</span>
                            <span className="font-bold">{match.attendanceVotes?.attend || 0}/{match.maxAttendees || 20}</span>
                          </div>
                          <div className="px-3 py-2 bg-red-50 text-red-500 border border-red-200 rounded-lg flex items-center justify-between">
                            <span className="font-medium text-sm">불참</span>
                            <span className="font-bold">{match.attendanceVotes?.absent || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* 투표 마감일시 */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>투표 마감: {deadlineInfo.fullDate} {match.voteDeadlineTime || '23:59'}</span>
                      </div>
                    </div>
                    
                    {/* 액션 버튼들 */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(match)} className="h-8 w-8 p-0 rounded-full">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">수정</span>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleOpenTeamModal(match)} className="h-8 w-8 p-0 rounded-full">
                        <Users className="h-4 w-4" />
                        <span className="sr-only">팀편성</span>
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(match.id)} className="h-8 w-8 p-0 rounded-full">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">삭제</span>
                      </Button>
                    </div>
                  </div>
                  {/* 참석자/불참자 목록 등은 필요시 추가 */}
                  {match.voters && match.voters.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 gap-4">
                        {/* 참석자 */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">참석자</span>
                            <span className="text-xs text-gray-500">
                              {match.voters.filter(v => v.vote === 'attend').length}명
                            </span>
                          </div>
                          <div className="space-y-1">
                            {match.voters
                              .filter(voter => voter.vote === 'attend')
                              .map((voter, index) => (
                                <div key={index} className="flex items-center justify-between bg-green-50 rounded-lg p-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 text-xs border rounded ${
                                      voter.type === 'guest' 
                                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                        : 'bg-green-50 text-green-700 border-green-200'
                                    }`}>
                                      {voter.name}
                                      {voter.type === 'guest' && voter.inviter && ` (${voter.inviter} 지인)`}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteVote(match.id, voter.name, 'attend')}
                                    className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                                  >
                                    삭제
                                  </button>
                                </div>
                              ))}
                            {match.voters.filter(v => v.vote === 'attend').length === 0 && (
                              <span className="text-xs text-gray-400">아직 없음</span>
                            )}
                          </div>
                        </div>
                        
                        {/* 불참자 */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">불참자</span>
                            <span className="text-xs text-gray-500">
                              {match.voters.filter(v => v.vote === 'absent').length}명
                            </span>
                          </div>
                          <div className="space-y-1">
                            {match.voters
                              .filter(voter => voter.vote === 'absent')
                              .map((voter, index) => (
                                <div key={index} className="flex items-center justify-between bg-red-50 rounded-lg p-2">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded">
                                      {voter.name}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteVote(match.id, voter.name, 'absent')}
                                    className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                                  >
                                    삭제
                                  </button>
                                </div>
                              ))}
                            {match.voters.filter(v => v.vote === 'absent').length === 0 && (
                              <span className="text-xs text-gray-400">아직 없음</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
} 