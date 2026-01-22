const Database = require('better-sqlite3');
const path = require('path');

// 데이터베이스 파일 경로
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');

// 데이터베이스 연결
const db = new Database(DB_PATH, { verbose: console.log });

// 테이블 생성
function initDatabase() {
  console.log('📦 데이터베이스 초기화 중...');

  // members 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      birth_date TEXT,
      
      -- 추가 정보
      organization TEXT,
      position TEXT,
      address TEXT,
      postal_code TEXT,
      
      -- 회원 유형 및 상태
      member_type TEXT DEFAULT 'individual',
      member_status TEXT DEFAULT 'pending',
      member_grade TEXT DEFAULT 'bronze',
      
      -- 결제 정보
      is_paid INTEGER DEFAULT 0,
      payment_date TEXT,
      payment_amount INTEGER DEFAULT 0,
      
      -- JSON 데이터
      specializations_json TEXT,
      participations_json TEXT,
      expertise_json TEXT,
      
      -- 가입 동기 및 동의
      motivation TEXT,
      privacy_consent INTEGER DEFAULT 1,
      
      -- 기타
      total_points INTEGER DEFAULT 0,
      is_verified INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      
      -- 타임스탬프
      join_date TEXT DEFAULT (datetime('now')),
      last_login TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  console.log('✅ members 테이블 생성 완료');

  // 인덱스 생성
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
    CREATE INDEX IF NOT EXISTS idx_members_status ON members(member_status);
    CREATE INDEX IF NOT EXISTS idx_members_type ON members(member_type);
  `);

  console.log('✅ 인덱스 생성 완료');

  console.log('🎉 데이터베이스 초기화 완료!');
}

// 스크립트 직접 실행 시 초기화
if (require.main === module) {
  initDatabase();
  db.close();
}

module.exports = { db, initDatabase };
