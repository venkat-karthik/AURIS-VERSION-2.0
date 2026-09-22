import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Mic, Radio, Volume2, ShieldCheck, Activity } from 'lucide-react';

interface Interactive3DStudioMicProps {
  className?: string;
  size?: number;
  onVoiceTest?: () => void;
}

export const Interactive3DStudioMic: React.FC<Interactive3DStudioMicProps> = ({
  className = '',
  size = 360,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isOnAir, setIsOnAir] = useState(false);
  const isOnAirRef = useRef(isOnAir);

  useEffect(() => {
    isOnAirRef.current = isOnAir;
  }, [isOnAir]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || size;
    const height = size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 18, 55);
    camera.lookAt(0, 8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const micGroup = new THREE.Group();
    scene.add(micGroup);

    // 1. Heavy Weighted Desk Base
    const baseGeo = new THREE.CylinderGeometry(14, 15, 3, 32);
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x141f33,
      metalness: 0.9,
      roughness: 0.2,
    });
    const baseMesh = new THREE.Mesh(baseGeo, darkMetalMat);
    baseMesh.position.y = -6;
    micGroup.add(baseMesh);

    // Glowing base ring
    const baseRingGeo = new THREE.TorusGeometry(14.2, 0.4, 16, 64);
    const baseRingMat = new THREE.MeshBasicMaterial({ color: 0x2189c8 });
    const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = -4.5;
    micGroup.add(baseRing);

    // 2. Articulated Stem
    const stemGeo = new THREE.CylinderGeometry(1.4, 1.4, 14, 24);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x243552, metalness: 0.85 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 2;
    micGroup.add(stem);

    // 3. Shock Mount Outer Ring
    const shockRingGeo = new THREE.TorusGeometry(7.5, 0.6, 16, 48);
    const shockRingMat = new THREE.MeshStandardMaterial({ color: 0x1a2942, metalness: 0.9 });
    const shockRing = new THREE.Mesh(shockRingGeo, shockRingMat);
    shockRing.position.set(0, 14, 0);
    micGroup.add(shockRing);

    // Shock Mount Inner Ring
    const innerRingGeo = new THREE.TorusGeometry(5.2, 0.4, 16, 48);
    const innerRing = new THREE.Mesh(innerRingGeo, shockRingMat);
    innerRing.position.set(0, 14, 0);
    micGroup.add(innerRing);

    // Shock suspension elastic bands
    const bandMat = new THREE.LineBasicMaterial({ color: 0x55b9e8 });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const pts = [
        new THREE.Vector3(Math.cos(angle) * 7.5, 14, Math.sin(angle) * 7.5),
        new THREE.Vector3(Math.cos(angle + 0.3) * 5.2, 14, Math.sin(angle + 0.3) * 5.2),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(lineGeo, bandMat);
      micGroup.add(line);
    }

    // 4. Large Diaphragm Studio Condenser Body
    const bodyGeo = new THREE.CylinderGeometry(3.6, 3.6, 10, 32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0c1524,
      metalness: 0.95,
      roughness: 0.15,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 13, 0);
    micGroup.add(bodyMesh);

    // 5. Metallic Mesh Grille Capsule (Upper half)
    const grilleGeo = new THREE.SphereGeometry(3.7, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const grilleMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      wireframe: true,
      metalness: 0.9,
    });
    const grilleMesh = new THREE.Mesh(grilleGeo, grilleMat);
    grilleMesh.position.set(0, 18, 0);
    micGroup.add(grilleMesh);

    // Inner gold diaphragm capsule
    const goldCapGeo = new THREE.CylinderGeometry(1.8, 1.8, 3.5, 24);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const goldCap = new THREE.Mesh(goldCapGeo, goldMat);
    goldCap.position.set(0, 18.5, 0);
    micGroup.add(goldCap);

    // 6. "ON AIR / AI ACTIVE" Broadcast LED Collar
    const onAirGeo = new THREE.CylinderGeometry(3.65, 3.65, 1.2, 32);
    const onAirMat = new THREE.MeshBasicMaterial({
      color: 0x38a85b,
      transparent: true,
      opacity: 0.9,
    });
    const onAirCollar = new THREE.Mesh(onAirGeo, onAirMat);
    onAirCollar.position.set(0, 17.5, 0);
    micGroup.add(onAirCollar);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(30, 40, 50);
    scene.add(dirLight);

    const haloLight = new THREE.PointLight(0x38a85b, 2.5, 40);
    haloLight.position.set(0, 18, 5);
    scene.add(haloLight);

    // INTERACTIVE DRAG TO ROTATE
    let isDragging = false;
    let prevMouseX = 0;
    let rotY = 0.3;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      prevMouseX = e.clientX;
      rotY += dx * 0.01;
      micGroup.rotation.y = rotY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // RESIZE
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        if (newW > 0) {
          camera.aspect = newW / height;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, height);
        }
      }
    });
    resizeObserver.observe(container);

    // ANIMATION
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (!isDragging) {
        micGroup.rotation.y = Math.sin(time * 0.8) * 0.35 + 0.2;
      }

      if (isOnAirRef.current) {
        const pulse = Math.sin(time * 12) * 0.5 + 0.5;
        onAirMat.color.setHex(0xef4444); // Red ON AIR
        haloLight.color.setHex(0xef4444);
        haloLight.intensity = 2.0 + pulse * 2.0;
        baseRingMat.color.setHex(0xef4444);
      } else {
        onAirMat.color.setHex(0x38a85b); // Green READY
        haloLight.color.setHex(0x38a85b);
        haloLight.intensity = 1.4;
        baseRingMat.color.setHex(0x2189c8);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [size]);

  return (
    <div
      id="3d-studio-mic-component"
      className={`relative w-full rounded-3xl overflow-hidden border-2 border-[#000000] dark:border-[#2A3B5C] bg-gradient-to-b from-[#0F1B30] via-[#0D182B] to-[#070D18] text-white shadow-xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#38A85B]/20 border border-[#38A85B]/30 flex items-center justify-center text-[#38A85B]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">Broadcast Condenser Model V-9</h4>
            <p className="text-[11px] text-[#94A3B8]">
              48kHz Full-Duplex Noise-Suppression Array
            </p>
          </div>
        </div>

        <span
          className={`text-xs font-black px-2.5 py-1 rounded-full border ${
            isOnAir
              ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
          }`}
        >
          {isOnAir ? 'ON AIR • RECORDING' : 'READY • HIGH FIDELITY'}
        </span>
      </div>

      <div
        ref={mountRef}
        className="w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ height: `${size}px` }}
      />

      <div className="mt-2 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
        <button
          onClick={() => setIsOnAir(!isOnAir)}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            isOnAir
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-[#2189C8] hover:bg-[#1a73aa] text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>{isOnAir ? 'Stop On-Air Test' : 'Test AI Studio Mic'}</span>
        </button>

        <span className="text-[11px] text-[#94A3B8]">Drag horizontally to spin 3D mic</span>
      </div>
    </div>
  );
};
