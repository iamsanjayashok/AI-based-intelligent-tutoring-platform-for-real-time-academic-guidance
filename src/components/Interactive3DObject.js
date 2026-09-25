import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Cinquefoil Star Curve (5-pointed star knot with exact 72-deg rotational symmetry)
class CinquefoilStarCurve extends THREE.Curve {
  constructor(scale = 0.92) {
    super();
    this.scale = scale;
  }
  getPoint(t, optionalTarget = new THREE.Vector3()) {
    const phi = t * Math.PI * 2;
    // 5-pointed star loop with 5 distinct outer star petals and open center
    const R = 2.4;
    const r = 1.15;
    const x = (R + r * Math.cos(5 * phi)) * Math.cos(2 * phi);
    const y = (R + r * Math.cos(5 * phi)) * Math.sin(2 * phi);
    const z = -r * Math.sin(5 * phi) * 0.95;
    return optionalTarget.set(x, y, z).multiplyScalar(this.scale);
  }
}

export default function Interactive3DObject({ className = '' }) {
  const containerRef = useRef(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / (container.clientHeight || 1),
      0.1,
      1000
    );

    // Dynamic camera distance tailored for 1.5x larger star with generous framing
    const fitCameraToViewport = () => {
      const width = container.clientWidth || 400;
      const height = container.clientHeight || 400;
      const aspect = width / height;
      camera.aspect = aspect;

      const fovRad = (camera.fov * Math.PI) / 180;
      const tanHalfVFov = Math.tan(fovRad / 2);
      const tanHalfHFov = aspect * tanHalfVFov;

      // 1.5x scale bounding radius (3.82 * 1.5) with clean 8% viewport padding
      const safeRadius = 3.82 * 1.5 * 1.08;
      const distV = safeRadius / tanHalfVFov;
      const distH = safeRadius / (tanHalfHFov || 0.01);
      const targetDist = Math.max(distV, distH, 16.0);

      camera.position.set(0, 0, targetDist);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };

    fitCameraToViewport();

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // --- Procedural High-Gloss Studio Reflection Environment Map ---
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512;
    envCanvas.height = 256;
    const ctx = envCanvas.getContext('2d');
    if (ctx) {
      // Dark space backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 256);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.5, '#0b1120');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 512, 256);

      // Studio overhead light bank
      const lightGrad1 = ctx.createLinearGradient(0, 25, 0, 105);
      lightGrad1.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      lightGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = lightGrad1;
      ctx.fillRect(50, 15, 240, 90);

      // Electric blue rim reflector
      const lightGrad2 = ctx.createRadialGradient(420, 128, 10, 420, 128, 140);
      lightGrad2.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
      lightGrad2.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = lightGrad2;
      ctx.fillRect(310, 20, 190, 200);

      // Indigo edge fill
      const lightGrad3 = ctx.createRadialGradient(90, 180, 10, 90, 180, 130);
      lightGrad3.addColorStop(0, 'rgba(129, 140, 248, 0.8)');
      lightGrad3.addColorStop(1, 'rgba(129, 140, 248, 0)');
      ctx.fillStyle = lightGrad3;
      ctx.fillRect(10, 100, 170, 150);
    }

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    const envMap = pmremGenerator.fromEquirectangular(envTexture).texture;
    scene.environment = envMap;
    pmremGenerator.dispose();
    envTexture.dispose();

    // --- Geometry: 5-Point Star Loop Scaled 1.5x with Thick Gloss Metallic Profile ---
    const curve = new CinquefoilStarCurve(0.92);
    const geometry = new THREE.TubeGeometry(curve, 360, 0.44, 40, true);

    // --- Material: Gloss Obsidian Chrome ---
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0b1329), // Rich obsidian midnight
      emissive: new THREE.Color(0x030712),
      roughness: 0.11, // High-gloss specular reflections
      metalness: 0.95, // Deep metallic polish
      clearcoat: 1.0, // Lacquered glass finish
      clearcoatRoughness: 0.05,
      reflectivity: 0.98,
    });

    const starMesh = new THREE.Mesh(geometry, material);
    // Increase size 1.5x
    starMesh.scale.set(1.5, 1.5, 1.5);
    scene.add(starMesh);

    // By default: Star faces directly front towards user (XY plane)
    starMesh.rotation.x = 0;
    starMesh.rotation.y = 0;
    starMesh.rotation.z = 0;

    // --- Studio Lighting Setup ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
    keyLight.position.set(5, 7, 7);
    scene.add(keyLight);

    const blueRimLight = new THREE.DirectionalLight(0x38bdf8, 5.5);
    blueRimLight.position.set(8, -2, -4);
    scene.add(blueRimLight);

    const indigoFillLight = new THREE.DirectionalLight(0x818cf8, 3.5);
    indigoFillLight.position.set(-6, 3, 5);
    scene.add(indigoFillLight);

    const bottomLight = new THREE.DirectionalLight(0x60a5fa, 2.2);
    bottomLight.position.set(0, -6, 2);
    scene.add(bottomLight);

    // --- 360 Rotation on Interaction State ---
    let isSpinning360 = false;
    let spinStartTime = 0;
    const spinDuration = 1200; // 1.2s fluid 360 spin
    let spinStartRotY = 0;

    const trigger360Spin = () => {
      isSpinning360 = true;
      spinStartTime = performance.now();
      spinStartRotY = starMesh.rotation.y;
    };

    let clock = new THREE.Clock();

    // Trigger 360 rotation on user interaction (only on desktop/pointer, uninteractable on mobile)
    const handlePointerDown = (e) => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) return;
      if (e && e.pointerType === 'touch') return;
      setIsInteracting(true);
      trigger360Spin();
    };

    const handlePointerUp = () => {
      setIsInteracting(false);
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    // --- Responsive Resize ---
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      fitCameraToViewport();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // --- Animation Loop ---
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // By default: rotating facing front continuously without any user interruption
      starMesh.rotation.z += 0.007;

      // Handle interactive 360 spin
      if (isSpinning360) {
        const elapsed = performance.now() - spinStartTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        // Smooth ease-in-out cubic
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        starMesh.rotation.y = spinStartRotY + ease * (Math.PI * 2);

        if (progress >= 1) {
          isSpinning360 = false;
          starMesh.rotation.y = 0;
        }
      } else {
        // Keep front-facing by gently returning X and Y rotations to 0
        starMesh.rotation.y += (0 - starMesh.rotation.y) * 0.08;
        starMesh.rotation.x += (0 - starMesh.rotation.x) * 0.08;
      }

      // Gentle vertical floating motion
      starMesh.position.y = Math.sin(elapsedTime * 1.5) * 0.16;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-center pointer-events-none md:pointer-events-auto ${className}`}>
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className={`w-full h-full relative select-none pointer-events-none md:pointer-events-auto touch-auto md:touch-none cursor-default md:cursor-pointer transition-transform duration-300 ${
          isInteracting ? 'scale-98' : 'hover:scale-[1.015]'
        }`}
        style={{ minHeight: '440px' }}
        title="Click to spin the 3D star knot 360°"
      >
        {/* Soft Ambient Radial Glow Behind 3D Mesh */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-3xl opacity-50"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.35), rgba(99, 102, 241, 0.22) 50%, transparent 70%)',
          }}
        />
      </div>
    </div>
  );
}
