'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Icosahedron, MeshDistortMaterial, Sphere, Float } from '@react-three/drei';
import gsap from 'gsap';

interface HeartModelProps {
    isZoomedIn: boolean;
    onHeartClick: () => void;
    setHovered: (state: boolean) => void;
    hovered: boolean;
}

export default function HeartModel({ isZoomedIn, onHeartClick, setHovered, hovered }: HeartModelProps) {
    const heartRef = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    const arteriesRef = useRef<THREE.Group>(null);

    // Heartbeat animation
    useFrame(({ clock }) => {
        if (!heartRef.current || isZoomedIn) return;

        const t = clock.getElapsedTime();
        // Simulate heartbeat (systole/diastole)
        const beat = Math.sin(t * 4) * Math.pow(Math.sin(t * 4), 2) + Math.sin(t * 4 + 0.1);
        const scale = 1 + beat * 0.05 + (hovered ? 0.05 : 0);
        heartRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);

        if (coreRef.current) {
            // Rotate the core slowly
            coreRef.current.rotation.x = t * 0.2;
            coreRef.current.rotation.y = t * 0.3;

            // Pulse emission
            const material = coreRef.current.material as THREE.MeshStandardMaterial;
            material.emissiveIntensity = 0.5 + beat * 0.5 + (hovered ? 0.5 : 0);
        }
    });

    const generateArteries = () => {
        const branches = [];
        for (let i = 0; i < 20; i++) {
            const radius = 2 + Math.random() * 2;
            const height = 10 + Math.random() * 10;
            const angle = (Math.PI * 2 * i) / 20;

            branches.push(
                <mesh
                    key={i}
                    position={[Math.cos(angle) * 3, Math.random() * 4 - 2, Math.sin(angle) * 3]}
                    rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
                >
                    <cylinderGeometry args={[0.05, 0.2, height, 8]} />
                    <meshStandardMaterial
                        color="#ff2a2a"
                        emissive="#aa0000"
                        emissiveIntensity={isZoomedIn ? 1 : 0.2}
                        transparent
                        opacity={isZoomedIn ? 0.8 : 0}
                        wireframe={isZoomedIn}
                    />
                </mesh>
            );
        }
        return branches;
    };

    return (
        <group>
            {/* Interactive area */}
            <mesh
                visible={false}
                scale={3}
                onClick={(e) => {
                    e.stopPropagation();
                    onHeartClick();
                }}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial />
            </mesh>

            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <group ref={heartRef}>
                    {/* Main glowing core */}
                    <Icosahedron ref={coreRef} args={[1.5, 4]} visible={!isZoomedIn}>
                        <MeshDistortMaterial
                            color="#ff0044"
                            emissive="#ff1133"
                            emissiveIntensity={1}
                            distort={0.4}
                            speed={3}
                            roughness={0.2}
                            metalness={0.8}
                            wireframe={false}
                        />
                    </Icosahedron>

                    {/* Outer tech shell */}
                    <Icosahedron args={[1.8, 2]} visible={!isZoomedIn}>
                        <meshStandardMaterial
                            color="#ff2a2a"
                            wireframe
                            transparent
                            opacity={0.3}
                        />
                    </Icosahedron>

                    {/* Arteries (Visible when zoomed in or hovering) */}
                    <group ref={arteriesRef}>
                        {generateArteries()}
                    </group>
                </group>
            </Float>

            {/* Blood particles / Neural network nodes inside */}
            {isZoomedIn && (
                <Particles />
            )}
        </group>
    );
}

function Particles() {
    const count = 500;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    useFrame(() => {
        if (!mesh.current) return;
        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);
            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );
            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#ff2a85" transparent opacity={0.6} />
        </instancedMesh>
    );
}
