'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MACHINES_CONFIG } from '@/config/machines';
import { MachineConfig } from '@/types/machine';
import { MachineTelemetry, MachineStatus } from '@/types/telemetry';
import { useTelemetry } from '@/context/TelemetryContext';
import { formatKw, formatTemp, formatVibration, getPriorityBadge, getStatusColor } from '@/lib/utils';
import { ChevronRight, Maximize2, RotateCcw, Eye, Zap, Flame, Activity, X } from 'lucide-react';
import Link from 'next/link';

interface DigitalTwinCanvasProps {
  height?: string;
  selectedMachineId?: string | null;
  onSelectMachine?: (id: string | null) => void;
  showControlsBar?: boolean;
  className?: string;
}

export const DigitalTwinCanvas: React.FC<DigitalTwinCanvasProps> = ({
  height = '620px',
  selectedMachineId: externalSelectedId,
  onSelectMachine,
  showControlsBar = true,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { fleet, activeScenario } = useTelemetry();

  const [selectedId, setSelectedId] = useState<string | null>(externalSelectedId || null);
  const [cameraPreset, setCameraPreset] = useState<string>('overview');

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const machineMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const statusLightsRef = useRef<Map<string, { light: THREE.PointLight; mesh: THREE.Mesh }>>(new Map());
  const animationFrameRef = useRef<number | null>(null);

  // Sync external selection
  useEffect(() => {
    if (externalSelectedId !== undefined) {
      setSelectedId(externalSelectedId);
    }
  }, [externalSelectedId]);

  const handleMachineClick = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      if (onSelectMachine) onSelectMachine(id);

      if (id && controlsRef.current && cameraRef.current && machineMeshesRef.current.has(id)) {
        const group = machineMeshesRef.current.get(id)!;
        const pos = group.position;
        // Smoothly target the selected machine
        controlsRef.current.target.set(pos.x, pos.y + 1.5, pos.z);
      }
    },
    [onSelectMachine]
  );

  // Setup Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const heightPx = container.clientHeight || 600;

    // 1. Scene & Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // Deep OLED dark
    scene.fog = new THREE.FogExp2(0x020617, 0.018);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / heightPx, 0.1, 1000);
    camera.position.set(24, 28, 36);
    cameraRef.current = camera;

    // 3. Renderer with high quality & performance optimization
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05; // Prevent camera under floor
    controls.minDistance = 6;
    controls.maxDistance = 85;
    controls.target.set(0, 1.5, 0);
    controlsRef.current = controls;

    // 5. Lighting
    // Ambient soft blue fill
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);

    // Main Overhead Industrial Area Light
    const mainDirLight = new THREE.DirectionalLight(0xe2e8f0, 2.2);
    mainDirLight.position.set(20, 35, 20);
    mainDirLight.castShadow = true;
    mainDirLight.shadow.mapSize.width = 2048;
    mainDirLight.shadow.mapSize.height = 2048;
    mainDirLight.shadow.camera.near = 0.5;
    mainDirLight.shadow.camera.far = 100;
    mainDirLight.shadow.camera.left = -30;
    mainDirLight.shadow.camera.right = 30;
    mainDirLight.shadow.camera.top = 30;
    mainDirLight.shadow.camera.bottom = -30;
    mainDirLight.shadow.bias = -0.0005;
    scene.add(mainDirLight);

    // Rim light from rear for metallic edges
    const rimLight = new THREE.DirectionalLight(0x06b6d4, 0.8);
    rimLight.position.set(-25, 20, -25);
    scene.add(rimLight);

    // 6. Factory Floor & Technical Grid
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x080e1e,
      roughness: 0.65,
      metalness: 0.25,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Technical Grid Lines
    const gridHelper = new THREE.GridHelper(80, 40, 0x1e293b, 0x0f172a);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Zone Demarcation Lines (Walkways & Safety Zones)
    const createZoneLine = (x: number, z: number, w: number, d: number, color: number = 0x334155) => {
      const lineGeo = new THREE.PlaneGeometry(w, d);
      const lineMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 });
      const mesh = new THREE.Mesh(lineGeo, lineMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, 0.02, z);
      scene.add(mesh);
    };

    // Central AGV corridor & zone boxes
    createZoneLine(0, 0, 4, 60, 0x06b6d4); // Main transit spine
    createZoneLine(-12, 12, 16, 16, 0x334155); // Bay 1
    createZoneLine(12, 12, 16, 16, 0x334155);  // Bay 2
    createZoneLine(-12, -12, 16, 16, 0x334155); // Bay 3 Forge
    createZoneLine(12, -12, 16, 16, 0x334155);  // Utility & Logistics

    // 7. Build Physical 3D Machine Assets for M01 to M10
    const machineGroups = new Map<string, THREE.Group>();
    const statusLights = new Map<string, { light: THREE.PointLight; mesh: THREE.Mesh }>();

    // Spatial layout coordinates for M01-M10 (Realistic factory bays)
    const coordinates: Record<string, [number, number]> = {
      M01: [-14, 14],   // Bay 1: CNC Mill
      M02: [-14, -6],   // Central Forge: 400T Press
      M03: [-14, -16],  // Utility Loft: Rotary Compressor
      M04: [-6, -14],   // Hydraulics Sub-Station
      M05: [14, 14],    // Bay 2: Plastic Injection Molder
      M06: [14, -14],   // Roof/Chiller Plant
      M07: [6, -16],    // Scrubber Blower
      M08: [0, 12],     // Central Transit Infeed Conveyor
      M09: [-6, 6],     // Thermal Annealer
      M10: [14, -4],    // Packaging Robotic Cell
    };

    MACHINES_CONFIG.forEach((config) => {
      const [x, z] = coordinates[config.id] || [0, 0];
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.name = config.id;

      // Base Materials
      const steelMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.35,
      });
      const darkChassisMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.5,
        roughness: 0.6,
      });
      const highlightMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.7,
        roughness: 0.3,
      });

      // Machine Base Plinth
      const plinthGeo = new THREE.BoxGeometry(3.6, 0.4, 3.6);
      const plinth = new THREE.Mesh(plinthGeo, darkChassisMat);
      plinth.position.y = 0.2;
      plinth.receiveShadow = true;
      plinth.castShadow = true;
      group.add(plinth);

      // Model specific industrial geometry
      if (config.category === 'milling') {
        // M01: CNC Mill Enclosure + Spindle Column
        const bodyGeo = new THREE.BoxGeometry(2.8, 3.2, 2.4);
        const body = new THREE.Mesh(bodyGeo, steelMat);
        body.position.y = 1.8;
        body.castShadow = true;
        group.add(body);

        // Glass window
        const winGeo = new THREE.BoxGeometry(1.8, 1.4, 0.2);
        const winMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5, roughness: 0.1 });
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(0, 2.2, 1.15);
        group.add(win);
      } else if (config.category === 'stamping') {
        // M02: Heavy Hydraulic Press (Dual Heavy Pillars + Ram)
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.2 });
        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 4.5, 16), pillarMat);
        p1.position.set(-1.1, 2.25, 0);
        p1.castShadow = true;
        const p2 = p1.clone();
        p2.position.set(1.1, 2.25, 0);
        group.add(p1, p2);

        const crown = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.2, 1.8), steelMat);
        crown.position.set(0, 4.2, 0);
        crown.castShadow = true;
        group.add(crown);

        const ram = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 1.4), highlightMat);
        ram.position.set(0, 2.8, 0);
        group.add(ram);
      } else if (config.category === 'compressor') {
        // M03: Rotary Screw Compressor (Twin Cylindrical Vessel + Radiator)
        const cylinderMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 3.0, 24), cylinderMat);
        tank.rotation.z = Math.PI / 2;
        tank.position.set(0, 1.4, 0);
        tank.castShadow = true;
        group.add(tank);

        const radiator = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 2.4), steelMat);
        radiator.position.set(1.4, 1.3, 0);
        radiator.castShadow = true;
        group.add(radiator);
      } else if (config.category === 'molding') {
        // M05: Plastic Injection Molder (Long Barrel + Clamp + Hopper)
        const baseBeam = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.8, 1.8), steelMat);
        baseBeam.position.set(0, 0.8, 0);
        baseBeam.castShadow = true;
        group.add(baseBeam);

        const hopper = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.2, 16), highlightMat);
        hopper.position.set(1.4, 2.2, 0);
        group.add(hopper);

        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.4, 16), steelMat);
        barrel.rotation.z = Math.PI / 2;
        barrel.position.set(-0.6, 1.6, 0);
        group.add(barrel);
      } else if (config.category === 'robotics') {
        // M10: 6-Axis Articulated Robot + Safety Cage
        const baseCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.6, 16), highlightMat);
        baseCyl.position.y = 0.5;
        group.add(baseCyl);

        const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.8, 12), steelMat);
        arm1.position.set(0.3, 1.4, 0);
        arm1.rotation.z = -0.4;
        group.add(arm1);

        const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.5, 12), highlightMat);
        arm2.position.set(0.8, 2.2, 0);
        arm2.rotation.z = 0.6;
        group.add(arm2);

        // Safety cage posts
        const cageGeo = new THREE.BoxGeometry(3.4, 2.2, 3.4);
        const cageMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.15 });
        const cage = new THREE.Mesh(cageGeo, cageMat);
        cage.position.y = 1.3;
        group.add(cage);
      } else {
        // Generic Industrial Machinery Chassis (M04, M06, M07, M08, M09)
        const mainBox = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.2), steelMat);
        mainBox.position.y = 1.3;
        mainBox.castShadow = true;
        group.add(mainBox);

        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.8, 12), highlightMat);
        pipe.position.set(0.8, 2.2, 0.4);
        group.add(pipe);
      }

      // Status Beacon Light & Glowing Sphere
      const beaconGeo = new THREE.SphereGeometry(0.22, 16, 16);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 1.2,
        roughness: 0.1,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 3.8, 0);
      group.add(beacon);

      const statusLight = new THREE.PointLight(0x10b981, 1.5, 8);
      statusLight.position.set(0, 3.8, 0);
      group.add(statusLight);

      statusLights.set(config.id, { light: statusLight, mesh: beacon });

      // Label Marker Billboard (Visible in 3D Space)
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, 0, 128, 64);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.strokeRect(2, 2, 124, 60);
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(config.id, 64, 32);
      }
      const labelTexture = new THREE.CanvasTexture(canvas);
      const labelMat = new THREE.SpriteMaterial({ map: labelTexture, transparent: true });
      const labelSprite = new THREE.Sprite(labelMat);
      labelSprite.position.set(0, 4.6, 0);
      labelSprite.scale.set(2.2, 1.1, 1);
      group.add(labelSprite);

      scene.add(group);
      machineGroups.set(config.id, group);
    });

    machineMeshesRef.current = machineGroups;
    statusLightsRef.current = statusLights;

    // 8. Raycaster for Interactive Machine Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let current: THREE.Object3D | null = intersects[0].object;
        while (current && current !== scene) {
          if (current.name && machineGroups.has(current.name)) {
            handleMachineClick(current.name);
            return;
          }
          current = current.parent;
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // 9. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      controls.update();

      // Subtle beacon light pulsing for warning/critical machines
      statusLights.forEach((beaconObj, mId) => {
        const t = fleet[mId];
        const status = t ? t.status : 'normal';
        if (status === 'critical') {
          const pulse = 1.0 + Math.sin(elapsed * 6.0) * 0.8;
          beaconObj.light.intensity = 2.5 * pulse;
        } else if (status === 'warning') {
          const pulse = 1.0 + Math.sin(elapsed * 3.0) * 0.4;
          beaconObj.light.intensity = 1.6 * pulse;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      controls.dispose();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [handleMachineClick]);

  // Update machine status illumination colors in real-time
  useEffect(() => {
    statusLightsRef.current.forEach((beaconObj, machineId) => {
      const telemetry = fleet[machineId];
      const status: MachineStatus = telemetry ? telemetry.status : 'offline';

      let hexColor = 0x10b981; // emerald normal
      if (status === 'warning') hexColor = 0xf59e0b; // amber
      else if (status === 'critical') hexColor = 0xef4444; // rose critical
      else if (status === 'offline') hexColor = 0x64748b; // slate offline

      beaconObj.light.color.setHex(hexColor);
      (beaconObj.mesh.material as THREE.MeshStandardMaterial).color.setHex(hexColor);
      (beaconObj.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(hexColor);
    });
  }, [fleet]);

  // Predefined Camera Transitions
  const setCameraView = (view: 'overview' | 'bay1' | 'central' | 'bay2' | 'utility') => {
    setCameraPreset(view);
    if (!controlsRef.current || !cameraRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (view) {
      case 'overview':
        camera.position.set(24, 28, 36);
        controls.target.set(0, 1.5, 0);
        break;
      case 'bay1':
        camera.position.set(-14, 16, 26);
        controls.target.set(-14, 2, 14);
        break;
      case 'central':
        camera.position.set(-14, 18, 12);
        controls.target.set(-14, 2, -6);
        break;
      case 'bay2':
        camera.position.set(14, 16, 26);
        controls.target.set(14, 2, 14);
        break;
      case 'utility':
        camera.position.set(14, 18, 6);
        controls.target.set(14, 2, -14);
        break;
    }
  };

  const selectedConfig = selectedId ? MACHINES_CONFIG.find((m) => m.id === selectedId) : null;
  const selectedTelemetry = selectedId ? fleet[selectedId] : null;

  return (
    <div className={`relative w-full rounded-lg overflow-hidden border border-industrial-700/60 bg-industrial-950 shadow-2xl ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} style={{ width: '100%', height }} className="cursor-grab active:cursor-grabbing" />

      {/* Top Left Spatial Overlay Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-industrial-950/80 backdrop-blur-md px-3 py-1.5 rounded border border-industrial-800 font-mono text-xs text-industrial-200">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold text-sky-400">DIGITAL TWIN ENGINE</span>
        <span className="text-industrial-500">|</span>
        <span className="text-industrial-400">10 Edge Channels Live</span>
      </div>

      {/* Top Right Camera Presets */}
      {showControlsBar && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-industrial-950/80 backdrop-blur-md p-1 rounded border border-industrial-800 font-mono text-xs">
          <Eye className="w-3.5 h-3.5 text-industrial-400 ml-1.5" />
          <span className="text-industrial-500 text-[10px]">VIEW:</span>
          {[
            { id: 'overview', label: 'OVERVIEW' },
            { id: 'bay1', label: 'BAY 1' },
            { id: 'central', label: 'FORGE' },
            { id: 'bay2', label: 'BAY 2' },
            { id: 'utility', label: 'UTILITY' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setCameraView(preset.id as any)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                cameraPreset === preset.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                  : 'text-industrial-400 hover:text-industrial-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setCameraView('overview')}
            title="Reset Orbit View"
            className="p-1 rounded text-industrial-400 hover:text-sky-300 ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Contextual Machine HUD (Appears when clicking any machine in 3D) */}
      {selectedConfig && (
        <div className="absolute bottom-4 left-4 z-20 w-80 bg-industrial-900/95 backdrop-blur-xl rounded-lg border border-sky-500/40 p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 font-mono">
          <div className="flex items-start justify-between border-b border-industrial-800 pb-2 mb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sky-400 bg-sky-950 px-1.5 py-0.2 rounded border border-sky-800 text-xs">
                  {selectedConfig.id}
                </span>
                <span className="font-bold text-industrial-100 text-xs truncate max-w-[150px]">
                  {selectedConfig.name}
                </span>
              </div>
              <span className="text-[10px] text-industrial-400">{selectedConfig.line}</span>
            </div>

            <button
              onClick={() => setSelectedId(null)}
              className="text-industrial-400 hover:text-industrial-100 p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 bg-industrial-950/80 p-2.5 rounded border border-industrial-800/80 mb-3 text-xs">
            <div>
              <span className="text-industrial-500 text-[10px] block flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 text-amber-400" /> POWER
              </span>
              <span className="text-amber-300 font-bold">
                {formatKw(selectedTelemetry?.activePower || 0)}
              </span>
            </div>

            <div>
              <span className="text-industrial-500 text-[10px] block flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5 text-rose-400" /> TEMP
              </span>
              <span className={(selectedTelemetry?.temperature || 0) > selectedConfig.thresholds.tempWarning ? 'text-rose-400 font-bold' : 'text-industrial-200'}>
                {formatTemp(selectedTelemetry?.temperature || selectedConfig.baselineTemp)}
              </span>
            </div>

            <div>
              <span className="text-industrial-500 text-[10px] block flex items-center gap-0.5">
                <Activity className="w-2.5 h-2.5 text-purple-400" /> VIB
              </span>
              <span className={(selectedTelemetry?.vibrationRms || 0) > selectedConfig.thresholds.vibWarning ? 'text-amber-400 font-bold' : 'text-industrial-200'}>
                {formatVibration(selectedTelemetry?.vibrationRms || selectedConfig.baselineVibration)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-industrial-400">Health Score:</span>
            <span className={`font-bold ${(selectedTelemetry?.machineHealth || 100) < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {selectedTelemetry?.machineHealth || 100} / 100
            </span>
          </div>

          {/* Open Deep Workspace Button */}
          <Link
            href={`/machines/${selectedConfig.id}`}
            className="w-full py-2 px-3 rounded bg-sky-600 hover:bg-sky-500 text-industrial-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20 transition-colors"
          >
            <span>OPEN MACHINE INTELLIGENCE</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};
