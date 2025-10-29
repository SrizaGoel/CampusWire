// // postRoutes.js
// const express = require('express');
// const router = express.Router();
// const postController = require('../controllers/postController');
// const authMiddleware = require('../controllers/_authMiddleware'); // simple token check

// router.post('/', authMiddleware, postController.createPost);
// router.get('/feed', authMiddleware, postController.getFeed);
// router.post('/:id/flag', authMiddleware, postController.flagPost);

// module.exports = router;
// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../controllers/_authMiddleware');

router.post('/', authMiddleware, postController.createPost);
router.get('/feed', authMiddleware, postController.getFeed);
router.post('/:id/flag', authMiddleware, postController.flagPost);

module.exports = router; // ✅ This should be the ONLY export