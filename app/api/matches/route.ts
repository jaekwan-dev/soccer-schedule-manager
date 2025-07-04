import { NextRequest, NextResponse } from 'next/server';
import { db, matches, NewMatch } from '@/lib/db';
import { eq } from 'drizzle-orm';

// OPTIONS: CORS 처리
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// GET: 모든 경기 일정 조회
export async function GET() {
  try {
    const allMatches = await db.select().from(matches).orderBy(matches.date);
    return NextResponse.json(allMatches);
  } catch (error) {
    console.error('경기 일정 조회 오류:', error);
    return NextResponse.json({ error: '경기 일정을 불러올 수 없습니다.' }, { status: 500 });
  }
}

// POST: 새 경기 일정 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, date, time, venue, voteDeadline, voteDeadlineTime, maxAttendees } = body;

    const newMatch: NewMatch = {
      id,
      date,
      time,
      venue,
      voteDeadline,
      voteDeadlineTime: voteDeadlineTime || '23:59',
      maxAttendees: maxAttendees || 20,
      attendanceVotes: { attend: 0, absent: 0 },
      voters: [],
    };

    const [createdMatch] = await db.insert(matches).values(newMatch).returning();
    return NextResponse.json(createdMatch, { status: 201 });
  } catch (error) {
    console.error('경기 일정 생성 오류:', error);
    return NextResponse.json({ error: '경기 일정을 생성할 수 없습니다.' }, { status: 500 });
  }
}

// PUT: 경기 일정 수정
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, date, time, venue, voteDeadline, voteDeadlineTime, maxAttendees } = body;

    const [updatedMatch] = await db
      .update(matches)
      .set({
        date,
        time,
        venue,
        voteDeadline,
        voteDeadlineTime: voteDeadlineTime || '23:59',
        maxAttendees: maxAttendees || 20,
        updatedAt: new Date(),
      })
      .where(eq(matches.id, id))
      .returning();

    if (!updatedMatch) {
      return NextResponse.json({ error: '경기 일정을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error('경기 일정 수정 오류:', error);
    return NextResponse.json({ error: '경기 일정을 수정할 수 없습니다.' }, { status: 500 });
  }
}

 