// _authMiddleware.js - basic JWT auth, attaches user info
const jwt = require('jsonwebtoken');
const pool = require('../db');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

module.exports = async function (req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'No token' });
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.query('SELECT user_id, name, email, warning_level FROM `User` WHERE user_id=?', [payload.user_id]);
    if (!rows.length) return res.status(401).json({ message: 'User not found' });
    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
