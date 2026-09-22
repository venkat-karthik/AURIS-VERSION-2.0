import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  PhoneCall,
  User,
  Activity,
  Headphones,
  RotateCcw,
} from 'lucide-react';

export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  company: string;
  primaryColor: number;
  glowColorHex: string;
  tagColor: string;
  speechSample: string;
  voiceGender: 'female' | 'male';
}

export const AGENT_PERSONAS: AgentPersona[] = [
  {
    id: 'ava',
    name: 'Ava',
    role: 'Medical Clinic Receptionist',
    company: 'Apollo Care Network',
    primaryColor: 0x38a85b, // Green
    glowColorHex: '#38A85B',
    tagColor: 'bg-[#38A85B]/10 text-[#38A85B] border-[#38A85B]/30',
    speechSample:
      "Hello! Thank you for calling Apollo Medical. My name is Ava. I can book your consultation with Dr. Mehta or confirm your lab appointments. How may I care for you today?",
    voiceGender: 'female',
  },
  {
    id: 'marcus',
    name: 'Marcus',
    role: 'Enterprise Inbound Qualifier',
    company: 'Apex Cloud Systems',
    primaryColor: 0x2189c8, // Blue
    glowColorHex: '#2189C8',
    tagColor: 'bg-[#2189C8]/10 text-[#2189C8] border-[#2189C8]/30',
    speechSample:
      "Good afternoon! This is Marcus from Apex Cloud. I noticed you requested a solution architecture review for your SIP trunking infrastructure. Do you have two minutes to discuss sizing?",
    voiceGender: 'male',
  },
  {
    id: 'maya',
    name: 'Maya',
    role: '24/7 Emergency Dispatcher',
    company: 'Metropolitan Fleet Services',
    primaryColor: 0xf59e0b, // Amber
    glowColorHex: '#F59E0B',
    tagColor: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    speechSample:
      "Metropolitan Priority Dispatch, agent Maya speaking. I am prioritizing your dispatch request now. Please confirm your cross streets and if any immediate vehicle assistance is required.",
    voiceGender: 'female',
  },
];

interface Interactive3DAgentAvatarProps {
  className?: string;
  height?: number;
  interactive?: boolean;
}

