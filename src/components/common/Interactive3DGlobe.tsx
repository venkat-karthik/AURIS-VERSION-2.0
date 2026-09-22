import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Globe2, Radio, Zap, Shield, Eye, RotateCw, Pause, Play } from 'lucide-react';

interface CarrierNode {
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  latencyMs: number;
  sipProtocol: string;
  activeLines: number;
  color: string;
}

const CARRIER_NODES: CarrierNode[] = [
  { name: 'US-West-1', city: 'San Jose', country: 'United States', lat: 37.3382, lng: -121.8863, latencyMs: 38, sipProtocol: 'TLS / SRTP v1.3', activeLines: 840, color: '#38A85B' },
  { name: 'IN-South-1', city: 'Bangalore', country: 'India', lat: 12.9716, lng: 77.5946, latencyMs: 24, sipProtocol: 'Direct SIP Trunk', activeLines: 1240, color: '#2189C8' },
  { name: 'EU-Central-1', city: 'Frankfurt', country: 'Germany', lat: 50.1109, lng: 8.6821, latencyMs: 42, sipProtocol: 'E.164 / WebRTC', activeLines: 920, color: '#38A85B' },
  { name: 'AP-East-1', city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, latencyMs: 31, sipProtocol: 'Opus 48kHz HD', activeLines: 760, color: '#2189C8' },
  { name: 'UK-South-1', city: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, latencyMs: 46, sipProtocol: 'SIP Over WSS', activeLines: 690, color: '#38A85B' },
  { name: 'AP-Northeast-1', city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, latencyMs: 52, sipProtocol: 'Sub-30ms Edge', activeLines: 580, color: '#2189C8' },
  { name: 'AU-East-1', city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, latencyMs: 68, sipProtocol: 'G.711 / Opus', activeLines: 410, color: '#38A85B' },
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

interface Interactive3DGlobeProps {
  className?: string;
  height?: number;
  compact?: boolean;
}

export const Interactive3DGlobe: React.FC<Interactive3DGlobeProps> = ({
  className = '',
  height = 480,
  compact = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<CarrierNode>(CARRIER_NODES[1]); // Bangalore default
  const [isRotating, setIsRotating] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.003);
  const [showArcs, setShowArcs] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const globeGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const currentHeight = height;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / currentHeight, 0.1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, currentHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Root 3D Group
    const globeGroup = new THREE.Group();
    globeGroup.rotation.x = 0.25;
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const globeRadius = 75;

    // 1. Core Sphere (Translucent dark/light gradient effect)
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 48, 48);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x0c1e36,
      emissive: 0x051326,
      specular: 0x2189c8,
      shininess: 40,
      transparent: true,
      opacity: 0.88,
      wireframe: false,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphereMesh);

    // 2. Wireframe / Latitude Longitude Grid
    const wireframeGeo = new THREE.SphereGeometry(globeRadius * 1.002, 24, 24);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x2189c8,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat);
    globeGroup.add(wireframeMesh);

    // 3. Continental Dot Matrix (Procedural landmass approximation)
    const dotCount = 1200;
    const dotGeo = new THREE.BufferGeometry();
    const dotPositions: number[] = [];
    const dotColors: number[] = [];

    const primaryColor = new THREE.Color(0x38a85b);
    const secondaryColor = new THREE.Color(0x55b9e8);

    for (let i = 0; i < dotCount; i++) {
      const lat = (Math.random() - 0.5) * 160;
      const lng = (Math.random() - 0.5) * 360;
      const vec = latLngToVector3(lat, lng, globeRadius * 1.005);
      dotPositions.push(vec.x, vec.y, vec.z);

      const mixed = primaryColor.clone().lerp(secondaryColor, Math.random() * 0.7);
      dotColors.push(mixed.r, mixed.g, mixed.b);
    }

    dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3));
    dotGeo.setAttribute('color', new THREE.Float32BufferAttribute(dotColors, 3));
    const dotMat = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    const dotPoints = new THREE.Points(dotGeo, dotMat);
    globeGroup.add(dotPoints);

    // 4. Glowing Atmosphere Rim
    const atmosGeo = new THREE.SphereGeometry(globeRadius * 1.15, 32, 32);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.2, 0.65, 0.95, 1.0) * intensity * 0.7;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);

    // 5. Carrier Nodes & Beacons
    const beaconMeshes: { mesh: THREE.Mesh; node: CarrierNode }[] = [];
    CARRIER_NODES.forEach((node) => {
      const pos = latLngToVector3(node.lat, node.lng, globeRadius * 1.02);

      // Node pin
      const pinGeo = new THREE.SphereGeometry(2.2, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      globeGroup.add(pinMesh);

      // Pulsing Beacon ring
      const ringGeo = new THREE.RingGeometry(2.6, 3.8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(ringMesh);

      beaconMeshes.push({ mesh: pinMesh, node });
    });

    // 6. Audio Routing Arcs between key nodes
    const arcCurves: { curve: THREE.CubicBezierCurve3; lineMesh: THREE.Line; pulseMesh: THREE.Mesh }[] = [];
    const nodePairs = [
      [1, 0], // Bangalore -> San Jose
      [1, 2], // Bangalore -> Frankfurt
      [1, 3], // Bangalore -> Singapore
      [2, 4], // Frankfurt -> London
      [3, 5], // Singapore -> Tokyo
      [0, 6], // San Jose -> Sydney
    ];

    nodePairs.forEach(([idxA, idxB]) => {
      const nodeA = CARRIER_NODES[idxA];
      const nodeB = CARRIER_NODES[idxB];
      const vA = latLngToVector3(nodeA.lat, nodeA.lng, globeRadius * 1.02);
      const vB = latLngToVector3(nodeB.lat, nodeB.lng, globeRadius * 1.02);

      // Midpoint pulled outward
      const mid = vA.clone().add(vB).multiplyScalar(0.5);
      const dist = vA.distanceTo(vB);
      mid.normalize().multiplyScalar(globeRadius * (1.08 + dist * 0.002));

      const curve = new THREE.CubicBezierCurve3(vA, mid, mid, vB);
      const points = curve.getPoints(50);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x55b9e8,
        transparent: true,
        opacity: 0.5,
      });
      const lineMesh = new THREE.Line(lineGeo, lineMat);
      globeGroup.add(lineMesh);

      // Traveling pulse packet
      const pulseGeo = new THREE.SphereGeometry(1.4, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0x38a85b });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      globeGroup.add(pulseMesh);

      arcCurves.push({ curve, lineMesh, pulseMesh });
    });

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x55b9e8, 1.8);
    dirLight1.position.set(150, 100, 150);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38a85b, 1.2);
    dirLight2.position.set(-150, -100, -100);
    scene.add(dirLight2);

    // MOUSE INTERACTION & DRAG ORBIT
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let velocityX = 0;
    let velocityY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      velocityX = deltaX * 0.004;
      velocityY = deltaY * 0.004;

      globeGroup.rotation.y += velocityX;
      globeGroup.rotation.x += velocityY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // TOUCH SUPPORT
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
      globeGroup.rotation.y += deltaX * 0.004;
      globeGroup.rotation.x += deltaY * 0.004;
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
          camera.aspect = newW / currentHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, currentHeight);
        }
      }
    });
    resizeObserver.observe(container);

    // ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Inertia & Auto Rotation
      if (!isDragging) {
        velocityX *= 0.94;
        velocityY *= 0.94;
        globeGroup.rotation.y += velocityX;
        globeGroup.rotation.x += velocityY;

        if (isRotating) {
          globeGroup.rotation.y += rotationSpeed;
        }
      }

      // Animate packet pulses along arcs
      arcCurves.forEach(({ curve, pulseMesh }, index) => {
        const loopTime = (time * 0.6 + index * 0.25) % 1.0;
        const pt = curve.getPoint(loopTime);
        pulseMesh.position.copy(pt);
      });

      // Pulse dot point sizes
      dotPoints.rotation.y = time * 0.02;

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
  }, [height, isRotating, rotationSpeed, showArcs]);

  return (
    <div
      id="interactive-3d-globe-wrapper"
      className={`relative w-full rounded-3xl overflow-hidden border-2 border-[#000000] dark:border-[#2A3B5C] bg-gradient-to-b from-[#0B1528] via-[#0E1A33] to-[#070D1A] text-white shadow-xl ${className}`}
    >
      {/* Top Header & Node Badges */}
      <div className="absolute top-0 inset-x-0 z-10 p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 rounded-2xl bg-[#38A85B]/20 border border-[#65C978]/40 text-[#4ADE80] flex items-center justify-center shadow-xs">
            <Globe2 className="w-5 h-5 animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#4ADE80] bg-[#38A85B]/20 px-2 py-0.5 rounded-full">
                Global Voice Network
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#94A3B8] font-bold">
                <Radio className="w-3 h-3 text-[#38A85B] animate-pulse" />
                7 Edge Nodes Active
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
              Sub-150ms Global Voice Carrier Grid
            </h3>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[#13223D]/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-[#233554]">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            title={isRotating ? 'Pause Rotation' : 'Resume Rotation'}
          >
            {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-[#4ADE80]" />}
          </button>
          <button
            onClick={() => setRotationSpeed((prev) => (prev === 0.003 ? 0.008 : 0.003))}
            className="px-2 py-1 rounded-lg text-xs font-bold hover:bg-white/10 text-[#55B9E8] transition-colors cursor-pointer"
          >
            {rotationSpeed === 0.003 ? '1x' : '2.5x'} Speed
          </button>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-[11px] text-[#94A3B8] font-medium hidden sm:inline">
            Drag to Rotate 360°
          </span>
        </div>
      </div>

      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="w-full cursor-grab active:cursor-grabbing"
        style={{ height: `${height}px` }}
      />

      {/* Floating Node Selector & Stats Strip */}
      <div className="absolute bottom-0 inset-x-0 z-10 p-4 sm:p-6 bg-gradient-to-t from-[#070D1A] via-[#070D1A]/80 to-transparent">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Quick Node Tabs */}
          <div className="lg:col-span-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CARRIER_NODES.map((node) => {
              const isSelected = selectedNode.name === node.name;
              return (
                <button
                  key={node.name}
                  onClick={() => setSelectedNode(node)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#38A85B] text-white shadow-md'
                      : 'bg-[#13223D] hover:bg-[#1A2D4E] text-[#CBD5E1] border border-[#233554]'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: node.color }}
                  />
                  <span>{node.city}</span>
                  <span className="text-[10px] opacity-80">{node.latencyMs}ms</span>
                </button>
              );
            })}
          </div>

          {/* Active Node Telemetry Card */}
          <div className="lg:col-span-4 p-3 rounded-2xl bg-[#111E36] border border-[#23385B] flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase font-black text-[#94A3B8]">
                Inspecting Node
              </div>
              <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>{selectedNode.city}, {selectedNode.country}</span>
              </div>
              <div className="text-[11px] text-[#55B9E8] font-semibold mt-0.5">
                {selectedNode.sipProtocol}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-[#4ADE80]">
                {selectedNode.latencyMs}ms
              </div>
              <div className="text-[10px] font-bold text-[#94A3B8]">
                {selectedNode.activeLines} Lines Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
