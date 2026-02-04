const prefersReducedMotion = !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initPointerGlow() {
    if (prefersReducedMotion) return;

    const root = document.documentElement;
    let rafId = 0;
    let lastX = window.innerWidth * 0.5;
    let lastY = window.innerHeight * 0.3;

    const commit = () => {
        rafId = 0;
        root.style.setProperty('--pointer-x', `${lastX}px`);
        root.style.setProperty('--pointer-y', `${lastY}px`);
    };

    window.addEventListener('pointermove', (event) => {
        lastX = event.clientX;
        lastY = event.clientY;
        if (!rafId) rafId = requestAnimationFrame(commit);
    }, { passive: true });
}

function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
        document.body.classList.toggle('nav-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    toggle.addEventListener('click', () => {
        setOpen(!document.body.classList.contains('nav-open'));
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') setOpen(false);
    });

    document.addEventListener('click', (event) => {
        if (!document.body.classList.contains('nav-open')) return;
        if (event.target.closest('.glass-nav')) return;
        setOpen(false);
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (event) => {
            const href = anchor.getAttribute('href');
            if (!href || href.length < 2) return;

            const target = document.querySelector(href);
            if (!target) return;

            event.preventDefault();
            const y = target.getBoundingClientRect().top + window.scrollY - 90;
            window.scrollTo({
                top: Math.max(0, y),
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    });
}

function initActiveNav() {
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const links = Array.from(document.querySelectorAll('.nav-links a'));
    if (!sections.length || !links.length) return;

    const linkById = new Map(links.map(link => [link.getAttribute('href')?.slice(1), link]));
    let rafId = 0;

    const update = () => {
        rafId = 0;
        const y = window.scrollY;
        let currentId = sections[0].id;

        for (const section of sections) {
            if (y >= section.offsetTop - 220) currentId = section.id;
        }

        for (const link of links) link.classList.remove('is-active');
        const active = linkById.get(currentId);
        if (active) active.classList.add('is-active');
    };

    const schedule = () => {
        if (!rafId) rafId = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
}

function initReveals() {
    const revealNow = (el) => {
        el.classList.add('reveal');
        el.classList.add('is-visible');
    };

    const revealLater = (el) => {
        el.classList.add('reveal');
    };

    const groups = [
        { selector: '.section-title', baseDelay: 0, step: 60 },
        { selector: '.skill-card', baseDelay: 40, step: 70 },
        { selector: '.project-card', baseDelay: 40, step: 80 },
        { selector: '.about-text p', baseDelay: 40, step: 70 },
        { selector: '.education-card', baseDelay: 80, step: 0 },
        { selector: '.contact-item', baseDelay: 40, step: 60 }
    ];

    const all = [];
    for (const group of groups) {
        const items = Array.from(document.querySelectorAll(group.selector));
        items.forEach((el, i) => {
            el.style.setProperty('--reveal-delay', `${group.baseDelay + i * group.step}ms`);
            all.push(el);
        });
    }

    if (prefersReducedMotion) {
        all.forEach(revealNow);
        return;
    }

    all.forEach(revealLater);

    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    }, { threshold: 0.12, rootMargin: '0px 0px -90px 0px' });

    all.forEach(el => observer.observe(el));
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initPointerGlow();
    initNavToggle();

    const startExperience = () => {
        initReveals();

        document.body.classList.remove('is-loading');
        document.body.classList.add('loaded');

        initSmoothScroll();
        initActiveNav();
    };

    setTimeout(startExperience, 320);
});

  
