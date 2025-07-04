"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Users, Edit, Lock, ArrowLeft } from 'lucide-react'
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
            <Link href="/">
              <Button variant="outline" size="sm" className="px-2 py-1">
                <ArrowLeft className="h-4 w-4 mr-1" />
                뒤로
              </Button>
            </Link>
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
      <div className="px-3 py-4 pb-8">
        <div className="space-y-3">
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">등록된 팀원이 없습니다.</p>
            </div>
          ) : (
            (() => {
              const getLevelName = (level: number) => {
                switch (level) {
                  case 1: return "루키 1"
                  case 2: return "비기너 1"
                  case 3: return "비기너 2"
                  case 4: return "비기너 3"
                  case 5: return "아마추어 1"
                  case 6: return "아마추어 2"
                  case 7: return "아마추어 3"
                  case 8: return "아마추어 4"
                  case 9: return "아마추어 5"
                  case 10: return "세미프로 1"
                  case 11: return "세미프로 2"
                  case 12: return "세미프로 3"
                  case 13: return "프로 1"
                  default: return `레벨 ${level}`
                }
              }

              const getCategoryName = (level: number) => {
                if (level === 1) return "루키"
                if (level >= 2 && level <= 4) return "비기너"
                if (level >= 5 && level <= 9) return "아마추어"
                if (level >= 10 && level <= 12) return "세미프로"
                if (level === 13) return "프로"
                return "기타"
              }



              const getCategoryIcon = (category: string) => {
                switch (category) {
                  case "루키": return "🥾"
                  case "비기너": return "⚽"
                  case "아마추어": return "🏆"
                  case "세미프로": return "⭐"
                  case "프로": return "🥇"
                  default: return "⚽"
                }
              }

              const getCategoryColor = (category: string) => {
                switch (category) {
                  case "프로": return { bg: 'bg-gradient-to-r from-yellow-100 to-orange-100', text: 'text-orange-800', border: 'border-orange-300' }
                  case "세미프로": return { bg: 'bg-gradient-to-r from-blue-100 to-indigo-100', text: 'text-blue-800', border: 'border-blue-300' }
                  case "아마추어": return { bg: 'bg-gradient-to-r from-green-100 to-emerald-100', text: 'text-green-800', border: 'border-green-300' }
                  case "비기너": return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' }
                  case "루키": return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
                  default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
                }
              }





              const getLevelColor = (level: number) => {
                switch (level) {
                  case 13: return { bg: 'bg-gradient-to-r from-yellow-100 to-orange-100', text: 'text-orange-800', border: 'border-orange-300' }
                  case 12: return { bg: 'bg-gradient-to-r from-purple-100 to-pink-100', text: 'text-purple-800', border: 'border-purple-300' }
                  case 11: return { bg: 'bg-gradient-to-r from-purple-100 to-indigo-100', text: 'text-purple-800', border: 'border-purple-300' }
                  case 10: return { bg: 'bg-gradient-to-r from-blue-100 to-indigo-100', text: 'text-blue-800', border: 'border-blue-300' }
                  case 9: return { bg: 'bg-gradient-to-r from-green-100 to-emerald-100', text: 'text-green-800', border: 'border-green-300' }
                  case 8: return { bg: 'bg-gradient-to-r from-green-100 to-teal-100', text: 'text-green-800', border: 'border-green-300' }
                  case 7: return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
                  case 6: return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' }
                  case 5: return { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' }
                  case 4: return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }
                  case 3: return { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' }
                  case 2: return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' }
                  case 1: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
                  default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
                }
              }

              // 카테고리별로 그룹화 (프로 > 세미프로 > 아마추어 > 비기너 > 루키 순)
              const groupedMembers = members.reduce((groups, member) => {
                const category = getCategoryName(member.level)
                if (!groups[category]) {
                  groups[category] = []
                }
                groups[category].push(member)
                return groups
              }, {} as Record<string, Member[]>)

              // 카테고리 순서대로 정렬 (프로 > 세미프로 > 아마추어 > 비기너 > 루키)
              const categoryOrder = ["프로", "세미프로", "아마추어", "비기너", "루키"]
              const sortedCategories = categoryOrder.filter(category => groupedMembers[category])

              return sortedCategories.map(category => {
                const categoryMembers = groupedMembers[category].sort((a, b) => {
                  // 먼저 레벨로 정렬 (높은 레벨이 위로)
                  if (a.level !== b.level) {
                    return b.level - a.level
                  }
                  // 레벨이 같으면 이름으로 정렬
                  return a.name.localeCompare(b.name, 'ko-KR')
                })
                const colors = getCategoryColor(category)
                
                return (
                  <div key={category} className="space-y-2">
                    {/* 카테고리 헤더 */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.bg} ${colors.border} border`}>
                      <span className="text-lg">{getCategoryIcon(category)}</span>
                      <div className="flex flex-col">
                        <span className={`text-sm font-semibold ${colors.text}`}>
                          {category}
                        </span>
                      </div>
                      <span className={`text-xs ${colors.text} opacity-70 ml-auto`}>
                        ({categoryMembers.length}명)
                      </span>
                    </div>

                    {/* 해당 카테고리의 팀원들 */}
                    <div className="space-y-2 ml-4">
                      {categoryMembers.map((member) => {
                        const levelColors = getLevelColor(member.level)
                        return (
                          <div
                            key={member.id}
                            className="border rounded-lg p-3 bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-bold text-gray-900">{member.name}</div>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${levelColors.bg} ${levelColors.text} ${levelColors.border} border`}>
                                  {getLevelName(member.level)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            })()
          )}
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