import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = null;  // Make scene background transparent
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true  // Enable transparency
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // Set clear color to fully transparent
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Camera position
camera.position.z = 30;

// DNA parameters
const dnaParams = {
    turns: 6,
    basePairsPerTurn: 10,
    radius: 6,
    ribbonWidth: 2.0,
    ribbonThickness: 0.1,
    basePairWidth: 0.4,    // Increased from 0.15 to 0.4 for thicker cylinders
    basePairHeight: 0.1,
    basePairLength: 6.0,    // Increased from 4.0 to 6.0 to match the radius
    height: 100,  // Increased from 80 to 100 for an even more stretched appearance
    helixOffset: Math.PI
};

// Colors for base pairs
const baseColors = {
    A: 0xff3333, // Red for Adenine
    T: 0x33ff33, // Green for Thymine
    C: 0x3333ff, // Blue for Cytosine
    G: 0xffaa00  // Orange-yellow for Guanine
};

// Base pair sequence
const sequence = [];
const bases = ['A', 'T', 'C', 'G'];
const totalBasePairs = dnaParams.turns * dnaParams.basePairsPerTurn;

for (let i = 0; i < totalBasePairs; i++) {
    const randomBase = bases[Math.floor(Math.random() * 4)];
    sequence.push(randomBase);
}

// Create DNA structure
function createDNA() {
    const dnaGroup = new THREE.Group();
    
    // Create ribbon backbones
    function createRibbonGeometry(isSecondStrand = false) {
        const vertices = [];
        const indices = [];
        const segments = totalBasePairs * 8;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            // Negative angle for left-handed helix, but keep the offset
            const angle = -t * Math.PI * 2 * dnaParams.turns + (isSecondStrand ? dnaParams.helixOffset : 0);
            const y = t * dnaParams.height - dnaParams.height / 2;
            
            // Calculate ribbon position and normal
            const centerX = Math.cos(angle) * dnaParams.radius;
            const centerZ = Math.sin(angle) * dnaParams.radius;
            
            // Calculate ribbon normal vector (tangent to the helix)
            const normalX = Math.sin(angle);  // Changed sign for left-handed
            const normalZ = -Math.cos(angle); // Changed sign for left-handed
            
            // Create vertices for ribbon width
            vertices.push(
                // Left edge
                centerX - normalX * dnaParams.ribbonWidth * 0.5,
                y,
                centerZ - normalZ * dnaParams.ribbonWidth * 0.5,
                // Right edge
                centerX + normalX * dnaParams.ribbonWidth * 0.5,
                y,
                centerZ + normalZ * dnaParams.ribbonWidth * 0.5
            );
            
            if (i < segments) {
                const baseIndex = i * 2;
                indices.push(
                    baseIndex, baseIndex + 1, baseIndex + 2,
                    baseIndex + 1, baseIndex + 3, baseIndex + 2
                );
            }
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        return geometry;
    }
    
    // Create the two backbone ribbons
    const ribbonMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xdddddd,  // Silver/gray color
        shininess: 100,   // High shininess for metallic look
        specular: 0xffffff,  // White specular highlights
        side: THREE.DoubleSide
    });
    
    const ribbon1 = new THREE.Mesh(createRibbonGeometry(false), ribbonMaterial);
    const ribbon2 = new THREE.Mesh(createRibbonGeometry(true), ribbonMaterial);
    
    dnaGroup.add(ribbon1);
    dnaGroup.add(ribbon2);

    // Create base pairs as cylinders
    const basePairGeometry = new THREE.CylinderGeometry(
        dnaParams.basePairWidth/2,  // radiusTop
        dnaParams.basePairWidth/2,  // radiusBottom
        dnaParams.basePairLength,   // height
        24,                         // increased radialSegments for smoother appearance
        1,                          // heightSegments
        false                       // openEnded
    );
    
    // Rotate the geometry 90 degrees to align with original orientation
    basePairGeometry.rotateZ(Math.PI / 2);
    
    for (let i = 0; i < totalBasePairs; i++) {
        const t = i / totalBasePairs;
        const angle = t * Math.PI * 2 * dnaParams.turns;
        const y = t * dnaParams.height - dnaParams.height / 2;
        
        const base = sequence[i];
        // Determine the complementary base
        const complementaryBase = base === 'A' ? 'T' : base === 'T' ? 'A' : base === 'C' ? 'G' : 'C';
        
        // Create first base of the pair
        const baseMaterial1 = new THREE.MeshPhongMaterial({ 
            color: baseColors[base],
            shininess: 30,
            specular: 0x222222,
            emissive: baseColors[base],
            emissiveIntensity: 0.2
        });
        
        // Create second base of the pair
        const baseMaterial2 = new THREE.MeshPhongMaterial({ 
            color: baseColors[complementaryBase],
            shininess: 30,
            specular: 0x222222,
            emissive: baseColors[complementaryBase],
            emissiveIntensity: 0.2
        });
        
        // Create both bases
        const base1 = new THREE.Mesh(basePairGeometry, baseMaterial1);
        const base2 = new THREE.Mesh(basePairGeometry, baseMaterial2);
        
        // Position the bases to form a pair, connecting to the ribbons
        const baseOffset = dnaParams.basePairLength / 2;
        base1.position.set(-baseOffset, y, 0);
        base2.position.set(baseOffset, y, 0);
        
        // Rotate the base pair group
        const basePairGroup = new THREE.Group();
        basePairGroup.add(base1);
        basePairGroup.add(base2);
        basePairGroup.rotation.y = angle;
        
        // Add user data for interaction
        base1.userData = { type: base };
        base2.userData = { type: complementaryBase };
        
        dnaGroup.add(basePairGroup);
    }
    
    return dnaGroup;
}

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const light1 = new THREE.DirectionalLight(0xffffff, 1);
light1.position.set(1, 1, 1);
scene.add(light1);

