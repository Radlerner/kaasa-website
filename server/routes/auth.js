const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'kaasa-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      name_kr,
      mobile,
      birth_date,
      organization,
      position,
      address,
      postal_code,
      member_type,
      specializations,
      participations,
      certifications,
      degrees,
      projects,
      motivation,
      privacy_consent
    } = req.body;

    console.log('📥 회원가입 요청:', { email, name_kr, member_type });

    // 필수 필드 검증
    if (!email || !password || !name_kr || !mobile) {
      return res.status(400).json({ 
        error: '필수 항목을 모두 입력해주세요.',
        missing: { email: !email, password: !password, name_kr: !name_kr, mobile: !mobile }
      });
    }

    // 이메일 중복 확인
    const existing = db.prepare('SELECT id FROM members WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: '이미 가입된 이메일입니다.' });
    }

    // 비밀번호 해시
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // JSON 데이터 준비
    const specializations_json = JSON.stringify(specializations || []);
    const participations_json = JSON.stringify(participations || []);
    const expertise_json = JSON.stringify({
      certifications: certifications || [],
      degrees: degrees || [],
      projects: projects || []
    });

    // 회원 저장
    const stmt = db.prepare(`
      INSERT INTO members (
        email, password_hash, name, phone, birth_date,
        organization, position, address, postal_code,
        member_type, member_status, member_grade,
        specializations_json, participations_json, expertise_json,
        motivation, privacy_consent,
        total_points, is_verified, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      email,
      password_hash,
      name_kr,
      mobile,
      birth_date || null,
      organization || null,
      position || null,
      address || null,
      postal_code || null,
      member_type || 'individual',
      'pending', // member_status
      'bronze', // member_grade
      specializations_json,
      participations_json,
      expertise_json,
      motivation || null,
      privacy_consent ? 1 : 0,
      0, // total_points
      0, // is_verified
      'pending' // status
    );

    console.log('✅ 회원가입 성공:', result.lastInsertRowid);

    res.status(201).json({
      ok: true,
      memberId: result.lastInsertRowid,
      message: 'KAASA 입회원서가 제출되었습니다. 관리자 승인 후 로그인하실 수 있습니다.'
    });

  } catch (error) {
    console.error('❌ 회원가입 오류:', error);
    res.status(500).json({ error: '회원가입 처리 중 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 로그인 요청:', email);

    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    }

    // 회원 조회
    const member = db.prepare('SELECT * FROM members WHERE email = ?').get(email);

    if (!member) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 비밀번호 검증
    const isValid = await bcrypt.compare(password, member.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        id: member.id, 
        email: member.email,
        member_type: member.member_type,
        member_status: member.member_status
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 마지막 로그인 시간 업데이트
    db.prepare('UPDATE members SET last_login = datetime("now") WHERE id = ?').run(member.id);

    console.log('✅ 로그인 성공:', member.email);

    // 비밀번호 해시 제외하고 응답
    delete member.password_hash;

    res.json({
      ok: true,
      token,
      member: {
        ...member,
        specializations: JSON.parse(member.specializations_json || '[]'),
        participations: JSON.parse(member.participations_json || '[]'),
        expertise: JSON.parse(member.expertise_json || '{}')
      }
    });

  } catch (error) {
    console.error('❌ 로그인 오류:', error);
    res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' });
  }
});

// 내 정보 조회 (인증 필요)
router.get('/me', authenticate, (req, res) => {
  try {
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.user.id);

    if (!member) {
      return res.status(404).json({ error: '회원 정보를 찾을 수 없습니다.' });
    }

    delete member.password_hash;

    res.json({
      ok: true,
      member: {
        ...member,
        specializations: JSON.parse(member.specializations_json || '[]'),
        participations: JSON.parse(member.participations_json || '[]'),
        expertise: JSON.parse(member.expertise_json || '{}')
      }
    });

  } catch (error) {
    console.error('❌ 내 정보 조회 오류:', error);
    res.status(500).json({ error: '회원 정보 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
