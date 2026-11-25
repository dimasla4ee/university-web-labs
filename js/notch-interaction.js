document.addEventListener('DOMContentLoaded', () => {
    const notch = document.querySelector('.header__notch');
    if (!notch) return;

    const toggleNotch = (open) => {
        const isCurrentlyOpen = notch.getAttribute('aria-expanded') === 'true';
        const newState = open !== undefined ? open : !isCurrentlyOpen;

        notch.setAttribute('aria-expanded', String(newState));
        notch.classList.toggle('is-open', newState);
    };

    const isNestedControl = (target) => {
        if (!(target instanceof Element)) return false;
        const control = target.closest('button, .header__cart');
        return Boolean(control && notch.contains(control));
    };

    notch.addEventListener('click', (e) => {
        const isExpanded = notch.getAttribute('aria-expanded') === 'true';

        if (isNestedControl(e.target)) {
            if (isExpanded) toggleNotch(false);
            return;
        }

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
        const isExpanded = notch.getAttribute('aria-expanded') === 'true';

        if (e.key === 'Escape' && isExpanded) {
            toggleNotch(false);
            notch.focus();
            return;
        }

        if (e.key !== 'Enter' && e.key !== ' ') return;

        if (isNestedControl(e.target)) {
            if (isExpanded) toggleNotch(false);
            return;
        }

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