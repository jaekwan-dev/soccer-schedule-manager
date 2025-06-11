import { NextRequest, NextResponse } from 'next/server'
import { db, comments } from '@/lib/db'
import { eq } from 'drizzle-orm'

// OPTIONS: CORS 처리
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// GET: 특정 경기의 댓글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')

    if (!matchId) {
      return NextResponse.json({ error: '경기 ID가 필요합니다.' }, { status: 400 })
    }

    const matchComments = await db
      .select()
      .from(comments)
      .where(eq(comments.matchId, matchId))
      .orderBy(comments.createdAt)

    return NextResponse.json(matchComments)
  } catch (error) {
    console.error('댓글 조회 오류:', error)
    return NextResponse.json({ error: '댓글을 불러올 수 없습니다.' }, { status: 500 })
  }
}

// POST: 새 댓글 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matchId, authorName, content } = body

    if (!matchId || !authorName || !content) {
      return NextResponse.json({ error: '모든 필드가 필요합니다.' }, { status: 400 })
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ error: '댓글은 500자 이내로 작성해주세요.' }, { status: 400 })
    }

    const newComment = {
      id: Date.now().toString(),
      matchId: matchId,
      authorName: authorName.trim(),
      content: content.trim(),
    }

    const [createdComment] = await db.insert(comments).values(newComment).returning()
    return NextResponse.json(createdComment, { status: 201 })
  } catch (error) {
    console.error('댓글 생성 오류:', error)
    return NextResponse.json({ error: '댓글을 생성할 수 없습니다.' }, { status: 500 })
  }
}

// DELETE: 댓글 삭제 (관리자용)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('id')

    if (!commentId) {
      return NextResponse.json({ error: '댓글 ID가 필요합니다.' }, { status: 400 })
    }

    const [deletedComment] = await db
      .delete(comments)
      .where(eq(comments.id, commentId))
      .returning()

    if (!deletedComment) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ message: '댓글이 삭제되었습니다.' })
  } catch (error) {
    console.error('댓글 삭제 오류:', error)
    return NextResponse.json({ error: '댓글을 삭제할 수 없습니다.' }, { status: 500 })
  }
} 