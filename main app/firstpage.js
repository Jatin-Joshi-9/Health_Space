// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Three.js scene
    initScene();
    
    // Animate title lines in sequence
    animateTitle();
    
    // Handle scroll events
    setupScrollInteraction();
    
    // Remove preloader when everything is loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.querySelector('.preloader').style.opacity = '0';
            setTimeout(() => {
                document.querySelector('.preloader').style.display = 'none';
                // Start heartbeat audio (muted by default due to autoplay policies)
                const audio = document.getElementById('heartbeat-audio');
                audio.volume = 0.3;
                // Try to play (will only work after user interaction)
                audio.play().catch(e => console.log("Audio play failed:", e));
            }, 500);
        }, 1000);
    });
});

// Three.js Scene Variables
let scene, camera, renderer, heart, composer, bloomPass;
let scrollPosition = 0;
let targetScrollPosition = 0;
let heartBeatScale = 1;
let isScrolling = false;

// Initialize Three.js scene
function initScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    document.getElementById('webgl-container').appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x00ff96, 2, 10);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);
    
    // Create heart geometry
    createHeart();
    
    // Post-processing for bloom effect
    const renderScene = new THREE.RenderPass(scene, camera);
    bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, 0.4, 0.85
    );
    bloomPass.threshold = 0;
    bloomPass.strength = 1.5;
    bloomPass.radius = 0.5;
    
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
}

// Create 3D heart model
function createHeart() {
    // Create a simple heart geometry for demonstration
    // In a real project, you might want to load a more detailed GLTF model
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0.5, 0.5, 1, 0, 1, -0.5);
    heartShape.bezierCurveTo(1, -1, 0, -1.5, 0, -2);
    heartShape.bezierCurveTo(0, -1.5, -1, -1, -1, -0.5);
    heartShape.bezierCurveTo(-1, 0, -0.5, 0.5, 0, 0);
    
    const extrudeSettings = {
        steps: 2,
        depth: 0.5,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 3
    };
    
    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    const material = new THREE.MeshPhongMaterial({
        color: 0xff3366,
        emissive: 0xff0033,
        emissiveIntensity: 0.5,
        specular: 0xffffff,
        shininess: 30,
        transparent: true,
        opacity: 0.9
    });
    
    heart = new THREE.Mesh(geometry, material);
    heart.scale.set(0.8, 0.8, 0.8);
    scene.add(heart);
    
    // Add wireframe for extra detail
    const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    
    const wireHeart = new THREE.Mesh(geometry, wireMaterial);
    wireHeart.scale.set(0.81, 0.81, 0.81);
    heart.add(wireHeart);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Heartbeat animation
    const beat = Math.sin(Date.now() * 0.005) * 0.05 * heartBeatScale;
    heart.scale.x = 0.8 + beat;
    heart.scale.y = 0.8 + beat;
    heart.scale.z = 0.8 + beat;
    
    // Heart rotation
    heart.rotation.y += 0.002;
    
    // Smooth scroll effect
    scrollPosition += (targetScrollPosition - scrollPosition) * 0.1;
    
    // Adjust camera based on scroll
    camera.position.z = 5 - scrollPosition * 2;
    bloomPass.strength = 1.5 + scrollPosition * 0.5;
    
    // Render scene with post-processing
    composer.render();
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// Animate title lines
function animateTitle() {
    const titleLines = document.querySelectorAll('.title-line');
    const underline = document.querySelector('.title-underline');
    
    titleLines.forEach((line, index) => {
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
        }, 500 + index * 300);
    });
    
    setTimeout(() => {
        underline.style.width = '200px';
    }, 500 + titleLines.length * 300);
}

// Setup scroll interaction
function setupScrollInteraction() {
    let lastScrollTime = 0;
    const scrollThreshold = 100;
    const enterContainer = document.querySelector('.enter-container');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    window.addEventListener('wheel', (e) => {
        const now = Date.now();
        
        // Throttle scroll events
        if (now - lastScrollTime < 100) return;
        lastScrollTime = now;
        
        // Update target scroll position (clamped between 0 and 1)
        targetScrollPosition += e.deltaY * -0.001;
        targetScrollPosition = Math.max(0, Math.min(1, targetScrollPosition));
        
        // Adjust heart beat scale based on scroll
        heartBeatScale = 1 + targetScrollPosition * 0.5;
        
        // Show/hide enter button based on scroll
        if (targetScrollPosition > 0.3) {
            enterContainer.style.bottom = '40px';
            scrollIndicator.style.opacity = '0';
            
            // Start pulse animation for button
            document.querySelector('.pulse-circle').style.opacity = '0.7';
        } else {
            enterContainer.style.bottom = '-100px';
            scrollIndicator.style.opacity = '1';
            document.querySelector('.pulse-circle').style.opacity = '0';
        }
        
        // Prevent default scroll if we're not at extremes
        if (targetScrollPosition > 0 && targetScrollPosition < 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Handle touch events for mobile
    let touchStartY = 0;
    
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    window.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        
        // Update target scroll position
        targetScrollPosition += deltaY * -0.01;
        targetScrollPosition = Math.max(0, Math.min(1, targetScrollPosition));
        
        // Adjust heart beat scale
        heartBeatScale = 1 + targetScrollPosition * 0.5;
        
        // Show/hide enter button
        if (targetScrollPosition > 0.3) {
            enterContainer.style.bottom = '40px';
            scrollIndicator.style.opacity = '0';
            document.querySelector('.pulse-circle').style.opacity = '0.7';
        } else {
            enterContainer.style.bottom = '-100px';
            scrollIndicator.style.opacity = '1';
            document.querySelector('.pulse-circle').style.opacity = '0';
        }
        
        touchStartY = touchY;
    }, { passive: true });
}