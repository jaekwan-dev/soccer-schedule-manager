"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Clock, Users, Calendar } from 'lucide-react'
import Image from 'next/image'

interface Match {
  id: string;
  date: string;
  time: string;
  venue: string;
  voteDeadline: string;
  voteDeadlineTime?: string;
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

export default function CalendarPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

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

  const isVoteDeadlinePassed = (deadline: string, deadlineTime?: string) => {
    const now = new Date()
    const deadlineDateTime = new Date(`${deadline}T${deadlineTime || '23:59'}:00`)
    return now > deadlineDateTime
  }

  // 달력 생성 함수
  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const getDayMatches = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return matches.filter(match => match.date === dateString)
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const calendarDays = generateCalendar()
  const currentMonth = currentDate.getMonth()
  const selectedMatches = selectedDate ? matches.filter(match => match.date === selectedDate) : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-5 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-1">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Image 
              src="/logo.png" 
              alt="뻥랩 로고" 
              width={32} 
              height={32} 
              className="rounded-full"
            />
            <h1 className="text-xl font-bold text-gray-900">경기 일정</h1>
          </div>
        </div>
      </div>

      <div className="px-3 py-4">
        {/* 달력 헤더 */}
        <Card className="border-0 shadow-sm mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
              </h2>
              <Button variant="ghost" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <div key={day} className={`text-center text-sm font-medium py-2 ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
                }`}>
                  {day}
                </div>
              ))}
            </div>

            {/* 달력 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayMatches = getDayMatches(day)
                const isCurrentMonth = day.getMonth() === currentMonth
                const isToday = day.toDateString() === new Date().toDateString()
                const dateString = day.toISOString().split('T')[0]
                const isSelected = selectedDate === dateString

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(isSelected ? null : dateString)}
                    className={`
                      relative p-2 text-sm rounded-lg transition-colors min-h-[60px] flex flex-col items-center justify-start
                      ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                      ${isToday ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                      ${isSelected ? 'bg-blue-200 text-blue-800' : ''}
                      ${dayMatches.length > 0 && isCurrentMonth ? 'bg-green-50 border border-green-200' : ''}
                      hover:bg-gray-100
                    `}
                  >
                    <span className="mb-1">{day.getDate()}</span>
                    {dayMatches.length > 0 && isCurrentMonth && (
                      <div className="flex flex-col gap-1 w-full">
                        {dayMatches.slice(0, 2).map((match, matchIndex) => (
                          <div
                            key={matchIndex}
                            className="w-full h-1 bg-green-500 rounded-full"
                          />
                        ))}
                        {dayMatches.length > 2 && (
                          <span className="text-xs text-green-600 font-medium">
                            +{dayMatches.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 선택된 날짜의 경기 목록 */}
        {selectedDate && selectedMatches.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                {formatDate(selectedDate).fullDate} 경기 일정
              </h3>
              <div className="space-y-3">
                {selectedMatches.map((match) => {
                  const isPassed = isVoteDeadlinePassed(match.voteDeadline, match.voteDeadlineTime)
                  
                  return (
                    <div
                      key={match.id}
                      className="border rounded-lg p-3 bg-white"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{match.time}</span>
                          {isPassed ? (
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                              투표 마감
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                              투표 진행중
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{match.venue}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600 font-medium">참석 {match.attendanceVotes.attend}명</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-red-600 font-medium">불참 {match.attendanceVotes.absent}명</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                        <Clock className="h-3 w-3" />
                        <span>투표 마감: {formatDate(match.voteDeadline).monthDay} {match.voteDeadlineTime || '23:59'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedDate && selectedMatches.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-gray-500">
                {formatDate(selectedDate).fullDate}에는 경기 일정이 없습니다.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        <div className="flex items-center justify-around py-2">
          <Link href="/">
            <button className="flex flex-col items-center py-1 px-2">
              <div className="w-6 h-6 mb-1 text-gray-400 text-lg">⚽</div>
              <span className="text-xs text-gray-400">경기목록</span>
            </button>
          </Link>
          <div className="flex flex-col items-center py-1 px-2">
            <Calendar className="w-6 h-6 text-blue-600 mb-1" />
            <span className="text-xs text-blue-600 font-medium">달력</span>
          </div>
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