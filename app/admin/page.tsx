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
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  matchId: string;
  authorName: string;
  content: string;
  createdAt: string;
}


import Link from "next/link"
import { ArrowLeft, Calendar, Clock, MapPin, Lock, Edit, Trash2, Users } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [matches, setMatches] = useState<Match[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [activeTab, setActiveTab] = useState<'ongoing' | 'closed'>('ongoing')
  const [mainTab, setMainTab] = useState<'matches' | 'members'>('matches')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [teamCount, setTeamCount] = useState<number>(2)
  const [generatedTeams, setGeneratedTeams] = useState<string>("")
  const [showVenueSuggestions, setShowVenueSuggestions] = useState(false)
  const [venueSuggestions, setVenueSuggestions] = useState<string[]>([])
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    venue: "",
    voteDeadline: "",
    voteDeadlineTime: "23:59",
    maxAttendees: 20 as number | string,
    attendVotes: 0,
    absentVotes: 0,
  })

  const [memberFormData, setMemberFormData] = useState({
    name: "",
    level: 1,
  })

  useEffect(() => {
    // URL 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    const auth = urlParams.get('auth')
    
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
    
    if (tab === 'members') {
      setMainTab('members')
    }
    
    if (isAuthenticated) {
      loadMatches()
      loadMembers()
    }
  }, [isAuthenticated])

  useEffect(() => {
    // URL 파라미터가 변경될 때마다 체크
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    const auth = urlParams.get('auth')
    
    if (auth === 'true' && !isAuthenticated) {
      setIsAuthenticated(true)
    }
    
    if (tab === 'members') {
      setMainTab('members')
    }
  }, [isAuthenticated])

  const loadMatches = async () => {
    try {
      const response = await fetch('/api/matches')
      if (response.ok) {
        const data = await response.json()
        setMatches(data)
        
        // 경기장 자동완성을 위한 데이터 업데이트
        const venues = data.map((match: Match) => match.venue).filter(Boolean)
        const venueCount = venues.reduce((acc: Record<string, number>, venue: string) => {
          acc[venue] = (acc[venue] || 0) + 1
          return acc
        }, {})
        
        // 사용 빈도순으로 정렬하여 상위 5개 추출
        const sortedVenues = Object.entries(venueCount)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([venue]) => venue)
        
        setVenueSuggestions(sortedVenues)
      } else {
        console.error('경기 일정을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('경기 일정 로드 오류:', error)
    }
  }

  const loadMembers = async () => {
    try {
      const response = await fetch('/api/members')
      if (response.ok) {
        const data = await response.json()
        // 한글 이름순으로 정렬 (API에서 이미 정렬되지만 추가 보장)
        const sortedData = data.sort((a: Member, b: Member) => a.name.localeCompare(b.name, 'ko-KR'))
        setMembers(sortedData)
      } else {
        console.error('팀원을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('팀원 로드 오류:', error)
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
      voteDeadlineTime: formData.voteDeadlineTime,
      maxAttendees: typeof formData.maxAttendees === 'string' ? 20 : formData.maxAttendees,
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
        const message = editingMatch ? '경기 일정이 수정되었습니다.' : '경기 일정이 등록되었습니다.'
        setSuccessMessage(message)
        resetForm()
        // 3초 후 메시지 자동 제거
        setTimeout(() => setSuccessMessage(null), 3000)
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
      voteDeadlineTime: match.voteDeadlineTime || "23:59",
      maxAttendees: match.maxAttendees || 20,
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
          setSuccessMessage('경기 일정이 삭제되었습니다.')
          // 3초 후 메시지 자동 제거
          setTimeout(() => setSuccessMessage(null), 3000)
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
      voteDeadlineTime: "23:59",
      maxAttendees: 20 as number | string,
      attendVotes: 0,
      absentVotes: 0,
    })
    setEditingMatch(null)
    setIsEditing(false)
  }

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const memberData = {
      id: editingMember?.id || Date.now().toString(),
      name: memberFormData.name,
      level: memberFormData.level,
    }

    try {
      let response
      if (editingMember) {
        response = await fetch('/api/members', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(memberData),
        })
      } else {
        response = await fetch('/api/members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(memberData),
        })
      }

      if (response.ok) {
        await loadMembers()
        const message = editingMember ? '팀원이 수정되었습니다.' : '팀원이 등록되었습니다.'
        setSuccessMessage(message)
        resetMemberForm()
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        const error = await response.json()
        alert(error.error || '팀원 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('팀원 처리 오류:', error)
      alert('팀원 처리 중 오류가 발생했습니다.')
    }
  }

  const handleMemberEdit = (member: Member) => {
    setEditingMember(member)
    setMemberFormData({
      name: member.name,
      level: member.level,
    })
    
    // 편집 폼으로 스크롤
    setTimeout(() => {
      const memberFormElement = document.querySelector('[data-member-form]')
      if (memberFormElement) {
        memberFormElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    }, 100)
  }

  const handleMemberDelete = async (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`/api/members?id=${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await loadMembers()
          setSuccessMessage('팀원이 삭제되었습니다.')
          setTimeout(() => setSuccessMessage(null), 3000)
        } else {
          const error = await response.json()
          alert(error.error || '팀원 삭제 중 오류가 발생했습니다.')
        }
      } catch (error) {
        console.error('팀원 삭제 오류:', error)
        alert('팀원 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  const resetMemberForm = () => {
    setMemberFormData({
      name: "",
      level: 1,
    })
    setEditingMember(null)
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

  const isVoteDeadlinePassed = (deadline: string, deadlineTime?: string) => {
    const now = new Date()
    const deadlineDateTime = new Date(`${deadline}T${deadlineTime || '23:59'}:00`)
    return now > deadlineDateTime
  }

  // 자동 팀편성 함수
  const generateTeams = (match: Match, numTeams: number) => {
    const attendees = match.voters?.filter(voter => voter.vote === 'attend') || []
    
    if (attendees.length === 0) {
      return "참석자가 없습니다."
    }

    if (numTeams < 2 || numTeams > attendees.length) {
      return "팀 수가 올바르지 않습니다."
    }

    // 팀원들의 레벨 정보를 가져오기
    const attendeesWithLevel = attendees.map(attendee => {
      const member = members.find(m => m.name === attendee.name)
      return {
        name: attendee.name,
        level: member?.level || 3 // 기본 레벨: 아마추어
      }
    })

    // 레벨별로 정렬 (높은 레벨부터)
    attendeesWithLevel.sort((a, b) => b.level - a.level)

    // 팀 초기화
    const teams: Array<{members: Array<{name: string, level: number}>, totalLevel: number}> = []
    for (let i = 0; i < numTeams; i++) {
      teams.push({ members: [], totalLevel: 0 })
    }

    // 레벨이 높은 선수부터 가장 약한 팀에 배정
    attendeesWithLevel.forEach(player => {
      // 현재 가장 약한 팀 찾기
      const weakestTeam = teams.reduce((min, team, index) => 
        team.totalLevel < teams[min].totalLevel ? index : min, 0
      )
      
      teams[weakestTeam].members.push(player)
      teams[weakestTeam].totalLevel += player.level
    })

    // 결과 텍스트 생성
    let result = `🏆 자동 팀편성 결과 (${numTeams}팀)\n`
    result += `📅 경기일: ${formatDate(match.date).fullDate} ${match.time}\n`
    result += `📍 장소: ${match.venue}\n`
    result += `👥 총 참석자: ${attendees.length}명\n\n`

    teams.forEach((team, index) => {
      result += `⚽ ${index + 1}팀 (평균 레벨: ${(team.totalLevel / team.members.length).toFixed(1)})\n`
      team.members.forEach(member => {
        const levelName = member.level === 1 ? '루키' : 
                         member.level === 2 ? '비기너' : 
                         member.level === 3 ? '아마추어' : 
                         member.level === 4 ? '세미프로' : '프로'
        result += `  • ${member.name} (${levelName})\n`
      })
    })

    return result
  }

  const handleTeamGeneration = (match: Match) => {
    setSelectedMatch(match)
    setShowTeamModal(true)
    setTeamCount(2)
    setGeneratedTeams("")
  }

  const handleGenerateTeams = () => {
    if (selectedMatch) {
      const result = generateTeams(selectedMatch, teamCount)
      setGeneratedTeams(result)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedTeams)
    alert("팀편성 결과가 클립보드에 복사되었습니다!")
  }

  const shareToKakao = async () => {
    if (!generatedTeams) return

    try {
      // 1. Web Share API 시도 (모바일 우선)
      if (navigator.share) {
        await navigator.share({
          title: '뻥톡 팀편성 결과',
          text: generatedTeams
        })
        return
      }

      // 2. 모바일에서 카카오톡 URL 스키마 시도
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        const text = encodeURIComponent(generatedTeams)
        const kakaoUrl = `kakaotalk://send?text=${text}`
        
        // 새 창에서 카카오톡 URL 열기
        const popup = window.open(kakaoUrl, '_blank')
        
        // 0.5초 후 팝업이 열리지 않았으면 클립보드 복사로 대체
        setTimeout(() => {
          if (popup && popup.closed) {
            navigator.clipboard.writeText(generatedTeams).then(() => {
              alert("카카오톡 앱을 찾을 수 없어 클립보드에 복사했습니다.\n카카오톡에서 붙여넣기 하세요.")
            })
          }
        }, 500)
        
        return
      }

      // 3. 데스크톱에서는 클립보드 복사
      await navigator.clipboard.writeText(generatedTeams)
      alert("팀편성 결과가 클립보드에 복사되었습니다!\n카카오톡에서 붙여넣기 하세요.")
      
    } catch (error) {
      console.error('공유 실패:', error)
      // 모든 방법이 실패하면 텍스트 선택으로 대체
      const textArea = document.createElement('textarea')
      textArea.value = generatedTeams
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert("팀편성 결과가 클립보드에 복사되었습니다!\n카카오톡에서 붙여넣기 하세요.")
    }
  }

  const handleDeleteVote = async (matchId: string, voterName: string) => {
    if (!confirm(`${voterName}님의 투표를 삭제하시겠습니까?`)) {
      return
    }

    try {
      console.log('투표 삭제 요청 시작:', { matchId, voterName })
      
      const response = await fetch(`/api/vote`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: matchId, voterName }),
      })

      console.log('응답 상태:', response.status, response.statusText)
      console.log('응답 헤더:', response.headers.get('content-type'))

      if (response.ok) {
        try {
          const responseText = await response.text()
          console.log('응답 텍스트:', responseText)
          
          if (responseText) {
            const result = JSON.parse(responseText)
            console.log('삭제 성공:', result)
          } else {
            console.log('빈 응답이지만 성공')
          }
          
          await loadMatches() // 목록 새로고침
          setSuccessMessage('투표가 삭제되었습니다.')
          // 3초 후 메시지 자동 제거
          setTimeout(() => setSuccessMessage(null), 3000)
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError)
          // 파싱 오류가 있어도 성공으로 처리 (서버에서 성공 응답을 보냈으므로)
          await loadMatches()
          setSuccessMessage('투표가 삭제되었습니다.')
          setTimeout(() => setSuccessMessage(null), 3000)
        }
      } else {
        try {
          const responseText = await response.text()
          console.log('에러 응답 텍스트:', responseText)
          
          let error: { error: string; details?: string } = { error: '알 수 없는 오류' }
          if (responseText) {
            try {
              const parsedError = JSON.parse(responseText)
              error = {
                error: parsedError.error || '알 수 없는 오류',
                details: parsedError.details
              }
            } catch {
              error = { error: responseText || '서버 오류' }
            }
          }
          
          console.error('삭제 실패:', error)
          alert(`투표 삭제 실패: ${error.error || '알 수 없는 오류'}${error.details ? ` (${error.details})` : ''}`)
        } catch (textError) {
          console.error('응답 읽기 오류:', textError)
          alert('서버 응답을 읽을 수 없습니다.')
        }
      }
    } catch (error) {
      console.error('투표 삭제 네트워크 오류:', error)
      alert(`네트워크 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
  }

  const loadComments = async (matchId: string) => {
    try {
      const response = await fetch(`/api/comments?matchId=${matchId}`)
      if (response.ok) {
        const matchComments = await response.json()
        setComments(prev => ({
          ...prev,
          [matchId]: matchComments
        }))
      }
    } catch (error) {
      console.error('댓글 로드 오류:', error)
    }
  }

  const handleDeleteComment = async (commentId: string, matchId: string) => {
    if (!confirm('이 댓글을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/comments?id=${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // 로컬 상태에서 댓글 제거
        setComments(prev => ({
          ...prev,
          [matchId]: prev[matchId]?.filter(comment => comment.id !== commentId) || []
        }))
        setSuccessMessage('댓글이 삭제되었습니다.')
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        const error = await response.json()
        alert(error.error || '댓글 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('댓글 삭제 오류:', error)
      alert('댓글 삭제 중 오류가 발생했습니다.')
    }
  }

  const ongoingMatches = matches.filter(match => !isVoteDeadlinePassed(match.voteDeadline, match.voteDeadlineTime))
  const closedMatches = matches.filter(match => isVoteDeadlinePassed(match.voteDeadline, match.voteDeadlineTime))

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
        {/* 성공 메시지 */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}
        
        {/* 메인 탭 네비게이션 */}
        <div className="flex gap-1 mb-4">
          <button
            onClick={() => setMainTab('matches')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              mainTab === 'matches'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            경기 관리
          </button>
          <button
            onClick={() => setMainTab('members')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              mainTab === 'members'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            팀원 관리
          </button>
        </div>
        
        {mainTab === 'matches' && (
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 relative">
                    <Label htmlFor="venue" className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      경기장
                    </Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => {
                        setFormData({ ...formData, venue: e.target.value })
                        setShowVenueSuggestions(e.target.value.length > 0 && venueSuggestions.length > 0)
                      }}
                      onFocus={() => setShowVenueSuggestions(formData.venue.length > 0 && venueSuggestions.length > 0)}
                      onBlur={() => setTimeout(() => setShowVenueSuggestions(false), 150)}
                      placeholder="경기장 이름"
                      required
                      className="text-sm"
                    />
                    {/* 자동완성 드롭다운 */}
                    {showVenueSuggestions && (
                      <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                        {venueSuggestions
                          .filter(venue => venue.toLowerCase().includes(formData.venue.toLowerCase()))
                          .map((venue, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, venue })
                                setShowVenueSuggestions(false)
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                {venue}
                              </div>
                            </button>
                          ))}
                        {venueSuggestions.filter(venue => venue.toLowerCase().includes(formData.venue.toLowerCase())).length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            검색 결과가 없습니다
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="maxAttendees" className="flex items-center gap-1 text-sm">
                      <Users className="h-3 w-3" />
                      최대인원
                    </Label>
                    <Input
                      id="maxAttendees"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.maxAttendees}
                                              onChange={(e) => {
                          const value = e.target.value
                          if (value === '') {
                            setFormData({ ...formData, maxAttendees: '' })
                          } else {
                            const numValue = parseInt(value)
                            if (!isNaN(numValue) && numValue >= 1 && numValue <= 50) {
                              setFormData({ ...formData, maxAttendees: numValue })
                            }
                          }
                        }}
                      placeholder="20"
                      required
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                  <div className="space-y-1">
                    <Label className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      마감 시간
                    </Label>
                    <div className="flex gap-2">
                      <select
                        value={formData.voteDeadlineTime.split(':')[0] || '23'}
                        onChange={(e) => {
                          const hour = e.target.value
                          const minute = formData.voteDeadlineTime.split(':')[1] || '59'
                          setFormData({ ...formData, voteDeadlineTime: `${hour}:${minute}` })
                        }}
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        required
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}시
                          </option>
                        ))}
                      </select>
                      <select
                        value={formData.voteDeadlineTime.split(':')[1] || '59'}
                        onChange={(e) => {
                          const hour = formData.voteDeadlineTime.split(':')[0] || '23'
                          const minute = e.target.value
                          setFormData({ ...formData, voteDeadlineTime: `${hour}:${minute}` })
                        }}
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        required
                      >
                        {['00', '15', '30', '45', '59'].map((minute) => (
                          <option key={minute} value={minute}>
                            {minute}분
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
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
                {(activeTab === 'ongoing' ? ongoingMatches : closedMatches).length === 0 ? (
                  <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>{activeTab === 'ongoing' ? '진행중인 경기가 없습니다.' : '마감된 경기가 없습니다.'}</p>
                    <p className="text-sm text-gray-400 mt-1">새 경기를 등록해보세요!</p>
                  </div>
                ) : (
                  (activeTab === 'ongoing' ? ongoingMatches : closedMatches).map((match) => {
                    const dateInfo = formatDate(match.date)
                    const deadlineInfo = formatDate(match.voteDeadline)
                    const isPassed = isVoteDeadlinePassed(match.voteDeadline, match.voteDeadlineTime)

                    return (
                      <div
                        key={match.id}
                        className={`border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow bg-white ${
                          isPassed ? 'border-red-200 bg-red-50' : 'border-gray-200'
                        }`}
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
                                {!isPassed && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
                                    투표 진행중
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
                            <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                              <Clock className="h-3 w-3" />
                              <span>투표 마감: {deadlineInfo.fullDate} {match.voteDeadlineTime || '23:59'}</span>
                            </div>
                          </div>
                        </div>

                        {/* 참석자/불참자 목록 */}
                        {match.voters && match.voters.length > 0 && (
                          <div className="pt-3 border-t border-gray-100">
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
                                      <div key={index} className="inline-flex items-center px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded transition-colors">
                                        <span className="mr-2">{voter.name}</span>
                                        <button
                                          onClick={() => handleDeleteVote(match.id, voter.name)}
                                          className="flex items-center justify-center w-4 h-4 hover:bg-red-100 rounded-full transition-colors"
                                          title="투표 삭제"
                                        >
                                          <Trash2 className="h-2.5 w-2.5 text-red-500" />
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
                                <div className="flex flex-wrap gap-1">
                                  {match.voters
                                    .filter(voter => voter.vote === 'absent')
                                    .map((voter, index) => (
                                      <div key={index} className="inline-flex items-center px-2 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded transition-colors">
                                        <span className="mr-2">{voter.name}</span>
                                        <button
                                          onClick={() => handleDeleteVote(match.id, voter.name)}
                                          className="flex items-center justify-center w-4 h-4 hover:bg-red-100 rounded-full transition-colors"
                                          title="투표 삭제"
                                        >
                                          <Trash2 className="h-2.5 w-2.5 text-red-500" />
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

                        {/* 댓글 섹션 */}
                        <div className="pt-3 border-t border-gray-100">
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-700">댓글</h4>
                              <button
                                onClick={() => loadComments(match.id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                댓글 불러오기
                              </button>
                            </div>
                            
                            {/* 댓글 목록 */}
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {comments[match.id]?.length > 0 ? (
                                comments[match.id].map((comment) => (
                                  <div key={comment.id} className="bg-gray-50 rounded-lg p-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium text-gray-900">{comment.authorName}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">
                                          {new Date(comment.createdAt).toLocaleString('ko-KR', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                        <button
                                          onClick={() => handleDeleteComment(comment.id, match.id)}
                                          className="flex items-center justify-center w-4 h-4 hover:bg-red-100 rounded-full transition-colors"
                                          title="댓글 삭제"
                                        >
                                          <Trash2 className="h-2.5 w-2.5 text-red-500" />
                                        </button>
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-700">{comment.content}</p>
                                  </div>
                                ))
                              ) : (
                                comments[match.id] !== undefined && (
                                  <p className="text-xs text-gray-400 text-center py-2">
                                    댓글이 없습니다.
                                  </p>
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 관리 버튼들 - 별도 영역 */}
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between gap-2">
                            {/* 자동 팀편성 버튼 */}
                            {match.voters && match.voters.filter(v => v.vote === 'attend').length >= 2 ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTeamGeneration(match)}
                                className="flex-1 text-sm py-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                              >
                                <Users className="h-4 w-4 mr-2" />
                                자동 팀편성
                              </Button>
                            ) : (
                              <div className="flex-1"></div>
                            )}
                            
                            {/* 수정/삭제 버튼 */}
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
        )}

        {mainTab === 'members' && (
          <div className="grid gap-4 lg:grid-cols-2">
            {/* 팀원 등록/수정 폼 */}
            <Card className="border-0 shadow-sm" data-member-form>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {editingMember ? (
                    <>
                      <Edit className="h-4 w-4" />
                      팀원 수정
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4" />
                      새 팀원 등록
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleMemberSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="memberName" className="flex items-center gap-1 text-sm">
                      <Users className="h-3 w-3" />
                      이름
                    </Label>
                    <Input
                      id="memberName"
                      value={memberFormData.name}
                      onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                      placeholder="팀원 이름"
                      required
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="memberLevel" className="flex items-center gap-1 text-sm">
                      레벨
                    </Label>
                    <select
                      id="memberLevel"
                      value={memberFormData.level}
                      onChange={(e) => setMemberFormData({ ...memberFormData, level: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      required
                    >
                      <option value={1}>루키</option>
                      <option value={2}>비기너</option>
                      <option value={3}>아마추어</option>
                      <option value={4}>세미프로</option>
                      <option value={5}>프로</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1 rounded-full text-sm py-2">
                      {editingMember ? "수정하기" : "등록하기"}
                    </Button>
                    {editingMember && (
                      <Button type="button" variant="outline" onClick={resetMemberForm} className="rounded-full text-sm py-2">
                        취소
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* 등록된 팀원 목록 */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  등록된 팀원 목록 ({members.length}명)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.length === 0 ? (
                    <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p>등록된 팀원이 없습니다.</p>
                      <p className="text-sm text-gray-400 mt-1">첫 팀원을 등록해보세요!</p>
                    </div>
                  ) : (
                    (() => {
                      const getLevelName = (level: number) => {
                        switch (level) {
                          case 1: return "루키"
                          case 2: return "비기너"
                          case 3: return "아마추어"
                          case 4: return "세미프로"
                          case 5: return "프로"
                          default: return `레벨 ${level}`
                        }
                      }

                      const getLevelColor = (level: number) => {
                        switch (level) {
                          case 5: return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' }
                          case 4: return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }
                          case 3: return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
                          case 2: return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' }
                          case 1: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
                          default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
                        }
                      }

                      // 레벨별로 그룹화 (프로 > 세미프로 > 아마추어 > 비기너 > 루키 순)
                      const groupedMembers = members.reduce((groups, member) => {
                        const level = member.level
                        if (!groups[level]) {
                          groups[level] = []
                        }
                        groups[level].push(member)
                        return groups
                      }, {} as Record<number, Member[]>)

                      // 레벨 순서대로 정렬 (5 > 4 > 3 > 2 > 1)
                      const sortedLevels = Object.keys(groupedMembers)
                        .map(Number)
                        .sort((a, b) => b - a)

                      return sortedLevels.map(level => {
                        const levelMembers = groupedMembers[level].sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'))
                        const colors = getLevelColor(level)
                        
                        return (
                          <div key={level} className="space-y-2">
                            {/* 레벨 헤더 */}
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.bg} ${colors.border} border`}>
                              <span className={`text-sm font-semibold ${colors.text}`}>
                                {getLevelName(level)}
                              </span>
                              <span className={`text-xs ${colors.text} opacity-70`}>
                                ({levelMembers.length}명)
                              </span>
                            </div>

                            {/* 해당 레벨의 팀원들 */}
                            <div className="space-y-2 ml-4">
                              {levelMembers.map((member) => (
                                <div
                                  key={member.id}
                                  className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-white border-gray-200"
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-bold text-gray-900">{member.name}</div>
                                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
                                        {getLevelName(member.level)}
                                      </span>
                                    </div>

                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleMemberEdit(member)}
                                        className="h-8 w-8 p-0 rounded-full"
                                      >
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">수정</span>
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleMemberDelete(member.id)}
                                        className="h-8 w-8 p-0 rounded-full"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">삭제</span>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })
                    })()
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 자동 팀편성 모달 */}
        {showTeamModal && selectedMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
                  <Users className="h-5 w-5" />
                  자동 팀편성
                </CardTitle>
                <CardDescription className="text-center">
                  {formatDate(selectedMatch.date).fullDate} {selectedMatch.time} - {selectedMatch.venue}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    참석자 {selectedMatch.voters?.filter(v => v.vote === 'attend').length || 0}명을 레벨 가중치에 따라 공평하게 팀을 나눕니다.
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="teamCount">팀 개수</Label>
                    <select
                      id="teamCount"
                      value={teamCount}
                      onChange={(e) => setTeamCount(parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    >
                      {Array.from({ length: Math.min(8, selectedMatch.voters?.filter(v => v.vote === 'attend').length || 2) }, (_, i) => i + 2).map((num) => (
                        <option key={num} value={num}>
                          {num}팀
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleGenerateTeams} className="flex-1">
                      팀편성 생성
                    </Button>
                    <Button variant="outline" onClick={() => setShowTeamModal(false)}>
                      취소
                    </Button>
                  </div>

                  {generatedTeams && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">팀편성 결과</h3>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={copyToClipboard}>
                            복사하기
                          </Button>
                          <Button size="sm" variant="outline" onClick={shareToKakao} className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100">
                            카톡 공유
                          </Button>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800">
                          {generatedTeams}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
