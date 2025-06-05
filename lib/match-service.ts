import pool from './db'
import type { Match } from '@/types/match'

export interface DatabaseMatch {
  id: number
  date: string
  time: string
  venue: string
  vote_deadline: string
  attend_votes: number
  absent_votes: number
  created_at: Date
  updated_at: Date
}

// 데이터베이스 결과를 Match 타입으로 변환
function dbMatchToMatch(dbMatch: DatabaseMatch): Match {
  return {
    id: dbMatch.id.toString(),
    date: dbMatch.date,
    time: dbMatch.time,
    venue: dbMatch.venue,
    voteDeadline: dbMatch.vote_deadline,
    attendanceVotes: {
      attend: dbMatch.attend_votes,
      absent: dbMatch.absent_votes,
    },
  }
}

// 모든 경기 조회
export async function getAllMatches(): Promise<Match[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM matches ORDER BY date ASC, time ASC'
    )
    return result.rows.map(dbMatchToMatch)
  } catch (error) {
    console.error('Error fetching matches:', error)
    throw new Error('Failed to fetch matches')
  }
}

// 경기 생성
export async function createMatch(match: Omit<Match, 'id'>): Promise<Match> {
  try {
    const result = await pool.query(
      `INSERT INTO matches (date, time, venue, vote_deadline, attend_votes, absent_votes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        match.date,
        match.time,
        match.venue,
        match.voteDeadline,
        match.attendanceVotes.attend,
        match.attendanceVotes.absent,
      ]
    )
    return dbMatchToMatch(result.rows[0])
  } catch (error) {
    console.error('Error creating match:', error)
    throw new Error('Failed to create match')
  }
}

// 경기 수정
export async function updateMatch(id: string, match: Omit<Match, 'id'>): Promise<Match> {
  try {
    const result = await pool.query(
      `UPDATE matches 
       SET date = $1, time = $2, venue = $3, vote_deadline = $4, attend_votes = $5, absent_votes = $6
       WHERE id = $7
       RETURNING *`,
      [
        match.date,
        match.time,
        match.venue,
        match.voteDeadline,
        match.attendanceVotes.attend,
        match.attendanceVotes.absent,
        parseInt(id),
      ]
    )
    
    if (result.rows.length === 0) {
      throw new Error('Match not found')
    }
    
    return dbMatchToMatch(result.rows[0])
  } catch (error) {
    console.error('Error updating match:', error)
    throw new Error('Failed to update match')
  }
}

// 경기 삭제
export async function deleteMatch(id: string): Promise<void> {
  try {
    const result = await pool.query('DELETE FROM matches WHERE id = $1', [parseInt(id)])
    
    if (result.rowCount === 0) {
      throw new Error('Match not found')
    }
  } catch (error) {
    console.error('Error deleting match:', error)
    throw new Error('Failed to delete match')
  }
}

// 특정 경기 조회
export async function getMatchById(id: string): Promise<Match | null> {
  try {
    const result = await pool.query('SELECT * FROM matches WHERE id = $1', [parseInt(id)])
    
    if (result.rows.length === 0) {
      return null
    }
    
    return dbMatchToMatch(result.rows[0])
  } catch (error) {
    console.error('Error fetching match:', error)
    throw new Error('Failed to fetch match')
  }
} 