const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
light2.position.set(-1, -1, -1);
scene.add(light2);

// Add DNA to scene
const dna = createDNA();
scene.add(dna);

// Message handler for parent page communication
window.addEventListener('message', function(event) {
    // Verify the origin of the message for security
    // Replace 'YOUR_PARENT_DOMAIN' with your actual parent page domain
    // if (event.origin !== 'YOUR_PARENT_DOMAIN') return;

    if (event.data.type === 'hover') {
        const baseType = event.data.base;
        if (baseType) {
            // Find and highlight all bases of the specified type
            const basesOfType = findBasesOfType(baseType);
            basesOfType.forEach(base => {
                // Reset any existing animation for this base
                if (highlightStartTimes.has(base)) {
                    highlightStartTimes.delete(base);
                }
                animateHighlight(base, performance.now());
            });
        }
    }
});

// Animation state for highlighting
const highlightStartTimes = new Map();
const highlightDuration = 2000; // Total duration in milliseconds
const fadeInDuration = 500;     // Duration for fade in
const fadeOutDuration = 500;    // Duration for fade out
const maxIntensity = 0.8;       // Maximum emissive intensity

// Smooth highlight animation function
function animateHighlight(object, currentTime) {
    if (!highlightStartTimes.has(object)) {
        highlightStartTimes.set(object, currentTime);
    }
    const startTime = highlightStartTimes.get(object);
    const elapsed = currentTime - startTime;
    
    if (elapsed < fadeInDuration) {
        // Fade in
        const intensity = (elapsed / fadeInDuration) * maxIntensity;
        object.material.emissiveIntensity = intensity;
        requestAnimationFrame((time) => animateHighlight(object, time));
    } else if (elapsed < highlightDuration - fadeOutDuration) {
        // Stay bright
        object.material.emissiveIntensity = maxIntensity;
        requestAnimationFrame((time) => animateHighlight(object, time));
    } else if (elapsed < highlightDuration) {
        // Fade out
        const fadeOutProgress = (elapsed - (highlightDuration - fadeOutDuration)) / fadeOutDuration;
        const intensity = (1 - fadeOutProgress) * maxIntensity;
        object.material.emissiveIntensity = intensity;
        requestAnimationFrame((time) => animateHighlight(object, time));
    } else {
        // Reset and stop animation
        object.material.emissiveIntensity = 0;
        highlightStartTimes.delete(object);
    }
}

// Function to find all bases of a specific type
function findBasesOfType(baseType) {
    const bases = [];
    dna.traverse((child) => {
        if (child.userData.type === baseType) {
            bases.push(child);
        }
    });
    return bases;
}

// Raycaster for interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Click handler
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(dna.children);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.type) {
            const baseType = object.userData.type;
            const info = document.getElementById('info');
            info.textContent = `Selected base: ${baseType} - ${getBaseName(baseType)}`;
            
            // Find and highlight all bases of the same type
            const basesOfType = findBasesOfType(baseType);
            basesOfType.forEach(base => {
                // Reset any existing animation for this base
                if (highlightStartTimes.has(base)) {
                    highlightStartTimes.delete(base);
                }
                animateHighlight(base, performance.now());
            });
        }
    }
}

function getBaseName(base) {
    switch(base) {
        case 'A': return 'Adenine';
        case 'T': return 'Thymine';
        case 'C': return 'Cytosine';
        case 'G': return 'Guanine';
        default: return '';
    }
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Event listeners
window.addEventListener('click', onMouseClick);
window.addEventListener('resize', onWindowResize);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    dna.rotation.y += 0.001; // Slow rotation for better visualization
    renderer.render(scene, camera);
}

animate();

// Add button click handler
document.getElementById('viewToggle').addEventListener('click', function() {
    const button = this;
    if (button.textContent === 'Helix Mode') {
        button.textContent = 'Ladder Mode';
    } else {
        button.textContent = 'Helix Mode';
    }
}); 