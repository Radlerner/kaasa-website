const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kaasa-secret-key';

// JWT 토큰 검증 미들웨어
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, member_type }
    next();
  } catch (error) {
    console.error('JWT 검증 실패:', error.message);
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
}

// 관리자 권한 확인 미들웨어
function requireAdmin(req, res, next) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@kaasa.org';

  if (req.user.email !== adminEmail && req.user.role !== 'admin') {
    return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  }

  next();
}

module.exports = { authenticate, requireAdmin };
