import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 모든 환경 변수 확인
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('All env keys:', Object.keys(process.env).filter(key => key.includes('DATABASE')));
    
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({ 
        error: 'DATABASE_URL 환경 변수가 설정되지 않았습니다.',
        env: process.env.NODE_ENV,
        allEnvKeys: Object.keys(process.env).filter(key => key.includes('DATABASE')),
        processEnvKeys: Object.keys(process.env).length
      }, { status: 500 });
    }

    if (databaseUrl === 'your_neon_database_url_here') {
      return NextResponse.json({ 
        error: 'DATABASE_URL에 실제 Neon DB URL을 입력해주세요.',
        currentValue: databaseUrl 
      }, { status: 500 });
    }

    // 실제 데이터베이스 연결 테스트
    try {
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(databaseUrl);
      
      // 간단한 쿼리로 연결 테스트
      const result = await sql`SELECT 1 as test`;
      
      return NextResponse.json({ 
        message: '데이터베이스 연결 성공!',
        env: process.env.NODE_ENV,
        connectionTest: result[0],
        urlFormat: databaseUrl.startsWith('postgresql://') ? 'Valid' : 'Invalid'
      });
      
    } catch (dbError) {
      return NextResponse.json({ 
        error: '데이터베이스 연결 실패',
        details: dbError instanceof Error ? dbError.message : 'Unknown DB error',
        urlExists: !!databaseUrl,
        urlFormat: databaseUrl.startsWith('postgresql://') ? 'Valid' : 'Invalid'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('환경 변수 테스트 오류:', error);
    return NextResponse.json({ 
      error: '환경 변수 테스트 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 