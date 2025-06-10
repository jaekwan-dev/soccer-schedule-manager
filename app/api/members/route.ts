import { NextRequest, NextResponse } from 'next/server';
import { db, members, NewMember } from '@/lib/db';
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

// GET: 모든 팀원 조회
export async function GET() {
  try {
    const allMembers = await db.select().from(members);
    // 한글 이름순으로 정렬
    const sortedMembers = allMembers.sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
    return NextResponse.json(sortedMembers);
  } catch (error) {
    console.error('팀원 조회 오류:', error);
    return NextResponse.json({ error: '팀원을 불러올 수 없습니다.' }, { status: 500 });
  }
}

// POST: 새 팀원 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, level } = body;

    const newMember: NewMember = {
      id,
      name,
      level,
    };

    const [createdMember] = await db.insert(members).values(newMember).returning();
    return NextResponse.json(createdMember, { status: 201 });
  } catch (error) {
    console.error('팀원 생성 오류:', error);
    return NextResponse.json({ error: '팀원을 생성할 수 없습니다.' }, { status: 500 });
  }
}

// PUT: 팀원 수정
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, level } = body;

    const [updatedMember] = await db
      .update(members)
      .set({
        name,
        level,
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning();

    if (!updatedMember) {
      return NextResponse.json({ error: '팀원을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('팀원 수정 오류:', error);
    return NextResponse.json({ error: '팀원을 수정할 수 없습니다.' }, { status: 500 });
  }
}

// DELETE: 팀원 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '팀원 ID가 필요합니다.' }, { status: 400 });
    }

    const [deletedMember] = await db
      .delete(members)
      .where(eq(members.id, id))
      .returning();

    if (!deletedMember) {
      return NextResponse.json({ error: '팀원을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '팀원이 삭제되었습니다.' });
  } catch (error) {
    console.error('팀원 삭제 오류:', error);
    return NextResponse.json({ error: '팀원을 삭제할 수 없습니다.' }, { status: 500 });
  }
} 