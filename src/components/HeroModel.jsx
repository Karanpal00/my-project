import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';

function AnimatedSphere() {
  const meshRef = useRef();

  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={2}>
        <MeshDistortMaterial
          color="#4facfe"
          attach="material"
          distort={0.6}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.8}
          wireframe={true}
        />
      </Sphere>
    </Float>
  );
}

export default function HeroModel() {
  return (
    <div className="hero-model-container">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={2} color="#00f2fe" />
        <directionalLight position={[-10, -10, -10]} intensity={1} color="#4facfe" />
        <AnimatedSphere />
      </Canvas>
    </div>
  );
}
