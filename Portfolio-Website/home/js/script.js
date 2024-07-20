document.getElementById('toggle-theme').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const themeIcon = document.getElementById('theme-icon');
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.src = '../icons/moon.svg';
    } else {
        themeIcon.src = '../icons/sun.svg';
    }
});
