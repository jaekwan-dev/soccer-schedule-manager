"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, MapPin, Lock, Edit, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [matches, setMatches] = useState<Match[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    venue: "",
    voteDeadline: "",
    attendVotes: 0,
    absentVotes: 0,
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadMatches()
    }
  }, [isAuthenticated])

  const loadMatches = async () => {
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

  const handleLogin = () => {
    if (password === "1234") {
      setIsAuthenticated(true)
      setPassword("")
    } else {
      alert("비밀번호가 틀렸습니다.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const matchData = {
      id: editingMatch?.id || Date.now().toString(),
      date: formData.date,
      time: formData.time,
      venue: formData.venue,
      voteDeadline: formData.voteDeadline,
    }

    try {
      let response
      if (editingMatch) {
        // 수정
        response = await fetch('/api/matches', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(matchData),
        })
      } else {
        // 새로 생성
        response = await fetch('/api/matches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(matchData),
        })
      }

      if (response.ok) {
        await loadMatches() // 목록 새로고침
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || '경기 일정 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('경기 일정 처리 오류:', error)
      alert('경기 일정 처리 중 오류가 발생했습니다.')
    }
  }

  const handleEdit = (match: Match) => {
    setEditingMatch(match)
    setFormData({
      date: match.date,
      time: match.time,
      venue: match.venue,
      voteDeadline: match.voteDeadline,
      attendVotes: match.attendanceVotes.attend,
      absentVotes: match.attendanceVotes.absent,
    })
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`/api/matches?id=${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await loadMatches() // 목록 새로고침
        } else {
          const error = await response.json()
          alert(error.error || '경기 일정 삭제 중 오류가 발생했습니다.')
        }
      } catch (error) {
        console.error('경기 일정 삭제 오류:', error)
        alert('경기 일정 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      date: "",
      time: "",
      venue: "",
      voteDeadline: "",
      attendVotes: 0,
      absentVotes: 0,
    })
    setEditingMatch(null)
    setIsEditing(false)
  }

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

  // 로그인 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-100 px-5 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">관리자 로그인</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-3 mt-16">
          <Card className="w-full max-w-sm border-0 shadow-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl text-center">관리자 인증</CardTitle>
              <CardDescription className="text-center text-sm">경기 일정을 관리하려면 비밀번호를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  비밀번호
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="비밀번호를 입력하세요"
                  className="text-center"
                />
              </div>
              <Button onClick={handleLogin} className="w-full rounded-full">
                로그인
              </Button>
              <Separator />
              <div className="text-center">
                <Link href="/">
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2 rounded-full">
                    <ArrowLeft className="h-4 w-4" />
                    메인으로 돌아가기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 관리자 메인 화면
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-5 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">관리자</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="destructive" size="sm" className="px-2 py-1">
                로그아웃
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-3 py-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {/* 경기 등록/수정 폼 */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {isEditing ? (
                  <>
                    <Edit className="h-4 w-4" />
                    경기 수정
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />새 경기 등록
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="date" className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      경기 날짜
                    </Label>
                    <Input
                      id="date"
                      className="text-sm"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      경기 시간
                    </Label>
                    <div className="flex gap-2">
                      <select
                        value={formData.time.split(':')[0] || ''}
                        onChange={(e) => {
                          const hour = e.target.value
                          const minute = formData.time.split(':')[1] || '00'
                          setFormData({ ...formData, time: `${hour}:${minute}` })
                        }}
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        required
                      >
                        <option value="">시간</option>
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}시
                          </option>
                        ))}
                      </select>
                      <select
                        value={formData.time.split(':')[1] || ''}
                        onChange={(e) => {
                          const hour = formData.time.split(':')[0] || '00'
                          const minute = e.target.value
                          setFormData({ ...formData, time: `${hour}:${minute}` })
                        }}
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        required
                      >
                        <option value="">분</option>
                        {['00', '15', '30', '45'].map((minute) => (
                          <option key={minute} value={minute}>
                            {minute}분
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="venue" className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    경기장
                  </Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="경기장 이름"
                    required
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="voteDeadline" className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    투표 마감일
                  </Label>
                  <Input
                    id="voteDeadline"
                    type="date"
                    value={formData.voteDeadline}
                    onChange={(e) => setFormData({ ...formData, voteDeadline: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1 rounded-full text-sm py-2">
                    {isEditing ? "수정하기" : "등록하기"}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={resetForm} className="rounded-full text-sm py-2">
                      취소
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 등록된 경기 목록 */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                등록된 경기 목록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {matches.length === 0 ? (
                  <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>등록된 경기가 없습니다.</p>
                    <p className="text-sm text-gray-400 mt-1">새 경기를 등록해보세요!</p>
                  </div>
                ) : (
                  matches.map((match) => {
                    const dateInfo = formatDate(match.date)
                    const deadlineInfo = formatDate(match.voteDeadline)

                    return (
                      <div
                        key={match.id}
                        className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {/* 경기 날짜 - 가장 중요한 정보 */}
                            <div className="mb-3">
                              <div className="text-lg font-bold text-gray-900 mb-1">{dateInfo.fullDate}</div>
                              <div className="text-base font-semibold text-blue-600">{match.time}</div>
                            </div>

                            {/* 경기장 정보 */}
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                              <MapPin className="h-4 w-4" />
                              <span>{match.venue}</span>
                            </div>

                            {/* 참석 정보 */}
                            <div className="flex items-center gap-4 text-sm mb-2">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-green-600 font-medium">참석 {match.attendanceVotes.attend}명</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-red-600 font-medium">불참 {match.attendanceVotes.absent}명</span>
                              </div>
                            </div>

                            {/* 투표 마감일 */}
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>투표 마감: {deadlineInfo.fullDate}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 ml-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(match)}
                                className="h-8 w-8 p-0 rounded-full"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">수정</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(match.id)}
                                className="h-8 w-8 p-0 rounded-full"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">삭제</span>
                              </Button>
                            </div>

                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
