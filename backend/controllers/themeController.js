// // themeController.js - Festival theme endpoints
// const pool = require('../db');

// async function getCurrentTheme(req, res) {
//   try {
//     // Get current date to find active festival
//     const currentDate = new Date().toISOString().split('T')[0];
    
//     const [themes] = await pool.query(
//       `SELECT * FROM FestivalTheme 
//        WHERE start_date <= ? AND end_date >= ?
//        ORDER BY start_date DESC LIMIT 1`,
//       [currentDate, currentDate]
//     );
    
//     if (themes.length === 0) {
//       // Return default theme if no festival active
//       return res.json({
//         festival_name: 'Default',
//         primary_color: '#2563eb',
//         secondary_color: '#1e40af',
//         background_image: null,
//         banner_image: null
//       });
//     }
    
//     res.json(themes[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// }

// async function getAllThemes(req, res) {
//   try {
//     const [themes] = await pool.query(
//       'SELECT * FROM FestivalTheme ORDER BY start_date DESC'
//     );
//     res.json(themes);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// }

// module.exports = { getCurrentTheme, getAllThemes };
// themeController.js - Updated for month-long festivals
const pool = require('../db');

async function getCurrentTheme(req, res) {
  try {
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();
    
    // Format: YYYY-MM
    const currentMonthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    
    const [themes] = await pool.query(
      `SELECT * FROM FestivalTheme 
       WHERE CONCAT(YEAR(start_date), '-', MONTH(start_date)) = ?
       ORDER BY start_date DESC LIMIT 1`,
      [currentMonthStr]
    );
    
    if (themes.length === 0) {
      // Return seasonal theme based on current month
      return res.json(getSeasonalTheme(currentMonth));
    }
    
    res.json(themes[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

function getSeasonalTheme(month) {
  const seasonalThemes = {
    1: { // January - Winter
      festival_name: 'Winter',
      primary_color: '#0369a1',
      secondary_color: '#7dd3fc',
      background_image: null,
      banner_image: null
    },
    2: { // February - Valentine's
      festival_name: 'Valentine',
      primary_color: '#be185d',
      secondary_color: '#f472b6', 
      background_image: null,
      banner_image: null
    },
    3: { // March - Spring
      festival_name: 'Spring',
      primary_color: '#65a30d',
      secondary_color: '#a3e635',
      background_image: null,
      banner_image: null
    },
    4: { // April - Spring Flowers
      festival_name: 'Blossom',
      primary_color: '#c026d3',
      secondary_color: '#f0abfc',
      background_image: null,
      banner_image: null
    },
    5: { // May - Summer Start
      festival_name: 'Summer',
      primary_color: '#ea580c',
      secondary_color: '#fdba74',
      background_image: null,
      banner_image: null
    },
    6: { // June - Rainy Season
      festival_name: 'Monsoon',
      primary_color: '#0ea5e9',
      secondary_color: '#7dd3fc',
      background_image: null,
      banner_image: null
    },
    7: { // July - Independence (US)
      festival_name: 'Freedom',
      primary_color: '#1d4ed8',
      secondary_color: '#60a5fa',
      background_image: null,
      banner_image: null
    },
    8: { // August - Late Summer
      festival_name: 'Sunshine',
      primary_color: '#eab308',
      secondary_color: '#fef08a',
      background_image: null,
      banner_image: null
    },
    9: { // September - Autumn
      festival_name: 'Autumn',
      primary_color: '#ea580c',
      secondary_color: '#fdba74',
      background_image: null,
      banner_image: null
    },
    10: { // October - Halloween/Diwali
      festival_name: 'Diwali',
      primary_color: '#ffd700',
      secondary_color: '#ff9933',
      background_image: null,
      banner_image: null
    },
    11: { // November - Thanksgiving
      festival_name: 'Thanksgiving',
      primary_color: '#b45309',
      secondary_color: '#78350f',
      background_image: null,
      banner_image: null
    },
    12: { // December - Christmas
      festival_name: 'Christmas',
      primary_color: '#b30000',
      secondary_color: '#165b33',
      background_image: null,
      banner_image: null
    }
  };
  
  return seasonalThemes[month] || {
    festival_name: 'Campuswire',
    primary_color: '#2563eb',
    secondary_color: '#1e40af',
    background_image: null,
    banner_image: null
  };
}

async function getAllThemes(req, res) {
  try {
    const [themes] = await pool.query(
      'SELECT * FROM FestivalTheme ORDER BY start_date DESC'
    );
    res.json(themes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getCurrentTheme, getAllThemes };