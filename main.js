// Three.js Scene Setup
let scene, camera, renderer, particleSystem, torusKnot, haloRing, shards = [];
let mouseX = 0, mouseY = 0;

function initThreeJS() {
    // Scene
    scene = new THREE.Scene();
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30;
    
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
    
    // Animated Core Geometry
    const coreGeometry = new THREE.IcosahedronGeometry(6.2, 2);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x00d9ff,
        roughness: 0.2,
        metalness: 0.6,
        transparent: true,
        opacity: 0.7,
        emissive: new THREE.Color(0x0a5160),
        emissiveIntensity: 0.5,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2
    });
    torusKnot = new THREE.Mesh(coreGeometry, coreMaterial);
    torusKnot.position.set(-10, 6, -18);
    scene.add(torusKnot);

    const haloGeometry = new THREE.TorusGeometry(10.5, 0.35, 18, 140);
    const haloMaterial = new THREE.MeshStandardMaterial({
        color: 0xff006e,
        transparent: true,
        opacity: 0.45,
        wireframe: true,
        emissive: new THREE.Color(0x5c0030),
        emissiveIntensity: 0.6
    });
    haloRing = new THREE.Mesh(haloGeometry, haloMaterial);
    haloRing.position.copy(torusKnot.position);
    haloRing.rotation.x = Math.PI / 2;
    scene.add(haloRing);
    
    // Procedural Shards
    createShards();
    
    // Particle System
    createParticles();
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00d9ff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    
    // Animation loop
    animate();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
}

function createShards() {
    const shardCount = 14;
    for (let i = 0; i < shardCount; i++) {
        const geometry = new THREE.TetrahedronGeometry(Math.random() * 2 + 0.5);
        const material = new THREE.MeshPhongMaterial({
            color: Math.random() > 0.5 ? 0x7b2cbf : 0xff006e,
            transparent: true,
            opacity: 0.55,
            wireframe: Math.random() > 0.65
        });
        const shard = new THREE.Mesh(geometry, material);
        
        shard.position.set(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 40 - 10
        );
        
        shard.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        shard.userData = {
            speedX: Math.max(0.001, Math.abs(Math.random() - 0.5) * 0.005) * (Math.random() > 0.5 ? 1 : -1),
            speedY: Math.max(0.001, Math.abs(Math.random() - 0.5) * 0.005) * (Math.random() > 0.5 ? 1 : -1),
            speedZ: Math.max(0.001, Math.abs(Math.random() - 0.5) * 0.005) * (Math.random() > 0.5 ? 1 : -1),
            rotationSpeed: Math.max(0.005, Math.abs(Math.random() - 0.5) * 0.02) * (Math.random() > 0.5 ? 1 : -1)
        };
        
        shards.push(shard);
        scene.add(shard);
    }
}

function createParticles() {
    const particleCount = 820;
    const particles = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    
    for (let i = 0; i < particleCount; i++) {
        positions.push(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100
        );
        
        const color = new THREE.Color();
        color.setHSL(Math.random() * 0.3 + 0.5, 0.8, 0.5);
        colors.push(color.r, color.g, color.b);
    }
    
    particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Rotate core geometry
    if (torusKnot) {
        torusKnot.rotation.x += 0.0035;
        torusKnot.rotation.y += 0.0055;
    }

    if (haloRing) {
        haloRing.rotation.z += 0.0035;
        haloRing.rotation.y += 0.0025;
    }
    
    // Animate shards
    shards.forEach(shard => {
        shard.rotation.x += shard.userData.rotationSpeed;
        shard.rotation.y += shard.userData.rotationSpeed;
        
        shard.position.x += shard.userData.speedX;
        shard.position.y += shard.userData.speedY;
        shard.position.z += shard.userData.speedZ;
        
        // Boundary check
        if (Math.abs(shard.position.x) > 40) shard.userData.speedX *= -1;
        if (Math.abs(shard.position.y) > 40) shard.userData.speedY *= -1;
        if (Math.abs(shard.position.z) > 30) shard.userData.speedZ *= -1;
    });
    
    // Rotate particle system
    if (particleSystem) {
        particleSystem.rotation.y += 0.0005;
    }
    
    // Camera movement based on mouse
    camera.position.x += (mouseX * 0.06 - camera.position.x) * 0.06;
    camera.position.y += (-mouseY * 0.06 - camera.position.y) * 0.06;
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
            translateY: [50, 0],
            duration: 800,
            easing: 'easeOutCubic'
        })
        .add({
            targets: '.scroll-indicator',
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutQuad'
        }, '-=300');
    
    // Scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                if (element.classList.contains('section-title')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        translateY: [30, 0],
                    duration: 500,
                    easing: 'easeOutCubic'
                });
                }
                
                if (element.classList.contains('skill-card')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        translateY: [30, 0],
                    duration: 450,
                    easing: 'easeOutCubic'
                });
                }
                
                if (element.classList.contains('project-card')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        scale: [0.9, 1],
                    duration: 450,
                    easing: 'easeOutCubic'
                });
                }
                
                if (element.classList.contains('about-text')) {
                    anime({
                        targets: element.querySelectorAll('p'),
                        opacity: [0, 1],
                        translateX: [-30, 0],
                    duration: 500,
                    easing: 'easeOutCubic',
                    delay: anime.stagger(120)
                });
                }
                
                if (element.classList.contains('education-card')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        translateX: [-30, 0],
                    duration: 500,
                    easing: 'easeOutCubic'
                });
                }
                
                if (element.classList.contains('contact-item')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        translateX: [-30, 0],
                    duration: 450,
                    easing: 'easeOutCubic'
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
            duration: 220,
            easing: 'easeOutQuad'
        });
        });
        
        card.addEventListener('mouseleave', () => {
            anime({
                targets: card,
                scale: 1,
            duration: 220,
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

  
