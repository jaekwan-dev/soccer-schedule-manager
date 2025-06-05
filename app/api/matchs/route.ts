import { NextRequest, NextResponse } from 'next/server'
import { getAllMatches, createMatch } from '@/lib/match-service'

// GET /api/matches - 모든 경기 조회
export async function GET() {
  try {
    const matches = await getAllMatches()
    return NextResponse.json(matches)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}

// POST /api/matches - 새 경기 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 필수 필드 검증
    const { date, time, venue, voteDeadline, attendanceVotes } = body
    
    if (!date || !time || !venue || !voteDeadline || !attendanceVotes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const newMatch = await createMatch({
      date,
      time,
      venue,
      voteDeadline,
      attendanceVotes: {
        attend: attendanceVotes.attend || 0,
        absent: attendanceVotes.absent || 0,
      },
    })
    
    return NextResponse.json(newMatch, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    )
  }
} 