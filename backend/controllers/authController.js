// authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

async function signup(req, res) {
  try {
    const { name, email, password, dept, year } = req.body;
    /*
    if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });
    if (!email.endsWith('@mail.jiit.ac.in')) return res.status(400).json({ message: 'Use university email' });
*/
    // check duplicate
    const [rows] = await pool.query('SELECT user_id FROM `User` WHERE email=?', [email]);
    if (rows.length > 0) return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO `User`(name,email,password,dept,year) VALUES(?,?,?,?,?)',
      [name, email, hash, dept || null, year || null]
    );

    const token = jwt.sign({ user_id: result.insertId }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const [rows] = await pool.query('SELECT * FROM `User` WHERE email=?', [email]);
    if (rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { user_id: user.user_id, name: user.name, email: user.email, warning_level: user.warning_level } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { signup, login };
