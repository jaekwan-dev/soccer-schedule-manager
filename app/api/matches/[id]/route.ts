import { NextRequest, NextResponse } from 'next/server';
import { db, matches } from '@/lib/db';
import { eq } from 'drizzle-orm';

// DELETE: 특정 경기 일정 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('경기 삭제 요청 시작');
    const { id } = await params;
    console.log('삭제할 경기 ID:', id);

    if (!id) {
      console.log('경기 ID가 없음');
      return NextResponse.json({ error: '경기 ID가 필요합니다.' }, { status: 400 });
    }

    // 먼저 경기가 존재하는지 확인
    console.log('경기 존재 여부 확인 중...');
    const existingMatch = await db.select().from(matches).where(eq(matches.id, id));
    console.log('기존 경기 조회 결과:', existingMatch.length > 0 ? '존재함' : '존재하지 않음');

    if (existingMatch.length === 0) {
      console.log('경기를 찾을 수 없음:', id);
      return NextResponse.json({ error: '경기 일정을 찾을 수 없습니다.' }, { status: 404 });
    }

    console.log('데이터베이스 삭제 실행 중...');
    const [deletedMatch] = await db
      .delete(matches)
      .where(eq(matches.id, id))
      .returning();

    console.log('삭제 결과:', deletedMatch ? '성공' : '실패');

    if (!deletedMatch) {
      console.log('삭제된 경기가 없음');
      return NextResponse.json({ error: '경기 일정을 찾을 수 없습니다.' }, { status: 404 });
    }

    console.log('경기 삭제 완료:', id);
    return NextResponse.json({ message: '경기 일정이 삭제되었습니다.' });
  } catch (error) {
    console.error('경기 일정 삭제 오류 상세:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      name: error instanceof Error ? error.name : 'Unknown'
    });
    return NextResponse.json({ error: '경기 일정을 삭제할 수 없습니다.' }, { status: 500 });
  }
} 