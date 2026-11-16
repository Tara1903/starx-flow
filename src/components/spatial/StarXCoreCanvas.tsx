"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function StarXCoreCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene, Camera, Renderer
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 700;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020b08, 0.002);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.8, 24);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.appendChild(renderer.domElement);

    // ==========================================
    // 3D OBJECTS & GEOMETRY (Framing behind the showcase)
    // ==========================================
    const masterGroup = new THREE.Group();
    // Positioned deep in background to frame the pedestal without intersecting UI
    masterGroup.position.set(0, 0.2, -8);
    scene.add(masterGroup);

    // 1. Refined Ambient Crystalline Gem (Soft ambient background core)
    const coreGeometry = new THREE.IcosahedronGeometry(1.6, 0);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      emissive: 0x064e3b,
      emissiveIntensity: 0.18,
      roughness: 0.2,
      metalness: 0.3,
      transmission: 0.92,
      ior: 1.5,
      reflectivity: 0.5,
      transparent: true,
      opacity: 0.22,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    masterGroup.add(coreMesh);

    // Core Faint Wireframe Facet
    const wireGeo = new THREE.IcosahedronGeometry(1.61, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x86efac,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    masterGroup.add(wireMesh);

    // 2. Concentric Emerald Architectural Framing Rings
    // Kept hairline thin (tube: 0.018) and angled horizontally to wrap BEHIND the pedestal
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 0.16,
      roughness: 0.35,
      metalness: 0.8,
      transparent: true,
      opacity: 0.2,
    });

    // Primary lower architectural ring wrapping behind the pedestal
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(8.6, 0.018, 16, 120), ringMaterial);
    ring1.rotation.x = Math.PI * 0.44;
    ring1.rotation.y = -Math.PI * 0.12;
    masterGroup.add(ring1);

    // Secondary subtle halo ring framing the upper architectural arch
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(9.8, 0.014, 16, 120), ringMaterial);
    ring2.rotation.x = Math.PI * 0.40;
    ring2.rotation.y = Math.PI * 0.18;
    ring2.rotation.z = Math.PI * 0.08;
    masterGroup.add(ring2);

    // 3. Orbiting Peripheral Micro-Nodes (Simplified & Hidden for Clean Negative Space)
    const nodeGroup = new THREE.Group();
    nodeGroup.visible = false;
    masterGroup.add(nodeGroup);

    const nodeCount = 0;
    const nodeMeshes: THREE.Mesh[] = [];

    // 4. Subtle Ambient Dust Field (Reduced count for tranquil negative space)
    const particleCount = 40;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 55;
      particlePositions[i + 1] = (Math.random() - 0.5) * 40;
      particlePositions[i + 2] = (Math.random() - 0.5) * 40 - 10;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xa7f3d0,
      size: 0.08,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // ==========================================
    // LIGHTING SYSTEM
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0x061e13, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xa7f3d0, 1.5);
    keyLight.position.set(12, 18, 15);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x064e3b, 1.0);
    fillLight.position.set(-15, -10, -10);
    scene.add(fillLight);

    // Subtle pointer light with soft, controlled illumination
    const pointerLight = new THREE.PointLight(0x34d399, 0.75, 30);
    pointerLight.position.set(0, 0, 10);
    scene.add(pointerLight);

    // ==========================================
    // POINTER & RESIZE INTERACTIONS
    // ==========================================
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isVisible = true;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x;
      targetY = y;
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 700;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Pause rendering when scrolled out of view to save battery / GPU
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // ==========================================
    // ANIMATION RENDER LOOP (Tranquil, calm, stable)
    // ==========================================
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth pointer lerp
      currentX += (targetX - currentX) * 0.035;
      currentY += (targetY - currentY) * 0.035;

      // Pointer light tracks cursor in 3D world space
      pointerLight.position.x = currentX * 8;
      pointerLight.position.y = currentY * 5 + 1.2;

      if (!prefersReducedMotion) {
        // Tranquil, subtle ambient rotation that frames the space
        masterGroup.rotation.y = elapsedTime * 0.02 + currentX * 0.15;
        masterGroup.rotation.x = Math.sin(elapsedTime * 0.02) * 0.02 - currentY * 0.1;

        // Slow particle drift
        particleSystem.rotation.y = elapsedTime * 0.008;
      }

      // Calm, stable camera
      camera.position.x = currentX * 0.8;
      camera.position.y = currentY * 0.6 + 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();

      // Dispose Three.js objects
      renderer.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      ringMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (!webGLSupported) {
    return null;
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative pointer-events-none select-none"
      aria-hidden="true"
    />
  );
}
