document.addEventListener('DOMContentLoaded', () => {
    const notch = document.querySelector('.header__notch');
    if (!notch) return;

    const toggleNotch = (open) => {
        const isCurrentlyOpen = notch.getAttribute('aria-expanded') === 'true';
        const newState = open !== undefined ? open : !isCurrentlyOpen;

        notch.setAttribute('aria-expanded', newState);
        notch.classList.toggle('is-open', newState);
    };

    notch.addEventListener('click', (e) => {
        const isExpanded = notch.getAttribute('aria-expanded') === 'true';
        const link = e.target.closest('a');

        if (!isExpanded) {
            if (link) e.preventDefault();
            toggleNotch(true);
            return;
        }

        if (link && link.getAttribute('href')) {
            return;
        }

        toggleNotch(false);
    });

    notch.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;

        const isExpanded = notch.getAttribute('aria-expanded') === 'true';
        const link = e.target.closest('a');

        if (isExpanded && link && link.getAttribute('href')) {
            return;
        }

        e.preventDefault();
        toggleNotch();
    });

    document.addEventListener('click', (e) => {
        if (!notch.contains(e.target)) {
            toggleNotch(false);
        }
    });
});