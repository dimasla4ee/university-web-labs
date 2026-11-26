document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.timeline__container');
    const stamps = Array.from(document.querySelectorAll('.timeline-stamp[id]'));
    const links = Array.from(document.querySelectorAll('.sidebar__link[href^="#"]'));

    if (!container || !stamps.length || !links.length) return;

    let programmaticTargetId = null;
    let releaseTimer = null;

    const setActive = (id) => {
        stamps.forEach((stamp) => {
            stamp.classList.toggle('is-active', stamp.id === id);
        });

        links.forEach((link) => {
            const isMatch = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('is-active', isMatch);
            if (isMatch) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const getScrollPaddingLeft = () =>
        parseFloat(getComputedStyle(container).scrollPaddingLeft) || 0;

    const scrollToStamp = (stamp, smooth = true) => {
        const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
        const rawLeft = stamp.offsetLeft - getScrollPaddingLeft();
        const targetLeft = Math.max(0, Math.min(rawLeft, maxScroll));

        programmaticTargetId = stamp.id;
        setActive(stamp.id);

        clearTimeout(releaseTimer);
        releaseTimer = setTimeout(() => {
            programmaticTargetId = null;
        }, 800);

        container.scrollTo({
            left: targetLeft,
            behavior: smooth ? 'smooth' : 'auto',
        });
    };

    const releaseProgrammaticLock = () => {
        clearTimeout(releaseTimer);
        programmaticTargetId = null;
    };

    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((eventName) => {
        container.addEventListener(eventName, releaseProgrammaticLock, {passive: true});
    });

    const updateActiveFromScroll = () => {
        if (programmaticTargetId) return;

        const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
        if (maxScroll > 0 && container.scrollLeft >= maxScroll - 2) {
            setActive(stamps[stamps.length - 1].id);
            return;
        }

        const anchorX = container.scrollLeft + getScrollPaddingLeft();
        let closestStamp = stamps[0];
        let minDistance = Infinity;

        stamps.forEach((stamp) => {
            const distance = Math.abs(stamp.offsetLeft - anchorX);
            if (distance < minDistance) {
                minDistance = distance;
                closestStamp = stamp;
            }
        });

        setActive(closestStamp.id);
    };

    container.addEventListener('scroll', updateActiveFromScroll, {passive: true});

    links.forEach((link) => {
        link.addEventListener('click', (e) => {
            const hash = link.getAttribute('href');
            if (!hash || hash === '#') return;

            const target = document.getElementById(hash.slice(1));
            if (!target || !container.contains(target)) return;

            e.preventDefault();
            history.replaceState(null, '', hash);
            scrollToStamp(target, true);
        });
    });

    const initialId = window.location.hash.slice(1);
    const initialStamp = stamps.find((stamp) => stamp.id === initialId);

    if (initialStamp) {
        scrollToStamp(initialStamp, false);
    } else {
        setActive(stamps[0].id);
    }
});