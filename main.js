// Three.js Scene Setup
let scene, camera, renderer, particleSystem, coreObject, shards = [];
let mouseX = 0, mouseY = 0;
let time = 0;

function initThreeJS() {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0f, 150, 1000);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 35;

    // Renderer
    const canvas = document.getElementById('bg-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const keyLight = new THREE.PointLight(0x00d9ff, 2.5);
    keyLight.position.set(15, 15, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xff006e, 1.8);
    fillLight.position.set(-15, -10, -15);
    scene.add(fillLight);

    const accentLight = new THREE.PointLight(0x6ff3ff, 1.2);
    accentLight.position.set(0, 20, -10);
    scene.add(accentLight);

    // Core object - sphere with dynamic material
    const coreGeometry = new THREE.IcosahedronGeometry(5.5, 4);
    const coreMaterial = new THREE.MeshStandardMaterial({
        color: 0x00d9ff,
        roughness: 0.3,
        metalness: 0.7,
        transparent: true,
        opacity: 0.65,
        emissive: new THREE.Color(0x005580),
        emissiveIntensity: 0.8,
        envMapIntensity: 1
    });
    coreObject = new THREE.Mesh(coreGeometry, coreMaterial);
    coreObject.position.set(-8, 5, -20);
    coreObject.castShadow = true;
    coreObject.receiveShadow = true;
    scene.add(coreObject);

    // Rotating ring around core
    const ringGeometry = new THREE.TorusGeometry(8, 0.25, 16, 120);
    const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0xff006e,
        transparent: true,
        opacity: 0.35,
        emissive: new THREE.Color(0x7a0040),
        emissiveIntensity: 0.7,
        metalness: 0.8,
        roughness: 0.2
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(coreObject.position);
    ring.rotation.x = Math.PI / 2.5;
    ring.rotation.z = Math.PI / 6;
    ring.castShadow = true;
    ring.userData = { rotationX: 0.002, rotationZ: 0.0015 };
    scene.add(ring);
    shards.push(ring);

    // Additional orbital ring
    const orbitGeometry = new THREE.TorusGeometry(12, 0.15, 12, 80);
    const orbitMaterial = new THREE.MeshStandardMaterial({
        color: 0x6ff3ff,
        transparent: true,
        opacity: 0.25,
        emissive: new THREE.Color(0x003366),
        emissiveIntensity: 0.5,
        metalness: 0.6
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.position.copy(coreObject.position);
    orbit.rotation.x = -Math.PI / 3;
    orbit.castShadow = true;
    orbit.userData = { rotationX: -0.0015, rotationY: 0.002 };
    scene.add(orbit);
    shards.push(orbit);

    // Procedural floating crystals
    createCrystals();

    // Particle System
    createParticles();

    // Animation loop
    animate();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
}

function createCrystals() {
    const crystalCount = 10;
    const geometries = [
        new THREE.OctahedronGeometry(0.6),
        new THREE.TetrahedronGeometry(0.7),
        new THREE.DodecahedronGeometry(0.5)
    ];

    for (let i = 0; i < crystalCount; i++) {
        const geometry = geometries[i % geometries.length];
        const hue = Math.random() > 0.5 ? 0.52 : 0.95;
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(hue, 0.9, 0.55),
            transparent: true,
            opacity: 0.7,
            metalness: 0.5,
            roughness: 0.3,
            emissive: new THREE.Color().setHSL(hue, 0.8, 0.3),
            emissiveIntensity: 0.4
        });
        const crystal = new THREE.Mesh(geometry, material);

        const angle = (i / crystalCount) * Math.PI * 2;
        const distance = 20 + Math.random() * 15;
        crystal.position.set(
            Math.cos(angle) * distance,
            (Math.random() - 0.5) * 30,
            Math.sin(angle) * distance - 20
        );

        crystal.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        crystal.castShadow = true;
        crystal.receiveShadow = true;

        crystal.userData = {
            baseX: crystal.position.x,
            baseY: crystal.position.y,
            baseZ: crystal.position.z,
            floatSpeed: 0.8 + Math.random() * 0.6,
            floatAmount: 2 + Math.random() * 2,
            rotationSpeedX: (Math.random() - 0.5) * 0.008,
            rotationSpeedY: (Math.random() - 0.5) * 0.008,
            rotationSpeedZ: (Math.random() - 0.5) * 0.008
        };

        shards.push(crystal);
        scene.add(crystal);
    }
}

function createParticles() {
    const particleCount = 600;
    const particles = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * 120;
        const y = (Math.random() - 0.5) * 120;
        const z = (Math.random() - 0.5) * 100 - 20;
        positions.push(x, y, z);

        const depth = (z + 50) / 70;
        const hue = 0.5 + Math.random() * 0.15;
        const color = new THREE.Color().setHSL(hue, 0.7, 0.5 + depth * 0.2);
        colors.push(color.r, color.g, color.b);

        sizes.push(0.1 + Math.random() * 0.3);
    }

    particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.userData.velocities = [];
    for (let i = 0; i < particleCount; i++) {
        particleSystem.userData.velocities.push({
            x: (Math.random() - 0.5) * 0.08,
            y: (Math.random() - 0.5) * 0.08,
            z: (Math.random() - 0.5) * 0.04
        });
    }
    scene.add(particleSystem);
}

