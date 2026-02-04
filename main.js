const prefersReducedMotion = !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
    pointer: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    rafId: 0
};

function initPointerGlow() {
    if (prefersReducedMotion) return;

    const root = document.documentElement;

    const update = () => {
        state.rafId = 0;
        root.style.setProperty('--pointer-x', `${state.pointer.x}px`);
        root.style.setProperty('--pointer-y', `${state.pointer.y}px`);
    };

    window.addEventListener('pointermove', (event) => {
        state.pointer.x = event.clientX;
        state.pointer.y = event.clientY;
        if (!state.rafId) state.rafId = requestAnimationFrame(update);
    }, { passive: true });
}

function initTiltEffect() {
    if (prefersReducedMotion || window.innerWidth < 768) return;

    const cards = document.querySelectorAll('.project-card, .skill-card, .education-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg
            const rotateY = ((x - centerX) / centerX) * 5;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

function initTypewriter() {
    const el = document.querySelector('.hero-subtitle');
    if (!el) return;
    
    const text = el.textContent;
    el.textContent = '';
    el.classList.add('typed-cursor');
    
    let i = 0;
    const type = () => {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, Math.random() * 50 + 30);
        } else {
            // Blink cursor forever or remove it
            // el.classList.remove('typed-cursor');
        }
    };
    
    setTimeout(type, 1000);
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
        if (event.target.closest('.glass-nav, .nav-toggle')) return;
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
            const y = target.getBoundingClientRect().top + window.scrollY - 80;
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
    const nav = document.querySelector('.glass-nav');
    
    if (!sections.length || !links.length) return;

    const linkById = new Map(links.map(link => [link.getAttribute('href')?.slice(1), link]));
    let rafId = 0;

    const update = () => {
        rafId = 0;
        const y = window.scrollY;
        
        // Nav background
        if (y > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');

        // Active link
        let currentId = sections[0].id;
        for (const section of sections) {
            if (y >= section.offsetTop - 300) currentId = section.id;
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
        { selector: '.section-title', baseDelay: 0, step: 0 },
        { selector: '.skill-card', baseDelay: 100, step: 50 },
        { selector: '.project-card', baseDelay: 100, step: 100 },
        { selector: '.about-text p', baseDelay: 0, step: 100 },
        { selector: '.education-card', baseDelay: 200, step: 0 },
        { selector: '.contact-item', baseDelay: 100, step: 50 }
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
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    all.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
    initPointerGlow();
    initNavToggle();
    initTiltEffect();

    const startExperience = () => {
        initReveals();
        document.body.classList.remove('is-loading');
        document.body.classList.add('loaded');
        
        initSmoothScroll();
        initActiveNav();
        initTypewriter();
    };

    // Slightly faster load for impact
    setTimeout(startExperience, 150);
});
