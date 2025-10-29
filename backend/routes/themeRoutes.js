// themeRoutes.js
const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');

router.get('/current', themeController.getCurrentTheme);
router.get('/all', themeController.getAllThemes);

module.exports = router;