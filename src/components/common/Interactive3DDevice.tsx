import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Phone, PhoneOff, Mic, MicOff, Volume2, ShieldCheck, Activity, Radio, Sparkles } from 'lucide-react';

interface Interactive3DDeviceProps {
  className?: string;
  size?: number;
  onCallSimulate?: () => void;
}

export const Interactive3DDevice: React.FC<Interactive3DDeviceProps> = ({
  className = '',
  size = 360,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [micMuted, setMicMuted] = useState(false);
  const [latency, setLatency] = useState(132);

  const callStateRef = useRef(callState);
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || size;
    const height = size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 45, 110);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Root Group
    const deviceGroup = new THREE.Group();
    scene.add(deviceGroup);

    // 1. Sleek Angled Base Enclosure (Beveled look)
    const baseGeo = new THREE.BoxGeometry(64, 12, 54);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x121c2d,
      metalness: 0.85,
      roughness: 0.25,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -6;
    baseMesh.rotation.x = 0.12; // tilted ergonomic angle
    deviceGroup.add(baseMesh);

    // Top Chamfered Faceplate (Metallic dark slate)
    const topGeo = new THREE.BoxGeometry(60, 2, 50);
    const topMat = new THREE.MeshStandardMaterial({
      color: 0x1a2942,
      metalness: 0.9,
      roughness: 0.2,
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 0.5;
    topMesh.rotation.x = 0.12;
    deviceGroup.add(topMesh);

    // 2. Circular Acoustic Speaker Grille
    const speakerGeo = new THREE.CylinderGeometry(15, 15, 1.2, 32);
    const speakerMat = new THREE.MeshStandardMaterial({
      color: 0x0a121f,
      metalness: 0.95,
      roughness: 0.1,
    });
    const speakerMesh = new THREE.Mesh(speakerGeo, speakerMat);
    speakerMesh.position.set(-12, 1.8, -2);
    speakerMesh.rotation.x = 0.12;
    deviceGroup.add(speakerMesh);

    // Concentric acoustic rings on speaker
    const ringGeo = new THREE.RingGeometry(6, 7.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2189c8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const speakerRing = new THREE.Mesh(ringGeo, ringMat);
    speakerRing.rotation.x = -Math.PI / 2 + 0.12;
    speakerRing.position.set(-12, 2.5, -2);
    deviceGroup.add(speakerRing);

    // 3. Status LED Halo Ring around terminal
    const ledRingGeo = new THREE.TorusGeometry(18, 0.9, 16, 64);
    const ledRingMat = new THREE.MeshBasicMaterial({
      color: 0x38a85b,
      transparent: true,
      opacity: 0.9,
    });
    const ledRingMesh = new THREE.Mesh(ledRingGeo, ledRingMat);
    ledRingMesh.rotation.x = Math.PI / 2 + 0.12;
    ledRingMesh.position.set(-12, 2.3, -2);
    deviceGroup.add(ledRingMesh);

    // 4. Futuristic Screen / OLED Display Glass
    const screenGeo = new THREE.PlaneGeometry(22, 14);
    const screenMat = new THREE.MeshBasicMaterial({
      color: 0x050e1c,
      side: THREE.DoubleSide,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.rotation.x = -Math.PI / 2 + 0.12;
    screenMesh.position.set(14, 2.0, -2);
    deviceGroup.add(screenMesh);

    // Screen border glow
    const screenWireGeo = new THREE.EdgesGeometry(screenGeo);
    const screenWireMat = new THREE.LineBasicMaterial({ color: 0x55b9e8 });
    const screenWire = new THREE.LineSegments(screenWireGeo, screenWireMat);
    screenWire.rotation.x = -Math.PI / 2 + 0.12;
    screenWire.position.set(14, 2.1, -2);
    deviceGroup.add(screenWire);

    // 5. Dual Telephony Wireless Antennas
    const antGeo = new THREE.CylinderGeometry(0.8, 1.2, 28, 16);
    const antMat = new THREE.MeshStandardMaterial({ color: 0x223554, metalness: 0.8 });
    const ant1 = new THREE.Mesh(antGeo, antMat);
    ant1.position.set(-26, 10, -20);
    ant1.rotation.z = -0.15;
    deviceGroup.add(ant1);

    // Antenna LED Tip
    const tipGeo = new THREE.SphereGeometry(1.4, 16, 16);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0x38a85b });
    const tip1 = new THREE.Mesh(tipGeo, tipMat);
    tip1.position.set(-28, 24, -20);
    deviceGroup.add(tip1);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x55b9e8, 2.0);
    dirLight.position.set(40, 80, 50);
    scene.add(dirLight);

    const accentLight = new THREE.PointLight(0x38a85b, 2.5, 120);
    accentLight.position.set(-12, 15, -2);
    scene.add(accentLight);

    // INTERACTIVE ROTATION & MOUSE DRAG
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0.2;
    let rotY = -0.3;

    deviceGroup.rotation.x = rotX;
    deviceGroup.rotation.y = rotY;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      deviceGroup.rotation.y += dx * 0.008;
      deviceGroup.rotation.x += dy * 0.008;
      // Clamp x
      deviceGroup.rotation.x = Math.max(-0.2, Math.min(0.8, deviceGroup.rotation.x));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMouseX;
      const dy = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
      deviceGroup.rotation.y += dx * 0.008;
      deviceGroup.rotation.x += dy * 0.008;
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    domElement.addEventListener('touchmove', onTouchMove, { passive: true });
    domElement.addEventListener('touchend', onTouchEnd);

    // RESIZE OBSERVER
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

    // ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Dynamic LED pulse based on state
      const state = callStateRef.current;
      if (state === 'calling') {
        const pulse = Math.sin(time * 12) * 0.5 + 0.5;
        ledRingMat.color.setHex(0xf59e0b); // Amber ringing
        accentLight.color.setHex(0xf59e0b);
        accentLight.intensity = 1.0 + pulse * 3.0;
        tipMat.color.setHex(0xf59e0b);
      } else if (state === 'connected') {
        const pulse = Math.sin(time * 6) * 0.3 + 0.7;
        ledRingMat.color.setHex(0x38a85b); // Green connected
        accentLight.color.setHex(0x38a85b);
        accentLight.intensity = 1.8 + pulse * 1.5;
        tipMat.color.setHex(0x38a85b);
        speakerRing.scale.set(pulse * 1.2, pulse * 1.2, 1);
      } else {
        // Idle
        ledRingMat.color.setHex(0x2189c8); // Blue standby
        accentLight.color.setHex(0x2189c8);
        accentLight.intensity = 1.2;
        tipMat.color.setHex(0x2189c8);
      }

      // Idle float
      if (!isDragging) {
        deviceGroup.position.y = Math.sin(time * 1.8) * 1.5;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      domElement.removeEventListener('touchmove', onTouchMove);
      domElement.removeEventListener('touchend', onTouchEnd);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [size]);

  const handleToggleCall = () => {
    if (callState === 'idle') {
      setCallState('calling');
      setTimeout(() => {
        setCallState('connected');
      }, 1500);
    } else {
      setCallState('idle');
    }
  };

  return (
    <div
      id="interactive-3d-device-pod"
      className={`relative w-full rounded-3xl overflow-hidden border-2 border-[#000000] dark:border-[#2A3B5C] bg-gradient-to-b from-[#0F1B30] via-[#0D182B] to-[#070D18] text-white shadow-xl p-6 ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#2189C8]/20 border border-[#55B9E8]/30 flex items-center justify-center text-[#55B9E8]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">Auris Terminal Node X-1</h4>
            <p className="text-[11px] text-[#94A3B8]">
              Edge SIP Transceiver • Sub-150ms Telephony Unit
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-black px-2.5 py-1 rounded-full border ${
              callState === 'connected'
                ? 'bg-[#38A85B]/20 text-[#4ADE80] border-[#38A85B]/40'
                : callState === 'calling'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                : 'bg-[#2189C8]/20 text-[#38BDF8] border-[#2189C8]/40'
            }`}
          >
            {callState === 'connected'
              ? 'CALL ACTIVE'
              : callState === 'calling'
              ? 'CONNECTING...'
              : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div
        ref={mountRef}
        className="w-full flex items-center justify-center cursor-grab active:cursor-grabbing relative"
        style={{ height: `${size}px` }}
      />

      {/* Device Interactive Controls */}
      <div className="mt-2 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleCall}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shadow-md ${
              callState !== 'idle'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gradient-to-r from-[#38A85B] to-[#2f8f4d] hover:from-[#329852] hover:to-[#287d43] text-white'
            }`}
          >
            {callState !== 'idle' ? (
              <>
                <PhoneOff className="w-4 h-4" />
                <span>Hang Up</span>
              </>
            ) : (
              <>
                <Phone className="w-4 h-4" />
                <span>Simulate Phone Call</span>
              </>
            )}
          </button>

          <button
            onClick={() => setMicMuted(!micMuted)}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              micMuted
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
            }`}
            title={micMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-[#94A3B8]">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#38A85B]" />
            <span>RTT: <strong className="text-white">{latency}ms</strong></span>
          </div>
          <span className="text-[11px] text-white/50 hidden sm:inline">
            Drag to Rotate 3D
          </span>
        </div>
      </div>
    </div>
  );
};
