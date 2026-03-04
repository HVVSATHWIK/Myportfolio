const prefersReducedMotion = !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
    pointer: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    rafId: 0
};

function initThreeBackground() {
    if (prefersReducedMotion) return;
    if (typeof THREE === 'undefined') return;

    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Floating particles
    const particleCount = 120;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 20;
        velocities[i] = (Math.random() - 0.5) * 0.005;
        velocities[i + 1] = (Math.random() - 0.5) * 0.005;
        velocities[i + 2] = (Math.random() - 0.5) * 0.005;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x00e0d0,
        size: 0.04,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Wireframe geometric shapes
    const shapes = [];
    const shapeMaterial = new THREE.MeshBasicMaterial({
        color: 0x2a3439,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });

    const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), shapeMaterial);
    icosahedron.position.set(-4, 2, -6);
    scene.add(icosahedron);
    shapes.push(icosahedron);

    const octahedron = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), shapeMaterial.clone());
    octahedron.material.color.setHex(0x00e0d0);
    octahedron.material.opacity = 0.08;
    octahedron.position.set(4, -1, -5);
    scene.add(octahedron);
    shapes.push(octahedron);

    const torus = new THREE.Mesh(new THREE.TorusGeometry(1, 0.3, 8, 24), shapeMaterial.clone());
    torus.material.opacity = 0.1;
    torus.position.set(0, -3, -8);
    scene.add(torus);
    shapes.push(torus);

    camera.position.z = 5;

    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
    }, { passive: true });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        requestAnimationFrame(animate);

        // Animate particles
        const posArray = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount * 3; i += 3) {
            posArray[i] += velocities[i];
            posArray[i + 1] += velocities[i + 1];
            posArray[i + 2] += velocities[i + 2];

            // Wrap around
            if (Math.abs(posArray[i]) > 10) velocities[i] *= -1;
            if (Math.abs(posArray[i + 1]) > 10) velocities[i + 1] *= -1;
            if (Math.abs(posArray[i + 2]) > 10) velocities[i + 2] *= -1;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.y += 0.0003;

        // Animate shapes
        shapes.forEach((shape, i) => {
            shape.rotation.x += 0.002 * (i + 1) * 0.5;
            shape.rotation.y += 0.001 * (i + 1) * 0.5;
        });

        // Mouse follow camera
        camera.position.x += (mouseX - camera.position.x) * 0.02;
        camera.position.y += (-mouseY - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    animate();
}

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
        { selector: '.skills-category-title', baseDelay: 50, step: 50 },
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
    initThreeBackground();

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
