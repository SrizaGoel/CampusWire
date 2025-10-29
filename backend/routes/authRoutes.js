// // authRoutes.js
// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');

// router.post('/signup', authController.signup);
// router.post('/login', authController.login);

// module.exports = router;
// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router; // ✅ This should be the ONLY export