function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    // Rotate core geometry with smooth motion
    if (coreObject) {
        coreObject.rotation.x += 0.0025;
        coreObject.rotation.y += 0.0038;
        coreObject.rotation.z += 0.0012;

        coreObject.position.y = 5 + Math.sin(time * 0.3) * 0.8;
    }

    // Animate shards (rings and crystals)
    shards.forEach((shard, index) => {
        if (shard.userData.rotationX !== undefined) {
            shard.rotation.x += shard.userData.rotationX;
            shard.rotation.y += (shard.userData.rotationY || 0);
            shard.rotation.z += (shard.userData.rotationZ || 0);
        } else if (shard.userData.floatSpeed) {
            shard.rotation.x += shard.userData.rotationSpeedX;
            shard.rotation.y += shard.userData.rotationSpeedY;
            shard.rotation.z += shard.userData.rotationSpeedZ;

            shard.position.x = shard.userData.baseX + Math.sin(time * shard.userData.floatSpeed * 0.5) * shard.userData.floatAmount;
            shard.position.y = shard.userData.baseY + Math.cos(time * shard.userData.floatSpeed * 0.3) * shard.userData.floatAmount * 0.6;
            shard.position.z = shard.userData.baseZ + Math.sin(time * shard.userData.floatSpeed * 0.4) * shard.userData.floatAmount * 0.8;
        }
    });

    // Animate particles with smooth motion
    if (particleSystem) {
        const positions = particleSystem.geometry.attributes.position.array;
        const velocities = particleSystem.userData.velocities;

        for (let i = 0; i < positions.length; i += 3) {
            const vel = velocities[i / 3];
            positions[i] += vel.x;
            positions[i + 1] += vel.y;
            positions[i + 2] += vel.z;

            if (Math.abs(positions[i]) > 60) vel.x *= -1;
            if (Math.abs(positions[i + 1]) > 60) vel.y *= -1;
            if (positions[i + 2] < -50 || positions[i + 2] > 30) vel.z *= -1;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Smooth camera movement based on mouse
    camera.position.x += (mouseX * 0.08 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.08 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
}

// Anime.js Animations
function initAnimations() {
    // Hero intro animation
    anime.timeline()
        .add({
            targets: '.hero-content',
            opacity: [0, 1],
            translateY: [40, 0],
            duration: 600,
            easing: 'easeOutQuad'
        })
        .add({
            targets: '.scroll-indicator',
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutQuad'
        }, '-=250');

    // Scroll-triggered animations
    const observerOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;

                if (element.classList.contains('section-title')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        translateY: [20, 0],
                        duration: 380,
                        easing: 'easeOutQuad'
                    });
                }

                if (element.classList.contains('skill-card')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        translateY: [20, 0],
                        duration: 350,
                        easing: 'easeOutQuad',
                        delay: anime.stagger(80)
                    });
                }

                if (element.classList.contains('project-card')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        scale: [0.95, 1],
                        duration: 350,
                        easing: 'easeOutQuad',
                        delay: anime.stagger(100)
                    });
                }

                if (element.classList.contains('about-text')) {
                    anime({
                        targets: element.querySelectorAll('p'),
                        opacity: [0, 1],
                        translateX: [-20, 0],
                        duration: 380,
                        easing: 'easeOutQuad',
                        delay: anime.stagger(100)
                    });
                }

                if (element.classList.contains('education-card')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        translateX: [-20, 0],
                        duration: 380,
                        easing: 'easeOutQuad'
                    });
                }

                if (element.classList.contains('contact-item')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        translateX: [-20, 0],
                        duration: 350,
                        easing: 'easeOutQuad',
                        delay: anime.stagger(80)
                    });
                }

                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.section-title').forEach(el => observer.observe(el));
    document.querySelectorAll('.skill-card').forEach(el => observer.observe(el));
    document.querySelectorAll('.project-card').forEach(el => observer.observe(el));
    document.querySelectorAll('.about-text').forEach(el => observer.observe(el));
    document.querySelectorAll('.education-card').forEach(el => observer.observe(el));
    document.querySelectorAll('.contact-item').forEach(el => observer.observe(el));
    
    // Hover animations for project cards
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            anime({
                targets: card,
                scale: 1.02,
                duration: 180,
                easing: 'easeOutQuad'
            });
        });

        card.addEventListener('mouseleave', () => {
            anime({
                targets: card,
                scale: 1,
                duration: 180,
                easing: 'easeOutQuad'
            });
        });
    });

    // Hover animations for skill cards
    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            anime({
                targets: card,
                translateY: -8,
                duration: 150,
                easing: 'easeOutQuad'
            });
        });

        card.addEventListener('mouseleave', () => {
            anime({
                targets: card,
                translateY: 0,
                duration: 150,
                easing: 'easeOutQuad'
            });
        });
    });
}

// Smooth scrolling for navigation
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const targetPosition = target.offsetTop - 80;
                anime({
                    targets: [document.documentElement, document.body],
                    scrollTop: targetPosition,
                    duration: 650,
                    easing: 'easeInOutQuad'
                });
            }
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE !== 'undefined') {
        initThreeJS();
    }

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const startExperience = () => {
        document.body.classList.remove('is-loading');
        document.body.classList.add('loaded');
        if (typeof anime !== 'undefined') {
            initAnimations();
            initSmoothScroll();
        }

        // Add active nav link on scroll
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (scrollY >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.style.color = '';
                if (link.getAttribute('href') === `#${current}`) {
                    link.style.color = 'var(--primary)';
                }
            });
        });
    };

    setTimeout(startExperience, 350);
});

  
