// // postController.js
// const pool = require('../db');
// const { isProfane, clean } = require('../utils/profanity');

// async function createPost(req, res) {
//   try {
//     const { content, emotion } = req.body;
//     if (!content) return res.status(400).json({ message: 'Empty content' });

//     // basic moderation
//     if (isProfane(content)) {
//       // Insert as flagged post (triggers in SQL will create warnings)
//       const [result] = await pool.query(
//         'INSERT INTO `Post`(user_id, content, emotion, status) VALUES(?,?,?,?)',
//         [req.user.user_id, content, emotion || 'Neutral', 'Flagged']
//       );
//       return res.status(400).json({ message: 'Post flagged for profanity', post_id: result.insertId });
//     }

//     const [result] = await pool.query(
//       'INSERT INTO `Post`(user_id, content, emotion) VALUES(?,?,?)',
//       [req.user.user_id, content, emotion || 'Neutral']
//     );
//     res.json({ post_id: result.insertId, message: 'Post created' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// }

// async function getFeed(req, res) {
//   try {
//     const [posts] = await pool.query(
//       `SELECT P.post_id, P.content, P.emotion, P.created_at, P.status, U.user_id, U.name
//        FROM Post P JOIN User U ON P.user_id=U.user_id
//        WHERE P.status='Active'
//        ORDER BY P.created_at DESC
//        LIMIT 100`
//     );
//     res.json(posts);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// }

// async function flagPost(req, res) {
//   try {
//     const postId = req.params.id;
//     // mark flagged (this will trigger DB trigger to issue warning)
//     const [result] = await pool.query('UPDATE Post SET status = ? WHERE post_id = ?', ['Flagged', postId]);
//     if (result.affectedRows === 0) return res.status(404).json({ message: 'Post not found' });
//     res.json({ message: 'Post flagged' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// }

// module.exports = { createPost, getFeed, flagPost };
// controllers/postController.js
const pool = require('../db');
const { isProfane, clean } = require('../utils/profanity');

async function createPost(req, res) {
  try {
    const { content, emotion } = req.body;
    if (!content) return res.status(400).json({ message: 'Empty content' });

    // basic moderation
    if (isProfane(content)) {
      // Insert as flagged post (triggers in SQL will create warnings)
      const [result] = await pool.query(
        'INSERT INTO `Post`(user_id, content, emotion, status) VALUES(?,?,?,?)',
        [req.user.user_id, content, emotion || 'Neutral', 'Flagged']
      );
      return res.status(400).json({ message: 'Post flagged for profanity', post_id: result.insertId });
    }

    const [result] = await pool.query(
      'INSERT INTO `Post`(user_id, content, emotion) VALUES(?,?,?)',
      [req.user.user_id, content, emotion || 'Neutral']
    );
    res.json({ post_id: result.insertId, message: 'Post created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getFeed(req, res) {
  try {
    const [posts] = await pool.query(
      `SELECT P.post_id, P.content, P.emotion, P.created_at, P.status, U.user_id, U.name
       FROM Post P JOIN User U ON P.user_id=U.user_id
       WHERE P.status='Active'
       ORDER BY P.created_at DESC
       LIMIT 100`
    );
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function flagPost(req, res) {
  try {
    const postId = req.params.id;
    // mark flagged (this will trigger DB trigger to issue warning)
    const [result] = await pool.query('UPDATE Post SET status = ? WHERE post_id = ?', ['Flagged', postId]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post flagged' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ✅ Make sure this export is correct
module.exports = {
  createPost,
  getFeed,
  flagPost
};