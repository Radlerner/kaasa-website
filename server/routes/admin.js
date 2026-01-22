const express = require('express');
const { db } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 모든 관리자 라우트는 인증 + 관리자 권한 필요
router.use(authenticate);
router.use(requireAdmin);

// 회원 목록 조회
router.get('/members', (req, res) => {
  try {
    const { search, status, type, page = 1, limit = 20 } = req.query;

    let query = 'SELECT * FROM members WHERE 1=1';
    const params = [];

    // 검색 조건
    if (search) {
      query += ' AND (email LIKE ? OR name LIKE ? OR phone LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (status) {
      query += ' AND member_status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND member_type = ?';
      params.push(type);
    }

    // 전체 개수 조회
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const { total } = db.prepare(countQuery).get(...params);

    // 페이지네이션
    const offset = (page - 1) * limit;
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const members = db.prepare(query).all(...params);

    // 비밀번호 해시 제거
    const sanitizedMembers = members.map(m => {
      delete m.password_hash;
      return {
        ...m,
        specializations: JSON.parse(m.specializations_json || '[]'),
        participations: JSON.parse(m.participations_json || '[]'),
        expertise: JSON.parse(m.expertise_json || '{}')
      };
    });

    res.json({
      ok: true,
      members: sanitizedMembers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ 회원 목록 조회 오류:', error);
    res.status(500).json({ error: '회원 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 회원 상세 조회
router.get('/members/:id', (req, res) => {
  try {
    const { id } = req.params;

    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(id);

    if (!member) {
      return res.status(404).json({ error: '회원을 찾을 수 없습니다.' });
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
    console.error('❌ 회원 상세 조회 오류:', error);
    res.status(500).json({ error: '회원 정보 조회 중 오류가 발생했습니다.' });
  }
});

// 회원 정보 수정 (상태 변경, 승인 등)
router.patch('/members/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log('📝 회원 정보 수정:', { id, updates });

    // 허용된 필드만 업데이트
    const allowedFields = [
      'member_status',
      'member_grade',
      'is_paid',
      'payment_date',
      'payment_amount',
      'status',
      'is_verified'
    ];

    const fieldsToUpdate = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fieldsToUpdate.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ error: '수정할 필드가 없습니다.' });
    }

    // updated_at 추가
    fieldsToUpdate.push('updated_at = datetime("now")');
    values.push(id);

    const query = `UPDATE members SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    const result = db.prepare(query).run(...values);

    if (result.changes === 0) {
      return res.status(404).json({ error: '회원을 찾을 수 없습니다.' });
    }

    console.log('✅ 회원 정보 수정 완료:', id);

    // 수정된 회원 정보 조회
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
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
    console.error('❌ 회원 정보 수정 오류:', error);
    res.status(500).json({ error: '회원 정보 수정 중 오류가 발생했습니다.' });
  }
});

// 회원 승인 (간편 API)
router.post('/members/:id/approve', (req, res) => {
  try {
    const { id } = req.params;

    const result = db.prepare(`
      UPDATE members 
      SET member_status = 'active_free', 
          status = 'active',
          updated_at = datetime('now')
      WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '회원을 찾을 수 없습니다.' });
    }

    console.log('✅ 회원 승인 완료:', id);

    res.json({
      ok: true,
      message: '회원이 승인되었습니다.'
    });

  } catch (error) {
    console.error('❌ 회원 승인 오류:', error);
    res.status(500).json({ error: '회원 승인 중 오류가 발생했습니다.' });
  }
});

// 회원 정지
router.post('/members/:id/suspend', (req, res) => {
  try {
    const { id } = req.params;

    const result = db.prepare(`
      UPDATE members 
      SET member_status = 'suspended', 
          status = 'suspended',
          updated_at = datetime('now')
      WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '회원을 찾을 수 없습니다.' });
    }

    console.log('⚠️ 회원 정지:', id);

    res.json({
      ok: true,
      message: '회원이 정지되었습니다.'
    });

  } catch (error) {
    console.error('❌ 회원 정지 오류:', error);
    res.status(500).json({ error: '회원 정지 중 오류가 발생했습니다.' });
  }
});

// 회원 탈퇴
router.post('/members/:id/withdraw', (req, res) => {
  try {
    const { id } = req.params;

    const result = db.prepare(`
      UPDATE members 
      SET member_status = 'withdrawn', 
          status = 'withdrawn',
          updated_at = datetime('now')
      WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '회원을 찾을 수 없습니다.' });
    }

    console.log('🚪 회원 탈퇴:', id);

    res.json({
      ok: true,
      message: '회원이 탈퇴 처리되었습니다.'
    });

  } catch (error) {
    console.error('❌ 회원 탈퇴 오류:', error);
    res.status(500).json({ error: '회원 탈퇴 처리 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
