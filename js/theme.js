const root = document.documentElement;
const button = document.getElementById('theme-toggle');
const themes = ['system', 'light', 'dark'];

let theme = localStorage.getItem('theme') || 'system';

function apply(theme) {
    if (theme === 'system') {
        root.removeAttribute('data-theme');
    } else {
        root.setAttribute('data-theme', theme);
    }
    button.textContent = `Theme: ${theme}`;
    localStorage.setItem('theme', theme);
}

apply(theme);

button.addEventListener('click', () => {
    theme = themes[(themes.indexOf(theme) + 1) % themes.length];
    apply(theme);
});