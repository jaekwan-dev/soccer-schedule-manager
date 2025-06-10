"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { MapPin, Users, Clock, Calendar, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'

interface Match {
  id: string;
  date: string;
  time: string;
  venue: string;
  voteDeadline: string;
  attendanceVotes: {
    attend: number;
    absent: number;
  };
  voters: Array<{
    name: string;
    vote: 'attend' | 'absent';
    votedAt: string;
  }>;
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([])
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null)
  const [voterName, setVoterName] = useState("")
  const [selectedVote, setSelectedVote] = useState<'attend' | 'absent' | null>(null)

  useEffect(() => {
    // 데이터베이스에서 경기 일정 로드
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matches')
        if (response.ok) {
          const data = await response.json()
          setMatches(data)
        } else {
          console.error('경기 일정을 불러오는데 실패했습니다.')
        }
      } catch (error) {
        console.error('경기 일정 로드 오류:', error)
      }
    }

    fetchMatches()
  }, [])

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

  const isVoteDeadlinePassed = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    return today > deadlineDate
  }

  const handleCardClick = (match: Match) => {
    if (!isVoteDeadlinePassed(match.voteDeadline)) {
      if (expandedMatchId === match.id) {
        setExpandedMatchId(null)
        setVoterName("")
        setSelectedVote(null)
      } else {
        setExpandedMatchId(match.id)
        setVoterName("")
        setSelectedVote(null)
      }
    }
  }

  const handleVoteSubmit = async (matchId: string) => {
    if (!voterName.trim() || !selectedVote) return

    try {
      const response = await fetch(`/api/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: matchId,
          name: voterName.trim(),
          vote: selectedVote,
        }),
      })

      if (response.ok) {
        const updatedMatch = await response.json()
        // 로컬 상태 업데이트
        setMatches(prevMatches => 
          prevMatches.map(match => 
            match.id === matchId ? updatedMatch : match
          )
        )
        setVoterName("")
        setSelectedVote(null)
      } else {
        const error = await response.json()
        alert(error.error || '투표 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('투표 처리 오류:', error)
      alert('투표 처리 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-5 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="뻥랩 로고" 
              width={32} 
              height={32} 
              className="rounded-full"
            />
            <h1 className="text-xl font-bold text-gray-900">뻥랩</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="px-2 py-1">
                관리자
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 경기 목록 */}
      <div className="px-3 py-2">
        <div className="space-y-1">
          {matches.map((match) => {
            const dateInfo = formatDate(match.date)
            const deadlineInfo = formatDate(match.voteDeadline)
            const isPassed = isVoteDeadlinePassed(match.voteDeadline)
            const isExpanded = expandedMatchId === match.id

            return (
              <div key={match.id}>
                <Card 
                  className={`border-0 shadow-sm ${!isPassed ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${isExpanded ? 'shadow-md' : ''}`}
                  onClick={() => handleCardClick(match)}
                >
                  <CardContent className="px-3">
                    {/* 경기 날짜와 시간 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold text-gray-900">{dateInfo.fullDate}</div>
                        <div className="text-base font-semibold text-blue-600">{match.time}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPassed && (
                          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                            마감
                          </span>
                        )}
                        {!isPassed && (
                          isExpanded ? 
                            <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* 경기장 정보와 참석 정보 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>{match.venue}</span>
                      </div>

                      {/* 참석/불참 정보 - 칩 모양 */}
                      <div className="flex items-center gap-2 text-sm pr-4">
                        <div className="px-2 py-1 bg-green-100 text-green-700 border border-green-300 rounded-full flex items-center gap-1">
                          <span className="font-medium">참석</span>
                          <span className="font-bold">{match.attendanceVotes.attend}</span>
                        </div>
                        <div className="px-2 py-1 bg-red-100 text-red-700 border border-red-300 rounded-full flex items-center gap-1">
                          <span className="font-medium">불참</span>
                          <span className="font-bold">{match.attendanceVotes.absent}</span>
                        </div>
                      </div>
                    </div>

                    {/* 투표 마감일 - 더 작게 */}
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>마감: {deadlineInfo.monthDay}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* 투표 폼 - 카드 아래 펼쳐짐 */}
                {isExpanded && !isPassed && (
                  <Card className="border-0 shadow-sm mt-1 bg-blue-50">
                    <CardContent className="px-4">
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="font-semibold text-gray-900 mb-1">참석 투표</h3>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="voterName">이름</Label>
                            <Input
                              id="voterName"
                              placeholder="이름을 입력하세요"
                              value={voterName}
                              onChange={(e) => setVoterName(e.target.value)}
                              className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 rounded-lg transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>참석 여부</Label>
                            <div className="flex gap-2">
                              <Button
                                variant={selectedVote === 'attend' ? 'default' : 'outline'}
                                onClick={() => setSelectedVote('attend')}
                                className={`flex-1 ${selectedVote === 'attend' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'}`}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                참석
                              </Button>
                              <Button
                                variant={selectedVote === 'absent' ? 'default' : 'outline'}
                                onClick={() => setSelectedVote('absent')}
                                className={`flex-1 ${selectedVote === 'absent' ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                              >
                                <X className="h-4 w-4 mr-1" />
                                불참
                              </Button>
                            </div>
                          </div>

                          {/* 현재 투표 현황 */}
                          {match.voters && match.voters.length > 0 && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-4 max-h-32 overflow-y-auto">
                                {/* 참석자 */}
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-gray-900">참석</span>
                                    <span className="text-xs text-gray-500">
                                      {match.attendanceVotes.attend}명
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {match.voters
                                      .filter(voter => voter.vote === 'attend')
                                      .map((voter, index) => (
                                        <span key={index} className="px-1 py-1 text-xs bg-gray-100 text-gray-700 border border-gray-300 rounded">
                                          {voter.name}
                                        </span>
                                      ))}
                                    {match.attendanceVotes.attend === 0 && (
                                      <span className="text-xs text-gray-400">아직 없음</span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* 불참자 */}
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-gray-900">불참</span>
                                    <span className="text-xs text-gray-500">
                                      {match.attendanceVotes.absent}명
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {match.voters
                                      .filter(voter => voter.vote === 'absent')
                                      .map((voter, index) => (
                                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 border border-gray-300 rounded">
                                          {voter.name}
                                        </span>
                                      ))}
                                    {match.attendanceVotes.absent === 0 && (
                                      <span className="text-xs text-gray-400">아직 없음</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleVoteSubmit(match.id)}
                              disabled={!voterName.trim() || !selectedVote}
                              className="flex-1"
                            >
                              투표하기
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setExpandedMatchId(null)}
                              className="px-4"
                            >
                              취소
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )
          })}
        </div>

        {/* 경기가 없을 때 */}
        {matches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⚽</div>
            <p className="text-gray-500 mb-2">
              등록된 경기 일정이 없습니다.
            </p>
            <Link href="/admin">
              <Button className="mt-4 rounded-full">
                첫 경기 등록하기
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        <div className="flex items-center justify-around py-1">
          <button className="flex flex-col items-center py-1 px-2">
            <div className="w-5 h-5 bg-gray-900 rounded mb-0.5"></div>
            <span className="text-xs text-gray-900 font-medium">홈</span>
          </button>
          <button className="flex flex-col items-center py-1 px-2">
            <Calendar className="w-5 h-5 text-gray-400 mb-0.5" />
            <span className="text-xs text-gray-400">일정</span>
          </button>
          <button className="flex flex-col items-center py-1 px-2">
            <Users className="w-5 h-5 text-gray-400 mb-0.5" />
            <span className="text-xs text-gray-400">팀</span>
          </button>
          <button className="flex flex-col items-center py-1 px-2">
            <Clock className="w-5 h-5 text-gray-400 mb-0.5" />
            <span className="text-xs text-gray-400">투표</span>
          </button>
          <Link href="/admin">
            <button className="flex flex-col items-center py-1 px-2">
              <div className="w-5 h-5 rounded-full border-2 border-gray-400 mb-0.5"></div>
              <span className="text-xs text-gray-400">관리</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 하단 네비게이션 공간 확보 */}
      <div className="h-16"></div>
    </div>
  )
}
