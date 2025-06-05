import { useState, useEffect } from 'react'
import type { Match } from '@/types/match'

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 경기 목록 조회
  const fetchMatches = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/matches')
      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }
      
      const data = await response.json()
      setMatches(data)
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      // API 실패 시 localStorage에서 데이터 로드
      const savedMatches = localStorage.getItem('soccer-matches')
      if (savedMatches) {
        setMatches(JSON.parse(savedMatches))
      }
    } finally {
      setLoading(false)
    }
  }

  // 경기 생성
  const createMatch = async (matchData: Omit<Match, 'id'>) => {
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData),
      })

      if (!response.ok) {
        throw new Error('Failed to create match')
      }

      const newMatch = await response.json()
      setMatches(prev => [...prev, newMatch])
      
      // localStorage에도 저장
      const updatedMatches = [...matches, newMatch]
      localStorage.setItem('soccer-matches', JSON.stringify(updatedMatches))
      
      return newMatch
    } catch (err) {
      console.error('Error creating match:', err)
      
      // API 실패 시 localStorage에만 저장
      const tempId = Date.now().toString()
      const newMatch = { ...matchData, id: tempId }
      const updatedMatches = [...matches, newMatch]
      setMatches(updatedMatches)
      localStorage.setItem('soccer-matches', JSON.stringify(updatedMatches))
      
      throw err
    }
  }

  // 경기 수정
  const updateMatch = async (id: string, matchData: Omit<Match, 'id'>) => {
    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData),
      })

      if (!response.ok) {
        throw new Error('Failed to update match')
      }

      const updatedMatch = await response.json()
      setMatches(prev => prev.map(match => 
        match.id === id ? updatedMatch : match
      ))
      
      // localStorage에도 저장
      const updatedMatches = matches.map(match => 
        match.id === id ? updatedMatch : match
      )
      localStorage.setItem('soccer-matches', JSON.stringify(updatedMatches))
      
      return updatedMatch
    } catch (err) {
      console.error('Error updating match:', err)
      
      // API 실패 시 localStorage에만 저장
      const updatedMatch = { ...matchData, id }
      const updatedMatches = matches.map(match => 
        match.id === id ? updatedMatch : match
      )
      setMatches(updatedMatches)
      localStorage.setItem('soccer-matches', JSON.stringify(updatedMatches))
      
      throw err
    }
  }

  // 경기 삭제
  const deleteMatch = async (id: string) => {
    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete match')
      }

      setMatches(prev => prev.filter(match => match.id !== id))
      
      // localStorage에서도 삭제
      const updatedMatches = matches.filter(match => match.id !== id)
      localStorage.setItem('soccer-matches', JSON.stringify(updatedMatches))
    } catch (err) {
      console.error('Error deleting match:', err)
      
      // API 실패 시 localStorage에서만 삭제
      const updatedMatches = matches.filter(match => match.id !== id)
      setMatches(updatedMatches)
      localStorage.setItem('soccer-matches', JSON.stringify(updatedMatches))
      
      throw err
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  return {
    matches,
    loading,
    error,
    createMatch,
    updateMatch,
    deleteMatch,
    refetch: fetchMatches,
  }
} 