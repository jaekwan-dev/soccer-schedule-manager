"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users } from 'lucide-react'
import LoadingScreen from "@/components/LoadingScreen"
import MatchList from "@/components/MatchList"
import { Match, Member, Comment } from "@/types"

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInitialLoading, setShowInitialLoading] = useState(true)
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComment, setNewComment] = useState("")
  const [commentAuthor, setCommentAuthor] = useState("")

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

  const handleCardClick = (match: Match) => {
    if (expandedMatchId === match.id) {
      setExpandedMatchId(null)
    } else {
      setExpandedMatchId(match.id)
      
      // 댓글 로드
      loadComments(match.id)
      
      // 투표창이 열릴 때 해당 카드로 스크롤
      setTimeout(() => {
        const cardElement = document.getElementById(`match-card-${match.id}`)
        if (cardElement) {
          const headerHeight = 60 // 헤더 높이
          const cardTop = cardElement.offsetTop
          const scrollPosition = Math.max(0, cardTop - headerHeight - 20) // 20px 여유 공간
          
          window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          })
        }
      }, 100) // DOM 업데이트 후 스크롤
    }
  }

  const handleVoteSubmit = async (matchId: string) => {
    // 투표 후 경기 데이터 새로고침
    try {
      const response = await fetch('/api/matches')
      if (response.ok) {
        const matchesData = await response.json()
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const upcomingMatches = matchesData.filter((match: Match) => {
          const matchDate = new Date(match.date)
          matchDate.setHours(0, 0, 0, 0)
          return matchDate >= today
        })
        
        setMatches(upcomingMatches)
      }
    } catch (error) {
      console.error('경기 데이터 새로고침 오류:', error)
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

  const handleCommentSubmit = async (matchId: string) => {
    if (!commentAuthor.trim() || !newComment.trim()) return

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          authorName: commentAuthor.trim(),
          content: newComment.trim(),
        }),
      })

      if (response.ok) {
        const createdComment = await response.json()
        setComments(prev => ({
          ...prev,
          [matchId]: [...(prev[matchId] || []), createdComment]
        }))
        setNewComment("")
        setCommentAuthor("")
      } else {
        const error = await response.json()
        alert(error.error || '댓글 작성 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error)
      alert('댓글 작성 중 오류가 발생했습니다.')
    }
  }

  // 초기 로딩 화면
  if (showInitialLoading) {
    return <LoadingScreen />
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
            <Link href="/members">
              <Button variant="outline" size="sm" className="px-2 py-1">
                <Users className="h-4 w-4 mr-1" />
                팀원
              </Button>
            </Link>
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
            <MatchList
              matches={matches}
              expandedMatchId={expandedMatchId}
              onCardClick={handleCardClick}
              onVoteSubmit={handleVoteSubmit}
              onCommentSubmit={handleCommentSubmit}
              members={members}
              comments={comments}
              newComment={newComment}
              setNewComment={setNewComment}
              commentAuthor={commentAuthor}
              setCommentAuthor={setCommentAuthor}
            />
          )}
        </div>
      </div>
    </div>
  )
}
