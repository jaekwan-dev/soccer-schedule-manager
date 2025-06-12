import { NextRequest, NextResponse } from 'next/server'
import { db, matches } from '@/lib/db'
import { eq } from 'drizzle-orm'

// 투표 삭제 (관리자용)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('DELETE 요청 시작')
  
  try {
    const { voterName } = await request.json()
    const { id } = await context.params;
    
    console.log('요청 파라미터:', { id, voterName })
    
    if (!voterName) {
      console.log('투표자 이름이 없음')
      return NextResponse.json({ error: '투표자 이름이 필요합니다.' }, { status: 400 })
    }

    if (!id) {
      console.log('경기 ID가 없음')
      return NextResponse.json({ error: '경기 ID가 필요합니다.' }, { status: 400 })
    }

    console.log('데이터베이스에서 경기 조회 시작')
    // 경기 찾기
    const matchResults = await db.select().from(matches).where(eq(matches.id, id))
    
    if (!matchResults || matchResults.length === 0) {
      console.log('경기를 찾을 수 없음:', id)
      return NextResponse.json({ error: '경기를 찾을 수 없습니다.' }, { status: 404 })
    }

    const match = matchResults[0]
    console.log('경기 찾음:', { matchId: match.id, votersCount: match.voters?.length || 0 })

    // voters 배열이 없는 경우 빈 배열로 초기화
    const voters = Array.isArray(match.voters) ? match.voters : []
    
    if (voters.length === 0) {
      console.log('투표자가 없음')
      return NextResponse.json({ error: '투표자가 없습니다.' }, { status: 404 })
    }
    
    // 해당 투표자의 투표 찾기
    const voterIndex = voters.findIndex((voter: { name: string; vote: string; votedAt: string }) => voter.name === voterName)
    
    if (voterIndex === -1) {
      console.log('투표자를 찾을 수 없음:', voterName, '기존 투표자들:', voters.map(v => v.name))
      return NextResponse.json({ error: '해당 투표자를 찾을 수 없습니다.' }, { status: 404 })
    }

    const removedVoter = voters[voterIndex]
    console.log('삭제할 투표자:', removedVoter)
    
    // 투표자 제거
    const updatedVoters = voters.filter((voter: { name: string; vote: string; votedAt: string }) => voter.name !== voterName)
    
    // 투표 수 업데이트 - 안전한 기본값 설정
    const currentAttendanceVotes = match.attendanceVotes || { attend: 0, absent: 0 }
    const updatedAttendanceVotes = { ...currentAttendanceVotes }
    
    if (removedVoter.vote === 'attend') {
      updatedAttendanceVotes.attend = Math.max(0, updatedAttendanceVotes.attend - 1)
    } else if (removedVoter.vote === 'absent') {
      updatedAttendanceVotes.absent = Math.max(0, updatedAttendanceVotes.absent - 1)
    }

    console.log('업데이트할 데이터:', {
      votersCount: updatedVoters.length,
      attendanceVotes: updatedAttendanceVotes,
      removedVote: removedVoter.vote
    })

    console.log('데이터베이스 업데이트 시작')
    // 데이터베이스 업데이트
    const updateResult = await db
      .update(matches)
      .set({
        voters: updatedVoters,
        attendanceVotes: updatedAttendanceVotes,
        updatedAt: new Date(),
      })
      .where(eq(matches.id, id))
      .returning()

    if (!updateResult || updateResult.length === 0) {
      console.log('데이터베이스 업데이트 실패')
      return NextResponse.json({ error: '데이터베이스 업데이트에 실패했습니다.' }, { status: 500 })
    }

    const updatedMatch = updateResult[0]
    console.log('데이터베이스 업데이트 완료:', { matchId: updatedMatch.id, newVotersCount: updatedMatch.voters?.length || 0 })

    const response = NextResponse.json({ 
      message: '투표가 삭제되었습니다.',
      match: updatedMatch,
      deletedVoter: removedVoter
    })
    
    // 응답 헤더 명시적 설정
    response.headers.set('Content-Type', 'application/json')
    
    console.log('응답 반환:', { 
      message: '투표가 삭제되었습니다.',
      matchId: updatedMatch.id,
      deletedVoterName: removedVoter.name
    })
    
    return response
  } catch (error) {
    console.error('투표 삭제 오류 상세:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      name: error instanceof Error ? error.name : 'Unknown'
    })
    return NextResponse.json({ 
      error: '투표 삭제 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
  }
} 
