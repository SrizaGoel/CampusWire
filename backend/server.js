// server.js - entry point



/*
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');

// console.log('authRoutes:', authRoutes);
// console.log('postRoutes:', postRoutes);
// console.log('adminRoutes:', adminRoutes);
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Debug the imports
console.log('=== DEBUGGING ROUTE IMPORTS ===');

const authRoutes = require('./routes/authRoutes');
console.log('authRoutes type:', typeof authRoutes);
console.log('authRoutes:', authRoutes);

const postRoutes = require('./routes/postRoutes');
console.log('postRoutes type:', typeof postRoutes);
console.log('postRoutes:', postRoutes);

const adminRoutes = require('./routes/adminRoutes');
console.log('adminRoutes type:', typeof adminRoutes);
console.log('adminRoutes:', adminRoutes);

console.log('=== END DEBUGGING ===');

const app1 = express();
app1.use(cors());
app1.use(express.json());

// routes
app1.use('/api/auth', authRoutes);
app1.use('/api/posts', postRoutes);
app1.use('/api/admin', adminRoutes);

// health
app1.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT1 = process.env.PORT || 4000;
app.listen(PORT1, () => console.log(`Campuswire backend running on ${PORT}`));
const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);

// health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Campuswire backend running on ${PORT}`));

*/
// // server.js - COMPLETE REPLACEMENT
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');

// // Import routes - ONLY ONCE
// const authRoutes = require('./routes/authRoutes');
// const postRoutes = require('./routes/postRoutes');
// const adminRoutes = require('./routes/adminRoutes');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Use routes
// app.use('/api/auth', authRoutes);
// app.use('/api/posts', postRoutes);
// app.use('/api/admin', adminRoutes);

// // Health check
// app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
/*
// server.js - SIMPLIFIED AND ROBUST
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple test route first - without any dependencies
app.get('/api/test', (req, res) => {
  console.log('Test route called');
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

// Health check without dependencies
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Basic server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found', 
    path: req.originalUrl 
  });
});

// Global error handler
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Server successfully started on port ${PORT}`);
  console.log(`📍 Test: http://localhost:${PORT}/api/test`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.log(`   Port ${PORT} is already in use`);
    console.log('   Run: netstat -ano | findstr :4000 (Windows) or lsof -i :4000 (Mac/Linux)');
  }
});
*/
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Test routes
// app.get('/api/test', (req, res) => {
//   res.json({ message: 'Server is working!' });
// });

// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok' });
// });

// console.log('=== LOADING ROUTES ===');

// // STEP 1: Try loading auth routes
// try {
//   console.log('1. Loading auth routes...');
//   const authRoutes = require('./routes/authRoutes');
//   app.use('/api/auth', authRoutes);
//   console.log('   ✅ Auth routes loaded successfully');
// } catch (err) {
//   console.log('❌ Auth routes failed to load:', err.message);
//   // Don't exit yet, let's see what happens
// }
// // STEP 2: Try loading post routes
// try {
//   console.log('2. Loading post routes...');
//   const postRoutes = require('./routes/postRoutes');
//   app.use('/api/posts', postRoutes);
//   console.log('   ✅ Post routes loaded successfully');
// } catch (err) {
//   console.log('❌ Post routes failed to load:', err.message);
// }
// // STEP 3: Try loading admin routes
// try {
//   console.log('3. Loading admin routes...');
//   const adminRoutes = require('./routes/adminRoutes');
//   app.use('/api/admin', adminRoutes);
//   console.log('   ✅ Admin routes loaded successfully');
// } catch (err) {
//   console.log('❌ Admin routes failed to load:', err.message);
// }
// const PORT = process.env.PORT || 4000;

// app.listen(PORT, () => {
//   console.log(`\n✅ Server running on port ${PORT}`);
//   console.log('📍 Endpoints:');
//   console.log('   http://localhost:4000/api/test');
//   console.log('   http://localhost:4000/api/health');
//   console.log('   http://localhost:4000/api/auth/signup');
//   console.log('   http://localhost:4000/api/auth/login');
// }).on('error', (err) => {
//   console.error('❌ Server failed to start:', err.message);
// });

// server.js - WITH CRASH PROTECTION
require('dotenv').config();
const express = require('express');
const cors = require('cors');

console.log('1. Starting server initialization...');

const app = express();
console.log('2. Express app created');

// Basic middleware
app.use(cors());
app.use(express.json());
console.log('3. Middleware applied');

// Simple test route first - without any dependencies
app.get('/api/test', (req, res) => {
  console.log('Test route called');
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});
// In your server.js, add this with other route imports:
const themeRoutes = require('./routes/themeRoutes');

// Add with other route usage:
app.use('/api/themes', themeRoutes);
app.get('/api/health', (req, res) => {
  console.log('Health check called');
  res.json({ 
    status: 'ok', 
    message: 'Basic server is running',
    timestamp: new Date().toISOString()
  });
});

console.log('4. Basic routes defined');

// Add route loading with try-catch
console.log('5. Starting to load routes...');

let routesLoaded = false;
try {
  console.log('5.1 Loading auth routes...');
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('   ✅ Auth routes loaded');
  
  console.log('5.2 Loading post routes...');
  const postRoutes = require('./routes/postRoutes');
  app.use('/api/posts', postRoutes);
  console.log('   ✅ Post routes loaded');
  
  console.log('5.3 Loading admin routes...');
  const adminRoutes = require('./routes/adminRoutes');
  app.use('/api/admin', adminRoutes);
  console.log('   ✅ Admin routes loaded');
  
  routesLoaded = true;
  console.log('5.4 All routes loaded successfully');
} catch (err) {
  console.log('❌ Route loading failed:', err);
  console.log('Error stack:', err.stack);
}

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err);
  console.error('Stack:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});

const PORT = process.env.PORT || 4000;

console.log(`6. Attempting to start server on port ${PORT}...`);

try {
  const server = app.listen(PORT, () => {
    console.log(`\n🎉 SERVER SUCCESSFULLY STARTED ON PORT ${PORT}`);
    console.log(`📍 Test: http://localhost:${PORT}/api/test`);
    console.log(`📍 Health: http://localhost:${PORT}/api/health`);
    console.log('Server is ready and waiting for requests...');
  });
  
  server.on('error', (err) => {
    console.error('❌ Server listen error:', err.message);
    if (err.code === 'EADDRINUSE') {
      console.log(`   Port ${PORT} is already in use`);
    }
  });
  
  // Keep the process alive
  setInterval(() => {
    // This keeps the event loop busy
  }, 1000);
  
} catch (err) {
  console.error('💥 Server startup failed:', err);
  console.error('Stack:', err.stack);
}