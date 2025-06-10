"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Users, Edit, Lock, Calendar } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Member {
  id: string;
  name: string;
  level: number;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState("")

  useEffect(() => {
    loadMembers()
  }, [])

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

  const handleEditClick = () => {
    setShowPasswordModal(true)
  }

  const handlePasswordSubmit = () => {
    if (password === "1234") {
      // 관리자 페이지의 팀원 관리 탭으로 이동
      window.location.href = "/admin?tab=members&auth=true"
    } else {
      alert("비밀번호가 틀렸습니다.")
    }
    setPassword("")
    setShowPasswordModal(false)
  }

  const handlePasswordCancel = () => {
    setPassword("")
    setShowPasswordModal(false)
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
            <h1 className="text-xl font-bold text-gray-900">팀원 목록</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleEditClick}>
              <Edit className="h-4 w-4 mr-1" />
              편집
            </Button>
          </div>
        </div>
      </div>

      {/* 팀원 목록 */}
      <div className="px-3 py-4">
        <div className="space-y-3">
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">등록된 팀원이 없습니다.</p>
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="border rounded-lg p-4 bg-white border-gray-200 shadow-sm"
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="text-lg font-medium text-gray-900">{member.name}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
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
          <Link href="/calendar">
            <button className="flex flex-col items-center py-1 px-2">
              <Calendar className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-400">달력</span>
            </button>
          </Link>
          <div className="flex flex-col items-center py-1 px-2">
            <Users className="w-6 h-6 text-blue-600 mb-1" />
            <span className="text-xs text-blue-600 font-medium">팀원</span>
          </div>
        </div>
      </div>

      {/* 비밀번호 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl text-center">관리자 인증</CardTitle>
              <p className="text-center text-sm text-gray-600">팀원을 편집하려면 비밀번호를 입력하세요</p>
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
                  onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
                  placeholder="비밀번호를 입력하세요"
                  className="text-center"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePasswordSubmit} className="flex-1">
                  확인
                </Button>
                <Button variant="outline" onClick={handlePasswordCancel} className="flex-1">
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 