// script.js - small helper (also defines API_BASE if needed)
// You can set window.API_BASE from HTML or via server config.
window.API_BASE = window.API_BASE || 'http://localhost:4000';
// script.js - Add theme functionality
window.API_BASE = window.API_BASE || 'http://localhost:4000';

// Apply festival theme
async function applyFestivalTheme() {
    try {
        const response = await fetch(window.API_BASE + '/api/themes/current');
        const theme = await response.json();
        
        // Remove existing theme classes
        document.body.classList.remove('theme-diwali', 'theme-christmas', 'theme-holi', 'theme-eid');
        
        // Add current theme class
        if (theme.festival_name) {
            const themeClass = 'theme-' + theme.festival_name.toLowerCase();
            document.body.classList.add(themeClass);
            
            // Update CSS variables
            if (theme.primary_color) {
                document.documentElement.style.setProperty('--primary', theme.primary_color);
            }
            if (theme.secondary_color) {
                document.documentElement.style.setProperty('--secondary', theme.secondary_color);
            }
            
            // Add festival banner if on feed page
            if (window.location.pathname.includes('feed.html')) {
                addFestivalBanner(theme);
            }
        }
    } catch (error) {
        console.log('Could not load theme:', error);
    }
}

function addFestivalBanner(theme) {
    // Remove existing banner
    const existingBanner = document.getElementById('festival-banner');
    if (existingBanner) {
        existingBanner.remove();
    }
    
    // Add new banner
    if (theme.festival_name && theme.festival_name !== 'Default') {
        const banner = document.createElement('div');
        banner.id = 'festival-banner';
        banner.className = 'festival-banner';
        banner.innerHTML = `🎉 ${theme.festival_name} Celebration! 🎉`;
        
        const container = document.querySelector('.container');
        container.insertBefore(banner, container.firstChild);
    }
}

// Apply theme when page loads
document.addEventListener('DOMContentLoaded', applyFestivalTheme);
