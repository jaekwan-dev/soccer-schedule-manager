import { NextRequest, NextResponse } from 'next/server';
import { db, matches } from '@/lib/db';
import { eq } from 'drizzle-orm';

// DELETE: 특정 경기 일정 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: '경기 ID가 필요합니다.' }, { status: 400 });
    }

    const [deletedMatch] = await db
      .delete(matches)
      .where(eq(matches.id, id))
      .returning();

    if (!deletedMatch) {
      return NextResponse.json({ error: '경기 일정을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '경기 일정이 삭제되었습니다.' });
  } catch (error) {
    console.error('경기 일정 삭제 오류:', error);
    return NextResponse.json({ error: '경기 일정을 삭제할 수 없습니다.' }, { status: 500 });
  }
} 