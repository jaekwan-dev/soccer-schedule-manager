const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// PostgreSQL 연결 설정
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'soccer_schedule',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
})

async function initializeDatabase() {
  try {
    console.log('데이터베이스 초기화를 시작합니다...')
    
    // SQL 파일 읽기
    const sqlPath = path.join(__dirname, '..', 'lib', 'init-db.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // SQL 실행
    await pool.query(sql)
    
    console.log('✅ 데이터베이스 테이블이 성공적으로 생성되었습니다!')
    
    // 샘플 데이터 삽입
    await insertSampleData()
    
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 중 오류 발생:', error)
  } finally {
    await pool.end()
  }
}

async function insertSampleData() {
  try {
    console.log('샘플 데이터를 삽입합니다...')
    
    const sampleMatches = [
      {
        date: '2025-06-15',
        time: '14:00',
        venue: '서울월드컵경기장',
        vote_deadline: '2025-06-13',
        attend_votes: 8,
        absent_votes: 3,
      },
      {
        date: '2025-06-22',
        time: '16:00',
        venue: '수원월드컵경기장',
        vote_deadline: '2025-06-20',
        attend_votes: 12,
        absent_votes: 1,
      },
      {
        date: '2025-06-29',
        time: '19:00',
        venue: '인천축구전용경기장',
        vote_deadline: '2025-06-27',
        attend_votes: 6,
        absent_votes: 5,
      },
    ]
    
    for (const match of sampleMatches) {
      await pool.query(
        `INSERT INTO matches (date, time, venue, vote_deadline, attend_votes, absent_votes)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [
          match.date,
          match.time,
          match.venue,
          match.vote_deadline,
          match.attend_votes,
          match.absent_votes,
        ]
      )
    }
    
    console.log('✅ 샘플 데이터가 성공적으로 삽입되었습니다!')
    
  } catch (error) {
    console.error('❌ 샘플 데이터 삽입 중 오류 발생:', error)
  }
}

// 스크립트 실행
if (require.main === module) {
  initializeDatabase()
}

module.exports = { initializeDatabase } 