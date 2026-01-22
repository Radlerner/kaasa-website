require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// 데이터베이스 초기화
initDatabase();

// CORS 설정 (중요!)
const allowedOrigins = [
  'https://www.genspark.ai',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080'
];

app.use(cors({
  origin: function (origin, callback) {
    // origin이 없는 경우 (같은 도메인 요청, Postman 등)
    if (!origin) return callback(null, true);
    
    // 허용된 origin인지 확인
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS 차단:', origin);
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // 토큰은 헤더로 전달하므로 false
  optionsSuccessStatus: 200
}));

// Preflight 요청 처리
app.options('*', cors());

// Body 파싱 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// 헬스 체크 (가장 먼저)
app.get('/health', (req, res) => {
  res.json({ ok: true, status: 'ok', timestamp: new Date().toISOString() });
});

// 기본 라우트 (API 문서)
app.get('/', (req, res) => {
  res.json({ 
    ok: true,
    message: 'KAASA 백엔드 서버',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (Bearer token)'
      },
      admin: {
        members: 'GET /api/admin/members',
        memberDetail: 'GET /api/admin/members/:id',
        updateMember: 'PATCH /api/admin/members/:id',
        approve: 'POST /api/admin/members/:id/approve',
        suspend: 'POST /api/admin/members/:id/suspend',
        withdraw: 'POST /api/admin/members/:id/withdraw'
      }
    }
  });
});

// API 라우트
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('❌ 서버 오류:', err);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log('🚀 KAASA 백엔드 서버 시작!');
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
});
