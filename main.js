// Three.js Scene Setup
let scene, camera, renderer, particleSystem, torusKnot, shards = [];
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
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Animated Torus Knot
    const torusGeometry = new THREE.TorusKnotGeometry(8, 2.5, 100, 16);
    const torusMaterial = new THREE.MeshBasicMaterial({
        color: 0x00d9ff,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    torusKnot = new THREE.Mesh(torusGeometry, torusMaterial);
    torusKnot.position.set(-15, 5, -20);
    scene.add(torusKnot);
    
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
    const shardCount = 15;
    for (let i = 0; i < shardCount; i++) {
        const geometry = new THREE.TetrahedronGeometry(Math.random() * 2 + 0.5);
        const material = new THREE.MeshPhongMaterial({
            color: Math.random() > 0.5 ? 0x7b2cbf : 0xff006e,
            transparent: true,
            opacity: 0.6,
            wireframe: Math.random() > 0.5
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
    const particleCount = 1000;
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
        size: 0.15,
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
    
    // Rotate torus knot
    if (torusKnot) {
        torusKnot.rotation.x += 0.003;
        torusKnot.rotation.y += 0.005;
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
    camera.position.x += (mouseX * 0.05 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.05 - camera.position.y) * 0.05;
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
            duration: 1200,
            easing: 'easeOutExpo'
        })
        .add({
            targets: '.scroll-indicator',
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutQuad'
        }, '-=400');
    
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
                        duration: 800,
                        easing: 'easeOutExpo'
                    });
                }
                
                if (element.classList.contains('skill-card')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        translateY: [30, 0],
                        duration: 600,
                        easing: 'easeOutExpo'
                    });
                }
                
                if (element.classList.contains('project-card')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        scale: [0.9, 1],
                        duration: 600,
                        easing: 'easeOutExpo'
                    });
                }
                
                if (element.classList.contains('about-text')) {
                    anime({
                        targets: element.querySelectorAll('p'),
                        opacity: [0, 1],
                        translateX: [-30, 0],
                        duration: 800,
                        easing: 'easeOutExpo',
                        delay: anime.stagger(200)
                    });
                }
                
                if (element.classList.contains('education-card')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        translateX: [-30, 0],
                        duration: 800,
                        easing: 'easeOutExpo'
                    });
                }
                
                if (element.classList.contains('contact-item')) {
                    anime({
                        targets: element,
                        opacity: [0, 1],
                        translateX: [-30, 0],
                        duration: 600,
                        easing: 'easeOutExpo'
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
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            anime({
                targets: card,
                scale: 1,
                duration: 300,
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
                    duration: 1000,
                    easing: 'easeInOutQuad'
                });
            }
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initAnimations();
    initSmoothScroll();
    
    // Add active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
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
});

  