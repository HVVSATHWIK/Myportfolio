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

    // Neural network nodes
    const nodeCount = 80;
    const nodeBoundary = 12;
    const nodesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(nodeCount * 3);
    const velocities = new Float32Array(nodeCount * 3);

    for (let i = 0; i < nodeCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 24;
        positions[i + 1] = (Math.random() - 0.5) * 24;
        positions[i + 2] = (Math.random() - 0.5) * 16;
        velocities[i] = (Math.random() - 0.5) * 0.004;
        velocities[i + 1] = (Math.random() - 0.5) * 0.004;
        velocities[i + 2] = (Math.random() - 0.5) * 0.002;
    }

    nodesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const nodesMaterial = new THREE.PointsMaterial({
        color: 0x00e0d0,
        size: 0.06,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });
    const nodes = new THREE.Points(nodesGeometry, nodesMaterial);
    scene.add(nodes);

    // Lines connecting nearby nodes (neural network edges)
    const maxConnections = nodeCount * 6;
    const linePositions = new Float32Array(maxConnections * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00e0d0,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Floating geometric shapes (subtle, professional)
    const shapes = [];
    const shapeMaterial = new THREE.MeshBasicMaterial({
        color: 0x2a3439,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });

    const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(2, 1), shapeMaterial);
    icosahedron.position.set(-5, 3, -8);
    scene.add(icosahedron);
    shapes.push(icosahedron);

    const dodecahedron = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 0), shapeMaterial.clone());
    dodecahedron.material.color.setHex(0x00e0d0);
    dodecahedron.material.opacity = 0.05;
    dodecahedron.position.set(5, -2, -7);
    scene.add(dodecahedron);
    shapes.push(dodecahedron);

    const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.2, 0.3, 64, 8), shapeMaterial.clone());
    torusKnot.material.opacity = 0.06;
    torusKnot.material.color.setHex(0x5a6a7a);
    torusKnot.position.set(0, -4, -10);
    scene.add(torusKnot);
    shapes.push(torusKnot);

    camera.position.z = 8;

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

    const connectionDistance = 4.5;

    function animate() {
        requestAnimationFrame(animate);

        // Animate nodes
        const posArray = nodes.geometry.attributes.position.array;
        for (let i = 0; i < nodeCount * 3; i += 3) {
            posArray[i] += velocities[i];
            posArray[i + 1] += velocities[i + 1];
            posArray[i + 2] += velocities[i + 2];

            if (Math.abs(posArray[i]) > nodeBoundary) velocities[i] *= -1;
            if (Math.abs(posArray[i + 1]) > nodeBoundary) velocities[i + 1] *= -1;
            if (Math.abs(posArray[i + 2]) > nodeBoundary) velocities[i + 2] *= -1;
        }
        nodes.geometry.attributes.position.needsUpdate = true;
        nodes.rotation.y += 0.0002;

        // Update connection lines between nearby nodes
        let lineIndex = 0;
        const lp = lines.geometry.attributes.position.array;
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                if (lineIndex >= maxConnections * 6) break;
                const dx = posArray[i * 3] - posArray[j * 3];
                const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
                const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (dist < connectionDistance) {
                    lp[lineIndex++] = posArray[i * 3];
                    lp[lineIndex++] = posArray[i * 3 + 1];
                    lp[lineIndex++] = posArray[i * 3 + 2];
                    lp[lineIndex++] = posArray[j * 3];
                    lp[lineIndex++] = posArray[j * 3 + 1];
                    lp[lineIndex++] = posArray[j * 3 + 2];
                }
            }
        }
        // Zero out unused line positions
        for (let i = lineIndex; i < maxConnections * 6; i++) {
            lp[i] = 0;
        }
        lines.geometry.attributes.position.needsUpdate = true;
        lines.geometry.setDrawRange(0, lineIndex / 3);

        // Animate shapes
        shapes.forEach((shape, i) => {
            shape.rotation.x += 0.001 * (i + 1) * 0.5;
            shape.rotation.y += 0.0008 * (i + 1) * 0.5;
        });

        // Mouse follow camera
        camera.position.x += (mouseX * 2 - camera.position.x) * 0.015;
        camera.position.y += (-mouseY * 2 - camera.position.y) * 0.015;
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
