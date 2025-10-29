// adminRoutes.js - minimal endpoints for admin/moderator tasks
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../controllers/_authMiddleware');

// Simple secured endpoint - in real app check role
router.get('/flagged', auth, async (req, res) => {
  try {
    // Only allow Moderator/Admin - example simple check (extend in real app)
    // For demo, allow any authenticated user
    const [rows] = await pool.query(
      `SELECT P.post_id, P.content, P.created_at, U.user_id, U.name
       FROM Post P JOIN User U ON P.user_id=U.user_id
       WHERE P.status='Flagged' ORDER BY P.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
