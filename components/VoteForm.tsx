"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Match, Member } from "@/types"

interface VoteFormProps {
  match: Match;
  members: Member[];
  onVoteSubmit: (matchId: string) => Promise<void>;
  onCancel: () => void;
}

export default function VoteForm({ match, members, onVoteSubmit, onCancel }: VoteFormProps) {
  const [voterName, setVoterName] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [voterType, setVoterType] = useState<'member_attend' | 'guest_attend' | 'absent'>('member_attend')
  const [inviterName, setInviterName] = useState("")

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

  const handleSubmit = async () => {
    if (!voterName.trim()) return
    if (voterType === 'guest_attend' && !inviterName.trim()) {
      alert('게스트의 경우 초대자를 입력해주세요.')
      return
    }

    try {
      const response = await fetch(`/api/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: match.id,
          name: voterName.trim(),
          vote: voterType === 'absent' ? 'absent' : 'attend',
          type: voterType === 'guest_attend' ? 'guest' : 'member',
          inviter: voterType === 'guest_attend' ? inviterName.trim() : undefined,
        }),
      })

      if (response.ok) {
        await onVoteSubmit(match.id)
        setVoterName("")
        setVoterType('member_attend')
        setInviterName("")
      } else {
        const error = await response.json()
        alert(error.error || '투표 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('투표 처리 오류:', error)
      alert('투표 처리 중 오류가 발생했습니다.')
    }
  }

  const maxAttendees = match.maxAttendees || 20
  const isMaxReached = match.attendanceVotes.attend >= maxAttendees

  return (
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
              * 다시 투표하면 투표 변경 가능합니다.
            </p>
          )}
        </div>

        <div className="space-y-3">
          {/* 참가자 유형 선택 */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={voterType === 'member_attend' ? 'default' : 'outline'}
                onClick={() => setVoterType('member_attend')}
                className={`${voterType === 'member_attend' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'}`}
              >
                참석
              </Button>
              <Button
                variant={voterType === 'guest_attend' ? 'default' : 'outline'}
                onClick={() => setVoterType('guest_attend')}
                className={`${voterType === 'guest_attend' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-600 text-purple-600 hover:bg-purple-50'}`}
              >
                게스트 참석
              </Button>
              <Button
                variant={voterType === 'absent' ? 'default' : 'outline'}
                onClick={() => setVoterType('absent')}
                className={`${voterType === 'absent' ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
              >
                불참
              </Button>
            </div>
          </div>

          {/* 이름 입력 */}
          <div className="space-y-2 relative">
            <Input
              placeholder={
                voterType === 'member_attend' ? '팀원명을 입력하세요' :
                voterType === 'guest_attend' ? '게스트명을 입력하세요' :
                '팀원명을 입력하세요'
              }
              value={voterName}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => {
                if (voterName.trim() && filteredMembers.length > 0 && (voterType === 'member_attend' || voterType === 'absent')) {
                  setShowSuggestions(true)
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 150)
              }}
              className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 rounded-lg transition-all duration-200"
            />
            
            {/* 자동완성 제안 목록 (팀원 참석 및 불참인 경우) */}
            {showSuggestions && filteredMembers.length > 0 && (voterType === 'member_attend' || voterType === 'absent') && (
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

          {/* 초대자 입력 (게스트 참석인 경우만) */}
          {voterType === 'guest_attend' && (
            <div className="space-y-2 relative">
              <Input
                placeholder="초대한 팀원명을 입력하세요"
                value={inviterName}
                onChange={(e) => {
                  setInviterName(e.target.value)
                  // 초대자 입력 시 자동완성 필터링
                  if (e.target.value.trim()) {
                    const filtered = members
                      .filter(member => 
                        member.name.toLowerCase().includes(e.target.value.toLowerCase())
                      )
                      .sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'))
                    setFilteredMembers(filtered)
                    setShowSuggestions(filtered.length > 0)
                  } else {
                    setShowSuggestions(false)
                  }
                }}
                onFocus={() => {
                  if (inviterName.trim() && filteredMembers.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 150)
                }}
                className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 rounded-lg transition-all duration-200"
              />
              
              {/* 초대자 자동완성 제안 목록 */}
              {showSuggestions && filteredMembers.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => {
                        setInviterName(member.name)
                        setShowSuggestions(false)
                      }}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <span className="text-sm">{member.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
                        <span key={index} className={`px-1 py-1 text-xs border rounded ${
                          voter.type === 'guest' 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {voter.name}
                          {voter.type === 'guest' && voter.inviter && ` (${voter.inviter} 지인)`}
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
              onClick={handleSubmit}
              disabled={!voterName.trim() || (voterType === 'guest_attend' && !inviterName.trim())}
              className="flex-1"
            >
              투표하기
            </Button>
            <Button 
              variant="outline"
              onClick={onCancel}
              className="px-4"
            >
              취소
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 