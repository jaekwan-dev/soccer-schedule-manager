import { NextRequest, NextResponse } from 'next/server'
import { getMatchById, updateMatch, deleteMatch } from '@/lib/match-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const match = await getMatchById(params.id)
    
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(match)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch match' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const { date, time, venue, voteDeadline, attendanceVotes } = body
    
    if (!date || !time || !venue || !voteDeadline || !attendanceVotes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const updatedMatch = await updateMatch(params.id, {
      date,
      time,
      venue,
      voteDeadline,
      attendanceVotes: {
        attend: attendanceVotes.attend || 0,
        absent: attendanceVotes.absent || 0,
      },
    })
    
    return NextResponse.json(updatedMatch)
  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof Error && error.message === 'Match not found') {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteMatch(params.id)
    return NextResponse.json({ message: 'Match deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof Error && error.message === 'Match not found') {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete match' },
      { status: 500 }
    )
  }
} 