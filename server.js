require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const reactionRoutes = require('./routes/reactionRoutes');
const themeRoutes = require('./routes/themeRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Debug: Check what each route exports
console.log('=== ROUTE EXPORTS DEBUG ===');
console.log('authRoutes type:', typeof authRoutes);
console.log('authRoutes:', authRoutes);
console.log('postRoutes type:', typeof postRoutes);
console.log('postRoutes:', postRoutes);
console.log('reactionRoutes type:', typeof reactionRoutes);
console.log('reactionRoutes:', reactionRoutes);
console.log('themeRoutes type:', typeof themeRoutes);
console.log('themeRoutes:', themeRoutes);
console.log('adminRoutes type:', typeof adminRoutes);
console.log('adminRoutes:', adminRoutes);
console.log('===========================');

// Use routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/react', reactionRoutes);
app.use('/theme', themeRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));