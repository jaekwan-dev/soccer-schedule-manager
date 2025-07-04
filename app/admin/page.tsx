"use client"

import type React from "react"
import { useState, useEffect } from "react"

// 분리된 컴포넌트들 import
import AdminHeader from "@/components/admin/AdminHeader"
import AdminTabs from "@/components/admin/AdminTabs"
import LoginForm from "@/components/admin/LoginForm"
import MatchForm from "@/components/admin/MatchForm"
import MatchList from "@/components/admin/MatchList"
import MemberList from "@/components/admin/MemberList"
import MemberForm from "@/components/admin/MemberForm"
import TeamModal from "@/components/admin/TeamModal"
import {
  getLevelName
} from "@/lib/utils";

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
    type: 'member' | 'guest';
    inviter?: string;
  }>;
}

interface Member {
  id: string;
  name: string;
  level: number;
  createdAt: string;
  updatedAt: string;
}

// Kakao 타입 선언 (window.Kakao 오류 방지)
declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      Share: {
        sendDefault: (options: {
          objectType: string;
          content: {
            title: string;
            description: string;
            imageUrl: string;
            link: {
              mobileWebUrl: string;
              webUrl: string;
            };
          };
        }) => void;
      };
      Link: {
        sendDefault: (options: {
          objectType: string;
          text: string;
          link: {
            mobileWebUrl: string;
            webUrl: string;
          };
        }) => void;
      };
    };
  }
}

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
  const [selectedMatch] = useState<Match | null>(null)
  const [teamCount, setTeamCount] = useState<number>(2)
  const [generatedTeams, setGeneratedTeams] = useState<string>("")
  const [showVenueSuggestions, setShowVenueSuggestions] = useState(false)
  const [venueSuggestions, setVenueSuggestions] = useState<string[]>([])

  
  const [formData, setFormData] = useState<{
    date: string;
    time: string;
    venue: string;
    voteDeadline: string;
    voteDeadlineTime: string;
    maxAttendees: number | string;
    attendVotes: number;
    absentVotes: number;
  }>({
    date: "",
    time: "",
    venue: "",
    voteDeadline: "",
    voteDeadlineTime: "23:59",
    maxAttendees: 20,
    attendVotes: 0,
    absentVotes: 0,
  })

  const [memberFormData, setMemberFormData] = useState<{
    name: string;
    level: number;
  }>({
    name: "",
    level: 1,
  })

  useEffect(() => {
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
        
        const venues = data.map((match: Match) => match.venue).filter(Boolean)
        const venueCount = venues.reduce((acc: Record<string, number>, venue: string) => {
          acc[venue] = (acc[venue] || 0) + 1
          return acc
        }, {})
        
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
        response = await fetch('/api/matches', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(matchData),
        })
      } else {
        response = await fetch('/api/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(matchData),
        })
      }

      if (response.ok) {
        setSuccessMessage(editingMatch ? '경기가 수정되었습니다.' : '경기가 등록되었습니다.')
        setTimeout(() => setSuccessMessage(null), 3000)
        resetForm()
        loadMatches()
      } else {
        const error = await response.json()
        alert(error.error || '경기 등록 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('경기 등록 오류:', error)
      alert('경기 등록 중 오류가 발생했습니다.')
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
      attendVotes: 0,
      absentVotes: 0,
    })
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 경기를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccessMessage('경기가 삭제되었습니다.')
        setTimeout(() => setSuccessMessage(null), 3000)
        loadMatches()
      } else {
        const error = await response.json()
        alert(error.error || '경기 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('경기 삭제 오류:', error)
      alert('경기 삭제 중 오류가 발생했습니다.')
    }
  }

  const resetForm = () => {
    setFormData({
      date: "",
      time: "",
      venue: "",
      voteDeadline: "",
      voteDeadlineTime: "23:59",
      maxAttendees: 20,
      attendVotes: 0,
      absentVotes: 0,
    })
    setIsEditing(false)
    setEditingMatch(null)
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberData),
        })
      } else {
        response = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberData),
        })
      }

      if (response.ok) {
        setSuccessMessage(editingMember ? '팀원이 수정되었습니다.' : '팀원이 등록되었습니다.')
        setTimeout(() => setSuccessMessage(null), 3000)
        resetMemberForm()
        loadMembers()
      } else {
        const error = await response.json()
        alert(error.error || '팀원 등록 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('팀원 등록 오류:', error)
      alert('팀원 등록 중 오류가 발생했습니다.')
    }
  }

  const handleMemberEdit = (member: Member) => {
    setEditingMember(member)
    setMemberFormData({
      name: member.name,
      level: member.level,
    })
  }

  const handleMemberDelete = async (id: string) => {
    if (!confirm('정말로 이 팀원을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccessMessage('팀원이 삭제되었습니다.')
        setTimeout(() => setSuccessMessage(null), 3000)
        loadMembers()
      } else {
        const error = await response.json()
        alert(error.error || '팀원 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('팀원 삭제 오류:', error)
      alert('팀원 삭제 중 오류가 발생했습니다.')
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
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const isToday = date.toDateString() === today.toDateString()
    const isTomorrow = date.toDateString() === tomorrow.toDateString()

    const fullDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]

    return {
      fullDate: `${fullDate} (${dayOfWeek})`,
      isToday,
      isTomorrow,
    }
  }

  const isVoteDeadlinePassed = (deadline: string, deadlineTime?: string) => {
    const now = new Date()
    const deadlineDate = new Date(`${deadline}T${deadlineTime || '23:59'}`)
    return now > deadlineDate
  }

  const generateTeams = (match: Match, numTeams: number) => {
    const attendees = match.voters?.filter(v => v.vote === 'attend') || []
    if (attendees.length === 0) return "참석자가 없습니다."

    // 팀원 정보 가져오기
    const attendeeMembers = attendees.map(voter => {
      const member = members.find(m => m.name === voter.name)
      return {
        name: voter.name,
        level: member?.level || 1,
        type: voter.type,
        inviter: voter.inviter
      }
    })

    // 레벨별 가중치 계산
    const levelWeights = {
      15: 10, // 프로1
      14: 9,  // 세미프로3
      13: 8,  // 세미프로2
      12: 7,  // 세미프로1
      11: 6,  // 아마추어5
      10: 5,  // 아마추어4
      9: 4,   // 아마추어3
      8: 3,   // 아마추어2
      7: 2,   // 아마추어1
      6: 1,   // 비기너3
      5: 1,   // 비기너2
      4: 1,   // 비기너1
      3: 0,   // 루키3
      2: 0,   // 루키2
      1: 0,   // 루키1
    }

    // 팀별로 나누기
    const teams: Array<Array<{name: string, level: number, type: string, inviter?: string}>> = Array.from({length: numTeams}, () => [])
    const teamWeights = Array.from({length: numTeams}, () => 0)

    // 높은 레벨부터 팀에 배정
    attendeeMembers
      .sort((a, b) => b.level - a.level)
      .forEach(member => {
        // 가장 가중치가 낮은 팀 찾기
        const minWeight = Math.min(...teamWeights)
        const teamIndex = teamWeights.indexOf(minWeight)
        
        teams[teamIndex].push(member)
        teamWeights[teamIndex] += levelWeights[member.level as keyof typeof levelWeights] || 0
      })

    // 결과 문자열 생성
    let result = `${formatDate(match.date).fullDate} ${match.time} - ${match.venue}\n`
    result += `자동 팀편성 결과 (${attendees.length}명 → ${numTeams}팀)\n\n`

    teams.forEach((team, index) => {
      const teamWeight = teamWeights[index]
      const memberNames = team.map(m => {
        const member = members.find(mm => mm.name === m.name)
        const levelName = getLevelName(member?.level || 1)
        return `${m.name}(${levelName})`
      }).join(', ')
      
      result += `팀${index + 1} (${team.length}명, 가중치: ${teamWeight}): ${memberNames}\n`
    })

    return result
  }



  const handleGenerateTeams = () => {
    if (!selectedMatch) return
    const result = generateTeams(selectedMatch, teamCount)
    setGeneratedTeams(result)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedTeams)
    alert('팀편성 결과가 클립보드에 복사되었습니다.')
  }

  const shareToKakao = async () => {
    try {
      if (window.Kakao) {
        window.Kakao.Link.sendDefault({
          objectType: 'text',
          text: generatedTeams,
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        })
      } else {
        // Kakao SDK가 없는 경우 클립보드 복사
        copyToClipboard()
      }
    } catch (error) {
      console.error('카카오톡 공유 오류:', error)
      copyToClipboard()
    }
  }

  const ongoingMatches = matches.filter(match => !isVoteDeadlinePassed(match.voteDeadline, match.voteDeadlineTime))
  const closedMatches = matches.filter(match => isVoteDeadlinePassed(match.voteDeadline, match.voteDeadlineTime))

  if (!isAuthenticated) {
    return (
      <LoginForm
        password={password}
        setPassword={setPassword}
        onLogin={handleLogin}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onLogout={() => setIsAuthenticated(false)} />

      <div className="px-3 py-4 pb-8">
        {/* 성공 메시지 */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}
        
        <AdminTabs mainTab={mainTab} setMainTab={setMainTab} />
        
        {mainTab === 'matches' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <MatchForm
              formData={formData}
              setFormData={setFormData}
              isEditing={isEditing}
              handleSubmit={handleSubmit}
              resetForm={resetForm}
              venueSuggestions={venueSuggestions}
              showVenueSuggestions={showVenueSuggestions}
              setShowVenueSuggestions={setShowVenueSuggestions}
            />
            <MatchList
              ongoingMatches={ongoingMatches}
              closedMatches={closedMatches}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              formatDate={formatDate}
              isVoteDeadlinePassed={isVoteDeadlinePassed}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          </div>
        )}

        {mainTab === 'members' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <MemberForm
              memberFormData={memberFormData}
              setMemberFormData={setMemberFormData}
              isEditing={!!editingMember}
              handleMemberSubmit={handleMemberSubmit}
              resetMemberForm={resetMemberForm}
            />
            <MemberList
              members={members}
              handleMemberEdit={handleMemberEdit}
              handleMemberDelete={handleMemberDelete}
            />
          </div>
        )}

        <TeamModal
          showTeamModal={showTeamModal}
          selectedMatch={selectedMatch}
          teamCount={teamCount}
          setTeamCount={setTeamCount}
          generatedTeams={generatedTeams}
          handleGenerateTeams={handleGenerateTeams}
          copyToClipboard={copyToClipboard}
          shareToKakao={shareToKakao}
          formatDate={formatDate}
          setShowTeamModal={setShowTeamModal}
        />
      </div>
    </div>
  )
} 