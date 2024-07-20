// Function to apply the theme based on localStorage value
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-icon').src = '../icons/moon.svg';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-icon').src = '../icons/sun.svg';
    }
}

// Event listener for theme toggle button
document.getElementById('toggle-theme').addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    const themeIcon = document.getElementById('theme-icon');
    if (isDarkMode) {
        themeIcon.src = '../icons/moon.svg';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.src = '../icons/sun.svg';
        localStorage.setItem('theme', 'light');
    }
});

// Apply the theme on page load based on localStorage value
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
});

// Function to handle search and navigate to section
document.getElementById('search-button').addEventListener('click', () => {
    const query = document.getElementById('search-input').value.toLowerCase();
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        const textContent = section.textContent.toLowerCase();
        if (textContent.includes(query)) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
