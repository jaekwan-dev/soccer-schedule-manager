"use client"

import { useState, useEffect } from "react"

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
  }>;
}

interface Member {
  id: string;
  name: string;
  level: number;
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInitialLoading, setShowInitialLoading] = useState(true)
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null)
  const [voterName, setVoterName] = useState("")
  const [selectedVote, setSelectedVote] = useState<'attend' | 'absent' | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])

  useEffect(() => {
    // 초기 로딩 화면을 2초간 표시
    const initialLoadingTimer = setTimeout(() => {
      setShowInitialLoading(false)
    }, 2000)

    // 데이터베이스에서 경기 일정과 팀원 로드
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [matchesResponse, membersResponse] = await Promise.all([
          fetch('/api/matches'),
          fetch('/api/members')
        ])
        
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json()
          // 오늘 날짜 이후의 경기만 필터링
          const today = new Date()
          today.setHours(0, 0, 0, 0) // 시간을 00:00:00으로 설정
          
          const upcomingMatches = matchesData.filter((match: Match) => {
            const matchDate = new Date(match.date)
            matchDate.setHours(0, 0, 0, 0) // 시간을 00:00:00으로 설정
            return matchDate >= today // 오늘 이후의 경기만 포함
          })
          
          setMatches(upcomingMatches)
        } else {
          console.error('경기 일정을 불러오는데 실패했습니다.')
        }

        if (membersResponse.ok) {
          const membersData = await membersResponse.json()
          // 한글 이름순으로 정렬 (API에서 이미 정렬되지만 추가 보장)
          const sortedMembersData = membersData.sort((a: Member, b: Member) => a.name.localeCompare(b.name, 'ko-KR'))
          setMembers(sortedMembersData)
        } else {
          console.error('팀원을 불러오는데 실패했습니다.')
        }
      } catch (error) {
        console.error('데이터 로드 오류:', error)
      } finally {
        // 초기 로딩이 끝난 후에만 데이터 로딩 완료
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      }
    }

    fetchData()

    return () => {
      clearTimeout(initialLoadingTimer)
    }
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

  const isVoteDeadlinePassed = (deadline: string, deadlineTime?: string) => {
    const now = new Date()
    const deadlineDateTime = new Date(`${deadline}T${deadlineTime || '23:59'}:00`)
    return now > deadlineDateTime
  }

  const handleCardClick = (match: Match) => {
    if (expandedMatchId === match.id) {
      setExpandedMatchId(null)
      setVoterName("")
      setSelectedVote(null)
      setShowSuggestions(false)
    } else {
      setExpandedMatchId(match.id)
      setVoterName("")
      setSelectedVote(null)
      setShowSuggestions(false)
    }
  }

  const handleNameChange = (value: string) => {
    setVoterName(value)
    if (value.trim()) {
      const filtered = members
        .filter(member => 
          member.name.toLowerCase().includes(value.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'))
      setFilteredMembers(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (memberName: string) => {
    setVoterName(memberName)
    setShowSuggestions(false)
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

  // 초기 로딩 화면
  if (showInitialLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className="animate-pulse">
            <Image 
              src="/red_logo.jpg" 
              alt="뻥랩 로고" 
              width={500} 
              height={500} 
              className="rounded-full"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-5 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">뻥톡</h1>
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
        <div className="space-y-4">
          {isLoading ? (
            // 로딩 상태
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 mb-2">경기 일정을 불러오는 중...</p>
            </div>
          ) : matches.length === 0 ? (
            // 경기가 없을 때
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
          ) : (
            // 경기 목록 표시
            matches.map((match) => {
              const dateInfo = formatDate(match.date)
              const deadlineInfo = formatDate(match.voteDeadline)
              const isPassed = isVoteDeadlinePassed(match.voteDeadline, match.voteDeadlineTime)
              const isExpanded = expandedMatchId === match.id
              const maxAttendees = match.maxAttendees || 20
              const isMaxReached = match.attendanceVotes.attend >= maxAttendees

              return (
                <div key={match.id}>
                  <div
                    className={`border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow bg-white cursor-pointer ${
                      isPassed ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    } ${isExpanded ? 'shadow-md' : 'shadow-sm'}`}
                    onClick={() => handleCardClick(match)}
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
                          <div className="flex items-center gap-2 text-xs">
                            <div className="px-2 py-1 bg-green-100 text-green-700 border border-green-300 rounded-full flex items-center gap-1">
                              <span className="font-medium">참석</span>
                              <span className="font-bold">{match.attendanceVotes.attend}/{match.maxAttendees || 20}</span>
                            </div>
                            <div className="px-2 py-1 bg-red-100 text-red-700 border border-red-300 rounded-full flex items-center gap-1">
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
                    <div className="border rounded-lg p-4 mt-4 bg-blue-50 border-blue-200 shadow-sm">
                                                <div className="space-y-4">
                          <div className="text-center">
                            <h3 className="font-semibold text-gray-900 mb-1">참석 투표</h3>
                            {isMaxReached ? (
                              <p className="text-xs text-orange-600 leading-tight font-medium">
                                * 최대인원이 되어 투표가 마감되었습니다.
                              </p>
                            ) : (
                              <p className="text-xs text-gray-500 leading-tight">
                                * 투표를 변경하려면 다시 이름 쓰고 참석 여부 선택하고 투표하기 누르면 됩니다.
                              </p>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div className="space-y-2 relative">
                              <Label htmlFor="voterName">이름</Label>
                              <Input
                                id="voterName"
                                placeholder="이름을 입력하세요"
                                value={voterName}
                                onChange={(e) => handleNameChange(e.target.value)}
                                onFocus={() => {
                                  if (voterName.trim() && filteredMembers.length > 0) {
                                    setShowSuggestions(true)
                                  }
                                }}
                                onBlur={() => {
                                  // 약간의 지연을 두어 클릭 이벤트가 처리되도록 함
                                  setTimeout(() => setShowSuggestions(false), 150)
                                }}
                                className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 rounded-lg transition-all duration-200"
                              />
                              
                              {/* 자동완성 제안 목록 */}
                              {showSuggestions && filteredMembers.length > 0 && (
                                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                  {filteredMembers.map((member) => (
                                    <div
                                      key={member.id}
                                      onClick={() => handleSuggestionClick(member.name)}
                                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                    >
                                      <span className="text-sm">{member.name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label>참석 여부</Label>
                              <div className="flex gap-2">
                                <Button
                                  variant={selectedVote === 'attend' ? 'default' : 'outline'}
                                  onClick={() => setSelectedVote('attend')}
                                  disabled={isMaxReached}
                                  className={`flex-1 ${selectedVote === 'attend' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'} ${isMaxReached ? 'opacity-50 cursor-not-allowed' : ''}`}
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

                            {/* 참석자/불참자 목록 */}
                            {match.voters && match.voters.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="grid grid-cols-2 gap-4">
                                  {/* 참석자 */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
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
                                          <span key={index} className="px-1 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded">
                                            {voter.name}
                                          </span>
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
                                    <div className="flex flex-wrap gap-1">
                                      {match.voters
                                        .filter(voter => voter.vote === 'absent')
                                        .map((voter, index) => (
                                          <span key={index} className="px-1 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded">
                                            {voter.name}
                                          </span>
                                        ))}
                                      {match.voters.filter(v => v.vote === 'absent').length === 0 && (
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
                      </div>
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
                                  <span key={index} className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded">
                                    {voter.name}
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
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        <div className="flex items-center justify-around py-2">
          <div className="flex flex-col items-center py-1 px-2">
            <div className="w-6 h-6 mb-1 text-blue-600 text-lg">⚽</div>
            <span className="text-xs text-blue-600 font-medium">경기목록</span>
          </div>
          <Link href="/calendar">
            <button className="flex flex-col items-center py-1 px-2">
              <Calendar className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-400">달력</span>
            </button>
          </Link>
          <Link href="/members">
            <button className="flex flex-col items-center py-1 px-2">
              <Users className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-400">팀원</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 하단 네비게이션 공간 확보 */}
      <div className="h-16"></div>
    </div>
  )
}
