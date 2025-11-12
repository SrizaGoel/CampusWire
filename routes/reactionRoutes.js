// // routes/reactionRoutes.js
// const express = require('express');
// const router = express.Router();
// const pool = require('../db');
// const auth = require('../middleware/auth');

// router.post('/like', auth, async (req, res) => {
//   const { post_id } = req.body;
//   await pool.query('INSERT IGNORE INTO Reaction(post_id, user_id, type) VALUES(?, ?, "Like")', [post_id, req.user.user_id]);
//   res.json({ msg: 'Liked' });
// });

// router.post('/comment', auth, async (req, res) => {
//   const { post_id, comment } = req.body;
//   await pool.query('INSERT INTO Reaction(post_id, user_id, type, comment_text) VALUES(?, ?, "Comment", ?)', [post_id, req.user.user_id, comment]);
//   res.json({ msg: 'Commented' });
// });

// router.post('/share', auth, async (req, res) => {
//   const { post_id } = req.body;
//   await pool.query('INSERT INTO Reaction(post_id, user_id, type) VALUES(?, ?, "Share")', [post_id, req.user.user_id]);
//   await pool.query('UPDATE Post SET share_count = share_count + 1 WHERE post_id = ?', [post_id]);
//   res.json({ msg: 'Shared' });
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.post('/like', auth, async (req, res) => {
  try {
    const { post_id } = req.body;
    await pool.query('INSERT IGNORE INTO Reaction(post_id, user_id, type) VALUES(?, ?, "Like")', [post_id, req.user.user_id]);
    res.json({ msg: 'Liked' });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

router.post('/comment', auth, async (req, res) => {
  try {
    const { post_id, comment } = req.body;
    await pool.query('INSERT INTO Reaction(post_id, user_id, type, comment_text) VALUES(?, ?, "Comment", ?)', [post_id, req.user.user_id, comment]);
    res.json({ msg: 'Commented' });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.post('/share', auth, async (req, res) => {
  try {
    const { post_id } = req.body;
    await pool.query('INSERT INTO Reaction(post_id, user_id, type) VALUES(?, ?, "Share")', [post_id, req.user.user_id]);
    await pool.query('UPDATE Post SET share_count = share_count + 1 WHERE post_id = ?', [post_id]);
    res.json({ msg: 'Shared' });
  } catch (error) {
    console.error('Share error:', error);
    res.status(500).json({ error: 'Failed to share post' });
  }
});

module.exports = router;