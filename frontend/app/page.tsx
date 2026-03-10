'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Stars, Html } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';

import HeartModel from '@/components/HeartModel';
import CardioSentinelUI from '@/components/CardioSentinelUI';

// Camera controller component
function CameraController({ isZoomedIn }: { isZoomedIn: boolean }) {
  const { camera } = useThree();

  useEffect(() => {
    if (isZoomedIn) {
      // Zoom into the heart
      gsap.to(camera.position, {
        x: 0.5,
        y: 0,
        z: 2, // Very close
        duration: 2.5,
        ease: 'power3.inOut'
      });
    } else {
      // Reset out
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 10,
        duration: 2,
        ease: 'power3.inOut'
      });
    }
  }, [isZoomedIn, camera]);

  return null;
}

// Navigation nodes inside the heart
function ArteryNodes({ isZoomedIn, onSectionSelect }: { isZoomedIn: boolean, onSectionSelect: (s: string) => void }) {
  if (!isZoomedIn) return null;

  const nodes = [
    { id: 'about', label: 'SYS_ABOUT', pos: [-2, 1, 0] },
    { id: 'features', label: 'DIAGNOSTICS', pos: [2, 1.5, -1] },
    { id: 'technology', label: 'NEURAL_CORE', pos: [-1.5, -1.5, -0.5] },
    { id: 'howitworks', label: 'PROTOCOL_FLOW', pos: [1.5, -1, 0.5] }
  ];

  return (
    <group>
      {nodes.map((node, i) => (
        <group key={i} position={node.pos as [number, number, number]}>
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSectionSelect(node.id);
            }}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
          >
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#00d2ff" emissive="#00d2ff" emissiveIntensity={2} />
          </mesh>
          <Html distanceFactor={10} position={[0, -0.5, 0]} center>
            <div className="text-glow-blue text-xs font-mono font-bold tracking-widest whitespace-nowrap pointer-events-none">
              [{node.label}]
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

export default function Home() {
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleHeartClick = () => {
    if (!isZoomedIn) {
      setIsZoomedIn(true);
    }
  };

  const handleBack = () => {
    if (activeSection) {
      setActiveSection(null);
    } else {
      setIsZoomedIn(false);
    }
  };

  return (
    <main className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <CameraController isZoomedIn={isZoomedIn} />

          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#ff2a2a" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00d2ff" />

          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          <HeartModel
            isZoomedIn={isZoomedIn}
            onHeartClick={handleHeartClick}
            setHovered={setHovered}
            hovered={hovered}
          />

          <ArteryNodes
            isZoomedIn={isZoomedIn}
            onSectionSelect={(sec) => setActiveSection(sec)}
          />

          <Environment preset="night" />
        </Canvas>
      </div>

      {/* 2D UI Overlay */}
      <CardioSentinelUI section={activeSection} onBack={handleBack} />

      {/* Interaction Cursor overlay effect */}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: hovered && !isZoomedIn ? 'inset 0 0 150px rgba(255, 42, 42, 0.2)' : 'none'
        }}
      />
    </main>
  );
}
