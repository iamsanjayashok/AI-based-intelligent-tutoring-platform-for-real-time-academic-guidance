import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Rotate3d } from 'lucide-react';

export default function Interactive3DObject({ className = '' }) {
  const containerRef = useRef(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 11);

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

    // --- Procedural Studio Reflection Cube Map for Metallic Highlights ---
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Create a subtle high-contrast studio environment canvas
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512;
    envCanvas.height = 256;
    const ctx = envCanvas.getContext('2d');
    if (ctx) {
      // Dark gradient backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 256);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 512, 256);

      // Studio overhead light bank
      const lightGrad1 = ctx.createLinearGradient(0, 30, 0, 110);
      lightGrad1.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      lightGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = lightGrad1;
      ctx.fillRect(60, 20, 220, 80);

      // Side cool blue accent reflector
      const lightGrad2 = ctx.createRadialGradient(420, 128, 10, 420, 128, 130);
      lightGrad2.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
      lightGrad2.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = lightGrad2;
      ctx.fillRect(320, 30, 180, 190);

      // Violet rim fill
      const lightGrad3 = ctx.createRadialGradient(90, 180, 10, 90, 180, 120);
      lightGrad3.addColorStop(0, 'rgba(129, 140, 248, 0.7)');
      lightGrad3.addColorStop(1, 'rgba(129, 140, 248, 0)');
      ctx.fillStyle = lightGrad3;
      ctx.fillRect(10, 110, 160, 140);
    }

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    const envMap = pmremGenerator.fromEquirectangular(envTexture).texture;
    scene.environment = envMap;
    pmremGenerator.dispose();
    envTexture.dispose();

    // --- 5-Petal Star Torus Knot Geometry (Matching Image 2) ---
    // p = 5, q = 2 creates the iconic 5-lobed cinquefoil star knot
    const geometry = new THREE.TorusKnotGeometry(2.7, 0.82, 280, 48, 5, 2);

    // --- Obsidian Chrome Metallic Material with Gloss Clearcoat ---
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0a0f1d), // Deep obsidian
      emissive: new THREE.Color(0x030712),
      roughness: 0.12, // Crisp glossy reflections
      metalness: 0.92, // High-polish metallic look
      clearcoat: 1.0, // Protective lacquer / automotive clearcoat
      clearcoatRoughness: 0.08,
      reflectivity: 0.98,
    });

    const torusMesh = new THREE.Mesh(geometry, material);
    scene.add(torusMesh);

    // Initial slight dynamic orientation
    torusMesh.rotation.x = 0.45;
    torusMesh.rotation.y = 0.65;

    // --- Studio Lighting Setup ---
    // 1. Ambient soft light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    // 2. Main Key Light (Crisp White Highlights)
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(5, 7, 7);
    scene.add(keyLight);

    // 3. Electric Blue Rim Light (Right & Behind)
    const blueRimLight = new THREE.DirectionalLight(0x38bdf8, 4.5);
    blueRimLight.position.set(8, -2, -4);
    scene.add(blueRimLight);

    // 4. Soft Indigo Fill Light (Left & Front)
    const indigoFillLight = new THREE.DirectionalLight(0x818cf8, 2.8);
    indigoFillLight.position.set(-6, 3, 5);
    scene.add(indigoFillLight);

    // 5. Bottom Upward Light (Accentuates bottom curves)
    const bottomLight = new THREE.DirectionalLight(0x60a5fa, 1.6);
    bottomLight.position.set(0, -6, 2);
    scene.add(bottomLight);

    // --- Interaction & Motion State ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = torusMesh.rotation.x;
    let targetRotY = torusMesh.rotation.y;
    let isUserDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let clock = new THREE.Clock();

    // Mouse tracking for hover tilt
    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isUserDragging) {
        const deltaX = e.clientX - previousPointerX;
        const deltaY = e.clientY - previousPointerY;
        previousPointerX = e.clientX;
        previousPointerY = e.clientY;

        velocityX = deltaX * 0.009;
        velocityY = deltaY * 0.009;

        targetRotY += velocityX;
        targetRotX += velocityY;
      } else {
        mouseX = normX;
        mouseY = normY;
      }
    };

    const handlePointerDown = (e) => {
      isUserDragging = true;
      setIsDragging(true);
      setHasInteracted(true);
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
      velocityX = 0;
      velocityY = 0;
    };

    const handlePointerUp = () => {
      isUserDragging = false;
      setIsDragging(false);
    };

    const handlePointerLeave = () => {
      isUserDragging = false;
      setIsDragging(false);
      mouseX = 0;
      mouseY = 0;
    };

    // Attach listeners
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointerleave', handlePointerLeave);

    // --- Responsive Resize ---
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // --- Animation Loop ---
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Inertia decay after dragging
      if (!isUserDragging) {
        velocityX *= 0.93;
        velocityY *= 0.93;
        targetRotY += velocityX;
        targetRotX += velocityY;

        // Autonomous organic idle rotation and floating
        targetRotY += 0.004;
        targetRotX += 0.0018;

        // Subtle hover tilt contribution
        targetRotY += mouseX * 0.006;
        targetRotX -= mouseY * 0.006;
      }

      // Smooth damping (lerp) towards target orientation
      torusMesh.rotation.y += (targetRotY - torusMesh.rotation.y) * 0.08;
      torusMesh.rotation.x += (targetRotX - torusMesh.rotation.x) * 0.08;

      // Soft sinusoidal floating along Y-axis
      torusMesh.position.y = Math.sin(elapsedTime * 1.8) * 0.16;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointerleave', handlePointerLeave);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative select-none touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
      style={{ minHeight: '360px' }}
      title="Click and drag to rotate in 3D"
    >
      {/* Subtle Drag & Rotate Interaction Prompt */}
      {!hasInteracted && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-medium tracking-wide shadow-lg transition-opacity duration-300">
          <Rotate3d size={13} className="text-blue-400 animate-spin-slow" />
          <span>Drag to rotate 3D</span>
        </div>
      )}

      {/* Soft Ambient Radial Glow Behind 3D Mesh */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-3xl opacity-35"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.25), rgba(99, 102, 241, 0.15) 50%, transparent 70%)',
        }}
      />
    </div>
  );
}
