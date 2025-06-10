import { NextRequest, NextResponse } from 'next/server';
import { db, matches } from '@/lib/db';
import { eq } from 'drizzle-orm';

// OPTIONS: CORS 처리
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// POST: 경기 참석 투표
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, vote } = body;

    console.log('투표 요청:', { id, name, vote });

    if (!id || !name || !vote || !['attend', 'absent'].includes(vote)) {
      return NextResponse.json({ error: '올바른 투표 정보가 필요합니다.' }, { status: 400 });
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