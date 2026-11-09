const root = document.documentElement;
const buttons = document.querySelectorAll('.theme-btn');

function apply(theme) {
    if (theme === 'system') {
        root.removeAttribute('data-theme');
    } else {
        root.setAttribute('data-theme', theme);
    }

    buttons.forEach((btn) => {
        const isActive = btn.dataset.theme === theme;
        btn.disabled = isActive;
        btn.setAttribute('aria-pressed', String(isActive));
    });

    localStorage.setItem('theme', theme);
}

apply(localStorage.getItem('theme') || 'system');

buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
        if (btn.disabled) return;
        apply(btn.dataset.theme);
    });
});