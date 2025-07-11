import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// 환경 변수에서 DATABASE_URL을 가져옵니다
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    console.error('DATABASE_URL 환경 변수가 설정되지 않았습니다.');
    console.error('사용 가능한 환경 변수:', Object.keys(process.env).filter(key => key.includes('DATABASE')));
    throw new Error('DATABASE_URL 환경 변수가 필요합니다.');
  }
  
  console.log('DATABASE_URL 로드됨:', url.substring(0, 20) + '...');
  console.log('환경:', process.env.NODE_ENV || 'development');
  console.log('Vercel 환경:', process.env.VERCEL ? 'true' : 'false');
  console.log('Vercel 환경 변수:', {
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_REGION: process.env.VERCEL_REGION,
    VERCEL_URL: process.env.VERCEL_URL
  });
  
  return url;
};

console.log('데이터베이스 연결 초기화 시작...');
const sql = neon(getDatabaseUrl());
console.log('Neon SQL 클라이언트 생성 완료');

export const db = drizzle(sql, { 
  schema,
  logger: process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview'
});

console.log('Drizzle ORM 설정 완료');

export * from './schema'; 