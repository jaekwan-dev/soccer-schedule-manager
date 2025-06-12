import { NextRequest, NextResponse } from 'next/server'
import { db, matches } from '@/lib/db'
import { eq } from 'drizzle-orm'

// 투표 삭제 (관리자용)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { voterName } = await request.json()
    const { id } = await params
    
    if (!voterName) {
      return NextResponse.json({ error: '투표자 이름이 필요합니다.' }, { status: 400 })
    }

    // 경기 찾기
    const [match] = await db.select().from(matches).where(eq(matches.id, id))
    
    if (!match) {
      return NextResponse.json({ error: '경기를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 해당 투표자의 투표 찾기
    const voterIndex = match.voters.findIndex((voter: { name: string; vote: string; votedAt: string }) => voter.name === voterName)
    
    if (voterIndex === -1) {
      return NextResponse.json({ error: '해당 투표자를 찾을 수 없습니다.' }, { status: 404 })
    }

    const removedVoter = match.voters[voterIndex]
    
    // 투표자 제거
    const updatedVoters = match.voters.filter((voter: { name: string; vote: string; votedAt: string }) => voter.name !== voterName)
    
    // 투표 수 업데이트
    const updatedAttendanceVotes = { ...match.attendanceVotes }
    if (removedVoter.vote === 'attend') {
      updatedAttendanceVotes.attend = Math.max(0, updatedAttendanceVotes.attend - 1)
    } else {
      updatedAttendanceVotes.absent = Math.max(0, updatedAttendanceVotes.absent - 1)
    }

    // 데이터베이스 업데이트
    const [updatedMatch] = await db
      .update(matches)
      .set({
        voters: updatedVoters,
        attendanceVotes: updatedAttendanceVotes,
        updatedAt: new Date(),
      })
      .where(eq(matches.id, id))
      .returning()

    return NextResponse.json({ 
      message: '투표가 삭제되었습니다.',
      match: updatedMatch
    })
  } catch (error) {
    console.error('투표 삭제 오류:', error)
    return NextResponse.json({ error: '투표 삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
} 