export const Interactive3DAgentAvatar: React.FC<Interactive3DAgentAvatarProps> = ({
  className = '',
  height = 420,
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<AgentPersona>(AGENT_PERSONAS[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState(selectedPersona.speechSample);
  const [isMuted, setIsMuted] = useState(false);
  const [headTracking, setHeadTracking] = useState(true);

  const selectedPersonaRef = useRef(selectedPersona);
  const isSpeakingRef = useRef(isSpeaking);

  useEffect(() => {
    selectedPersonaRef.current = selectedPersona;
    setTranscript(selectedPersona.speechSample);
  }, [selectedPersona]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;

    // SCENE & CAMERA
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 8, 48);
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ROOT AVATAR GROUP
    const avatarRoot = new THREE.Group();
    scene.add(avatarRoot);
    avatarRoot.position.y = -6;

    // --- 1. TORSO & COLLAR ---
    const chestGeo = new THREE.CylinderGeometry(8, 11, 12, 32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x111a2e,
      metalness: 0.8,
      roughness: 0.3,
    });
    const chestMesh = new THREE.Mesh(chestGeo, bodyMat);
    chestMesh.position.y = -2;
    avatarRoot.add(chestMesh);

    // Collar trim
    const collarGeo = new THREE.TorusGeometry(8.2, 0.6, 16, 64);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0x1e2e4a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.y = 4;
    avatarRoot.add(collarMesh);

    // Torso status emblem ring
    const emblemGeo = new THREE.RingGeometry(1.2, 2.0, 32);
    const emblemMat = new THREE.MeshBasicMaterial({
      color: selectedPersonaRef.current.primaryColor,
      side: THREE.DoubleSide,
    });
    const emblemMesh = new THREE.Mesh(emblemGeo, emblemMat);
    emblemMesh.position.set(0, 1.5, 9.8);
    avatarRoot.add(emblemMesh);

    // --- 2. ARTICULATED HEAD GROUP (Tracks mouse) ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 9.5, 0);
    avatarRoot.add(headGroup);

    // Neck joint
    const neckGeo = new THREE.CylinderGeometry(3.2, 3.8, 4.5, 32);
    const neckMat = new THREE.MeshStandardMaterial({
      color: 0x18243b,
      metalness: 0.7,
      roughness: 0.4,
    });
    const neckMesh = new THREE.Mesh(neckGeo, neckMat);
    neckMesh.position.y = -3;
    headGroup.add(neckMesh);

    // Main Cranium / Face Base (Sculpted AI Android look)
    const headGeo = new THREE.SphereGeometry(6.4, 48, 48);
    headGeo.scale(1.0, 1.25, 1.05);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.22,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 4.2;
    headGroup.add(headMesh);

    // Translucent Frosted Neural Dome (Brain core)
    const domeGeo = new THREE.SphereGeometry(5.8, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e3a5f,
      transmission: 0.6,
      opacity: 0.8,
      transparent: true,
      roughness: 0.15,
      metalness: 0.1,
    });
    const domeMesh = new THREE.Mesh(domeGeo, domeMat);
    domeMesh.position.y = 6.2;
    headGroup.add(domeMesh);

    // Internal Neural Core Nodes (Glowing brain particles)
    const brainNodesGroup = new THREE.Group();
    headGroup.add(brainNodesGroup);
    brainNodesGroup.position.y = 8;
    const brainNodesGeo = new THREE.BufferGeometry();
    const nodeCount = 36;
    const nodePositions = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i++) {
      const radius = 2.5 * Math.random();
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      nodePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      nodePositions[i * 3 + 1] = radius * Math.cos(phi);
      nodePositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    brainNodesGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    const brainNodesMat = new THREE.PointsMaterial({
      color: selectedPersonaRef.current.primaryColor,
      size: 0.6,
      transparent: true,
      opacity: 0.85,
    });
    const brainParticles = new THREE.Points(brainNodesGeo, brainNodesMat);
    brainNodesGroup.add(brainParticles);

    // --- 3. CURVED HIGH-TECH VISOR / EXPRESSIVE EYE SENSOR ---
    const visorGeo = new THREE.CylinderGeometry(5.85, 5.85, 3.2, 48, 1, true, -Math.PI * 0.35, Math.PI * 0.7);
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x050b14,
      metalness: 0.9,
      roughness: 0.05,
      reflectivity: 1.0,
      clearcoat: 1.0,
    });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 4.8, 0.4);
    headGroup.add(visorMesh);

    // Visor LED Light Strip / Eyes
    const eyeBandGeo = new THREE.BoxGeometry(7.2, 0.7, 0.2);
    const eyeBandMat = new THREE.MeshBasicMaterial({
      color: selectedPersonaRef.current.primaryColor,
    });
    const eyeBand = new THREE.Mesh(eyeBandGeo, eyeBandMat);
    eyeBand.position.set(0, 4.8, 6.7);
    headGroup.add(eyeBand);

    // Glowing pupil dots on visor
    const pupilGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-1.8, 4.8, 6.8);
    headGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(1.8, 4.8, 6.8);
    headGroup.add(rightPupil);

    // --- 4. ANIMATED MOUTH / SPEECH APERTURE MATRIX ---
    // When the agent speaks, these bars scale dynamically
    const mouthBarsGroup = new THREE.Group();
    mouthBarsGroup.position.set(0, 1.8, 6.6);
    headGroup.add(mouthBarsGroup);

    const mouthBars: THREE.Mesh[] = [];
    const mouthBarMat = new THREE.MeshBasicMaterial({
      color: selectedPersonaRef.current.primaryColor,
    });
    for (let i = 0; i < 7; i++) {
      const barGeo = new THREE.BoxGeometry(0.35, 0.9, 0.2);
      const bar = new THREE.Mesh(barGeo, mouthBarMat);
      bar.position.x = (i - 3) * 0.55;
      mouthBarsGroup.add(bar);
      mouthBars.push(bar);
    }

    // --- 5. TELEPHONY OPERATOR HEADSET & MIC BOOM ---
    const headsetBandGeo = new THREE.TorusGeometry(6.6, 0.4, 16, 64, Math.PI);
    const headsetMat = new THREE.MeshStandardMaterial({
      color: 0x223554,
      metalness: 0.9,
      roughness: 0.2,
    });
    const headsetBand = new THREE.Mesh(headsetBandGeo, headsetMat);
    headsetBand.rotation.z = Math.PI;
    headsetBand.rotation.x = 0.2;
    headsetBand.position.set(0, 6.0, 0);
    headGroup.add(headsetBand);

    // Earcups
    const earcupGeo = new THREE.CylinderGeometry(2.0, 2.0, 1.4, 32);
    const earcupMat = new THREE.MeshStandardMaterial({
      color: 0x111c30,
      metalness: 0.8,
      roughness: 0.3,
    });

    const leftEarcup = new THREE.Mesh(earcupGeo, earcupMat);
    leftEarcup.rotation.z = Math.PI / 2;
    leftEarcup.position.set(-6.8, 4.4, 0.4);
    headGroup.add(leftEarcup);

    const rightEarcup = new THREE.Mesh(earcupGeo, earcupMat);
    rightEarcup.rotation.z = Math.PI / 2;
    rightEarcup.position.set(6.8, 4.4, 0.4);
    headGroup.add(rightEarcup);

    // Earcup LED Halo Rings
    const haloGeo = new THREE.RingGeometry(1.4, 1.9, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: selectedPersonaRef.current.primaryColor,
      side: THREE.DoubleSide,
    });
    const leftHalo = new THREE.Mesh(haloGeo, haloMat);
    leftHalo.rotation.y = Math.PI / 2;
    leftHalo.position.set(-7.55, 4.4, 0.4);
    headGroup.add(leftHalo);

    const rightHalo = new THREE.Mesh(haloGeo, haloMat);
    rightHalo.rotation.y = Math.PI / 2;
    rightHalo.position.set(7.55, 4.4, 0.4);
    headGroup.add(rightHalo);

    // Flexible Microphone Boom Arm
    const boomCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-6.8, 4.0, 0.4),
      new THREE.Vector3(-6.2, 0.5, 4.0),
      new THREE.Vector3(-4.0, 0.8, 7.5),
      new THREE.Vector3(-1.4, 1.8, 7.8)
    );
    const boomGeo = new THREE.TubeGeometry(boomCurve, 32, 0.2, 12, false);
    const boomMat = new THREE.MeshStandardMaterial({
      color: 0x334768,
      metalness: 0.9,
    });
    const boomMesh = new THREE.Mesh(boomGeo, boomMat);
    headGroup.add(boomMesh);

    // Mic Capsule with glowing tip
    const micCapsuleGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.2, 16);
    const micCapsuleMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
    });
    const micCapsule = new THREE.Mesh(micCapsuleGeo, micCapsuleMat);
    micCapsule.rotation.z = Math.PI / 2.5;
    micCapsule.position.set(-1.2, 1.8, 7.8);
    headGroup.add(micCapsule);

    // Mic Active LED Tip
    const micLedGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const micLedMat = new THREE.MeshBasicMaterial({
      color: selectedPersonaRef.current.primaryColor,
    });
    const micLed = new THREE.Mesh(micLedGeo, micLedMat);
    micLed.position.set(-0.7, 1.8, 8.2);
    headGroup.add(micLed);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(30, 40, 40);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x55b9e8, 1.2);
    rimLight.position.set(-30, 30, -20);
    scene.add(rimLight);

    // Dynamic color accent point light
    const agentAccentLight = new THREE.PointLight(selectedPersonaRef.current.primaryColor, 2.5, 60);
    agentAccentLight.position.set(0, 10, 15);
    scene.add(agentAccentLight);

    // --- MOUSE TRACKING ---
    let targetRotY = 0;
    let targetRotX = 0;
    let currentRotY = 0;
    let currentRotX = 0;

    const onMouseMove = (e: MouseEvent) => {
      if (!headTracking) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      // Clamp rotation angles so the agent head turns naturally
      targetRotY = THREE.MathUtils.clamp(x * 0.45, -0.55, 0.55);
      targetRotX = THREE.MathUtils.clamp(-y * 0.25, -0.3, 0.3);

      // Shift eye pupils slightly inside visor
      leftPupil.position.x = -1.8 + targetRotY * 0.8;
      rightPupil.position.x = 1.8 + targetRotY * 0.8;
      leftPupil.position.y = 4.8 - targetRotX * 0.6;
      rightPupil.position.y = 4.8 - targetRotX * 0.6;
    };

    window.addEventListener('mousemove', onMouseMove);

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
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Update colors if persona changed
      const persona = selectedPersonaRef.current;
      const primaryHex = persona.primaryColor;
      emblemMat.color.setHex(primaryHex);
      eyeBandMat.color.setHex(primaryHex);
      brainNodesMat.color.setHex(primaryHex);
      mouthBarMat.color.setHex(primaryHex);
      haloMat.color.setHex(primaryHex);
      micLedMat.color.setHex(primaryHex);
      agentAccentLight.color.setHex(primaryHex);

      // Smooth Head Tracking Interpolation (Lerp)
      currentRotY += (targetRotY - currentRotY) * 0.08;
      currentRotX += (targetRotX - currentRotX) * 0.08;
      headGroup.rotation.y = currentRotY;
      headGroup.rotation.x = currentRotX;

      // Idle breathing float
      avatarRoot.position.y = -6 + Math.sin(time * 1.5) * 0.4;

      // Brain particles gentle twinkle
      brainNodesGroup.rotation.y = time * 0.3;

      // SPEECH AUDIO ANIMATION
      const speaking = isSpeakingRef.current;
      if (speaking) {
        // Dynamic mouth movement (speech bars scale)
        mouthBars.forEach((bar, idx) => {
          const freq = time * 18 + idx * 1.6;
          const scaleY = Math.max(0.2, (Math.sin(freq) * 0.5 + 0.5) * 2.8 + Math.cos(time * 24 + idx) * 0.8);
          bar.scale.y = scaleY;
        });

        // Pulsing mic tip
        const micPulse = Math.sin(time * 20) * 0.5 + 1.2;
        micLed.scale.set(micPulse, micPulse, micPulse);

        // Head micro-nod while talking
        headGroup.position.y = 9.5 + Math.sin(time * 7) * 0.25;
        eyeBand.scale.x = 1.0 + Math.sin(time * 8) * 0.1;
      } else {
        // Idle mouth state (collapsed calm bars)
        mouthBars.forEach((bar) => {
          bar.scale.y = 0.3;
        });
        micLed.scale.set(1, 1, 1);
        headGroup.position.y = 9.5;
        eyeBand.scale.x = 1.0;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      chestGeo.dispose();
      bodyMat.dispose();
      headGeo.dispose();
      headMat.dispose();
      visorGeo.dispose();
      visorMat.dispose();
    };
  }, [height, headTracking]);

  // LIVE WEB SPEECH API / SYNTHESIS
  const handleToggleSpeak = () => {
    if (isSpeaking) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    if ('speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectedPersona.speechSample);
      utterance.rate = 1.05;
      utterance.pitch = selectedPersona.voiceGender === 'female' ? 1.15 : 0.95;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (selectedPersona.voiceGender === 'female'
              ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('google')
              : v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('alex'))
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback simulated duration
      setTimeout(() => {
        setIsSpeaking(false);
      }, 5500);
    }
  };

  return (
    <div
      id="3d-ai-voice-agent-avatar-card"
      className={`relative w-full rounded-3xl overflow-hidden border border-slate-700/80 bg-gradient-to-b from-[#0F172A] via-[#0B132B] to-[#050914] text-white shadow-2xl p-6 sm:p-7 flex flex-col justify-between ${className}`}
    >
      {/* Top Banner: Agent Identity & Persona Switcher */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-white shadow-xs">
              <Headphones className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">{selectedPersona.name}</h3>
                <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${selectedPersona.tagColor}`}>
                  {selectedPersona.role}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-semibold">{selectedPersona.company}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all ${
                isSpeaking
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-sm animate-pulse'
                  : 'bg-slate-800/80 text-slate-200 border-slate-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-sky-400'
                }`}
              />
              <span>{isSpeaking ? 'AGENT SPEAKING LIVE' : 'VOICE STREAM READY'}</span>
            </span>
          </div>
        </div>

        {/* Persona Select Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex-shrink-0">
            Personas:
          </span>
          {AGENT_PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                setIsSpeaking(false);
                setSelectedPersona(p);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 border ${
                selectedPersona.id === p.id
                  ? 'bg-white text-slate-950 border-white shadow-md font-extrabold'
                  : 'bg-slate-800/80 text-slate-200 border-slate-700/80 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{p.name} ({p.role.split(' ')[0]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="relative w-full flex items-center justify-center my-3 cursor-crosshair select-none"
        style={{ height: `${height}px` }}
      >
        <div className="absolute top-2 right-2 text-xs text-slate-200 bg-slate-950/70 px-3 py-1.5 rounded-lg backdrop-blur-md border border-slate-700/60 pointer-events-none font-medium flex items-center gap-1.5 shadow-sm">
          <Activity className="w-3 h-3 text-sky-400" />
          <span>Move cursor to track agent gaze</span>
        </div>
      </div>

      {/* Live Transcript Bubble */}
      <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 mb-4 backdrop-blur-md shadow-inner space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
          <span className="flex items-center gap-1.5 text-sky-400">
            <Sparkles className="w-3.5 h-3.5" />
            Live Voice Synthesis Transcript
          </span>
          <span className="font-mono text-slate-300">Opus HD • 142ms Carrier SLA</span>
        </div>
        <p className="text-sm text-slate-100 font-medium leading-relaxed">
          "{transcript}"
        </p>
      </div>

      {/* Control Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <button
            id="agent-avatar-speak-trigger-btn"
            onClick={handleToggleSpeak}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-md ${
              isSpeaking
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Interrupt Agent</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Hear {selectedPersona.name} Speak</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setHeadTracking(!headTracking)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 ${
              headTracking
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Toggle cursor gaze tracking"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Gaze Tracking: {headTracking ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
          <span>Carrier Ready • SIP/WebRTC</span>
        </div>
      </div>
    </div>
  );
};
