import { NextRequest, NextResponse } from 'next/server';
import { db, matches } from '@/lib/db';
import { eq } from 'drizzle-orm';

// OPTIONS: CORS 처리
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// POST: 경기 참석 투표
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, vote, type, inviter } = body;

    console.log('투표 요청:', { id, name, vote, type, inviter });

    if (!id || !name || !vote || !['attend', 'absent'].includes(vote)) {
      return NextResponse.json({ error: '올바른 투표 정보가 필요합니다.' }, { status: 400 });
    }

    if (!type || !['member', 'guest'].includes(type)) {
      return NextResponse.json({ error: '올바른 참가자 유형이 필요합니다.' }, { status: 400 });
    }

    if (type === 'guest' && !inviter) {
      return NextResponse.json({ error: '게스트의 경우 초대자가 필요합니다.' }, { status: 400 });
    }

    // 현재 경기 정보 조회
    const [currentMatch] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, id));

    if (!currentMatch) {
      return NextResponse.json({ error: '경기를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 투표 마감일시 확인
    const voteDeadlineTime = currentMatch.voteDeadlineTime || '23:59';
    const voteDeadlineDateTime = new Date(`${currentMatch.voteDeadline}T${voteDeadlineTime}:00`);
    const now = new Date();
    
    if (now > voteDeadlineDateTime) {
      return NextResponse.json({ error: '투표 마감시간이 지났습니다.' }, { status: 400 });
    }

    // 최대인원 체크 (참석 투표인 경우만)
    if (vote === 'attend') {
      const existingVoters = currentMatch.voters || [];
      const currentAttendCount = existingVoters.filter(v => v.vote === 'attend' && v.name !== name).length;
      const maxAttendees = currentMatch.maxAttendees || 20;
      
      if (currentAttendCount >= maxAttendees) {
        return NextResponse.json({ error: '최대인원이 되어 투표가 마감되었습니다.' }, { status: 400 });
      }
    }

    // 기존 투표자 목록에서 같은 이름의 투표 제거
    const existingVoters = currentMatch.voters || [];
    const filteredVoters = existingVoters.filter(voter => voter.name !== name);

    // 새 투표 추가
    const newVoter = {
      name,
      vote: vote as 'attend' | 'absent',
      votedAt: new Date().toISOString(),
      type: type as 'member' | 'guest',
      inviter: type === 'guest' ? inviter : undefined,
    };
    const updatedVoters = [...filteredVoters, newVoter];

    // 투표 집계 업데이트
    const attendCount = updatedVoters.filter(v => v.vote === 'attend').length;
    const absentCount = updatedVoters.filter(v => v.vote === 'absent').length;

    // 데이터베이스 업데이트
    const [updatedMatch] = await db
      .update(matches)
      .set({
        voters: updatedVoters,
        attendanceVotes: {
          attend: attendCount,
          absent: absentCount,
        },
        updatedAt: new Date(),
      })
      .where(eq(matches.id, id))
      .returning();

    const response = NextResponse.json(updatedMatch);
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } catch (error) {
    console.error('투표 처리 오류:', error);
    const errorResponse = NextResponse.json({ 
      error: '투표를 처리할 수 없습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    return errorResponse;
  }
}

// DELETE: 투표 삭제 (관리자용)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');
    const voterName = searchParams.get('voterName');
    const voteType = searchParams.get('voteType');

    if (!matchId || !voterName || !voteType) {
      return NextResponse.json({ error: '경기 ID, 투표자 이름, 투표 타입이 필요합니다.' }, { status: 400 });
    }

    console.log('데이터베이스에서 경기 조회 시작')
    // 경기 찾기
    const matchResults = await db.select().from(matches).where(eq(matches.id, matchId))
    
    if (!matchResults || matchResults.length === 0) {
      console.log('경기를 찾을 수 없음:', matchId)
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
      .where(eq(matches.id, matchId))
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
    response.headers.set('Access-Control-Allow-Origin', '*')
    
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
    const errorResponse = NextResponse.json({ 
      error: '투표 삭제 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    return errorResponse
  }
} 