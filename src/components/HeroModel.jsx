import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  MeshDistortMaterial, 
  MeshTransmissionMaterial, 
  Environment, 
  ContactShadows,
  PerspectiveCamera,
  Float
} from '@react-three/drei';
import { Physics, useSphere, usePointToPointConstraint } from '@react-three/cannon';
import * as THREE from 'three';

function DraggableSphere({ position, size = 1, color, transmission = false, distort = 0.3, geometry }) {
  const { mouse, viewport } = useThree();
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 1. Physics Body
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position,
    args: [size],
    linearDamping: 0.95,
    angularDamping: 0.95,
  }));

  // Track position for dragging
  const pos = useRef(position);
  useEffect(() => {
    const unsubscribe = api.position.subscribe((p) => (pos.current = p));
    return unsubscribe;
  }, [api]);

  const scale = useRef(1);
  const outOfBoundsTime = useRef(0);

  useFrame((state, delta) => {
    // Dramatic scale-in animation
    scale.current = THREE.MathUtils.lerp(scale.current, 1, 0.1);
    if (ref.current) {
      ref.current.scale.set(scale.current, scale.current, scale.current);
    }

    // Bounds check to respawn items thrown off-screen
    const boundX = viewport.width / 2 + size;
    const boundY = viewport.height / 2 + size;
    
    const isOut = Math.abs(pos.current[0]) > boundX || 
                  Math.abs(pos.current[1]) > boundY || 
                  pos.current[2] > 10 || pos.current[2] < -25;

    if (isOut && !isDragging) {
      outOfBoundsTime.current += delta;
      if (outOfBoundsTime.current > 2) {
        // Dramatic Respawn: Shoot in from deep space
        api.position.set(position[0] + (Math.random() * 4 - 2), position[1] + (Math.random() * 4 - 2), -20);
        api.velocity.set(Math.random() * 10 - 5, Math.random() * 10 - 5, 60); 
        api.angularVelocity.set(Math.random() * 20, Math.random() * 20, Math.random() * 20);
        scale.current = 0;
        outOfBoundsTime.current = 0;
      }
    } else {
      outOfBoundsTime.current = 0;
    }

    if (isDragging) {
      const targetX = (mouse.x * viewport.width) / 2;
      const targetY = (mouse.y * viewport.height) / 2;
      
      const dx = targetX - pos.current[0];
      const dy = targetY - pos.current[1];
      const dz = 0 - pos.current[2];
      
      api.velocity.set(dx * 10, dy * 10, dz * 10);
    } else {
      api.applyForce([Math.sin(Date.now() * 0.001) * 0.5, Math.cos(Date.now() * 0.001) * 0.5, 0], [0, 0, 0]);
    }
  });

  return (
    <mesh
      ref={ref}
      onPointerDown={(e) => { e.stopPropagation(); setIsDragging(true); e.target.setPointerCapture(e.pointerId); }}
      onPointerUp={(e) => { setIsDragging(false); e.target.releasePointerCapture(e.pointerId); }}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'grab'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {geometry || <sphereGeometry args={[size, 32, 32]} />}
      {transmission ? (
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.5}
          chromaticAberration={0.05}
          anisotropy={0.1}
          distortion={0.2}
          color={color}
          transparent
          opacity={0.8}
        />
      ) : (
        <MeshDistortMaterial
          color={color}
          speed={2}
          distort={distort}
          radius={1}
          roughness={0.2}
          metalness={0.8}
        />
      )}
    </mesh>
  );
}

function Scene() {
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;
  
  // Responsive positions
  const getPos = (x, y, z) => isMobile ? [x * 0.4, y * 0.4, z] : [x, y, z];

  return (
    <>
      <Physics gravity={[0, 0, 0]} iterations={10}>
        {/* Central Node */}
        <DraggableSphere 
          position={getPos(0, 0, 0)} 
          size={isMobile ? 1 : 1.5} 
          transmission 
          color="#ffffff" 
          geometry={<icosahedronGeometry args={[isMobile ? 1 : 1.5, 15]} />}
        />
        
        {/* Torus */}
        <DraggableSphere 
          position={getPos(-4, 3, 0)} 
          size={0.8} 
          color="#4facfe" 
          distort={0.4}
          geometry={<torusGeometry args={[0.6, 0.2, 16, 32]} />}
        />
        
        {/* Octahedron */}
        <DraggableSphere 
          position={getPos(5, -2, 0)} 
          size={0.8} 
          color="#00f2fe" 
          distort={0.3}
          geometry={<octahedronGeometry args={[0.8]} />}
        />

        {/* Floating Sphere */}
        <DraggableSphere 
          position={getPos(-5, -3, 0)} 
          size={0.6} 
          color="#ffffff" 
          distort={0.5}
        />

        {/* Small Node */}
        <DraggableSphere 
          position={getPos(4, 4, 0)} 
          size={0.5} 
          color="#4facfe" 
          distort={0.2}
          geometry={<icosahedronGeometry args={[0.5, 2]} />}
        />
      </Physics>
      
      <Environment preset="city" />
      <ContactShadows position={[0, -5, 0]} opacity={0.3} scale={30} blur={3} far={10} />
    </>
  );
}

export default function HeroModel() {
  return (
    <div className="hero-model-container">
      <Canvas shadows dpr={[1, 2]} gl={{ alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} />
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#4facfe" />
        <Scene />
      </Canvas>
    </div>
  );
}
