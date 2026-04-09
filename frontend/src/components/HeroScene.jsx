import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Stars, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';

function Robot({ hovered }) {
  const robotRef = useRef();
  
  useFrame((state) => {
    if (robotRef.current) {
      // Gentle breathing/floating
      robotRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      
      if (hovered) {
        // Look at mouse
        const targetRot = Math.atan2(state.mouse.x * 5, 10);
        robotRef.current.rotation.y += (targetRot - robotRef.current.rotation.y) * 0.1;
      } else {
        robotRef.current.rotation.y += ((-0.3) - robotRef.current.rotation.y) * 0.05;
      }
    }
  });

  return (
    <group ref={robotRef} position={[3, -0.5, -2]}>
      {/* Torso */}
      <mesh>
        <boxGeometry args={[1.4, 1.8, 0.7]} />
        <meshStandardMaterial color="#1a2535" roughness={0.7} metalness={0.4} />
      </mesh>
      
      {/* Head */}
      <group position={[0, 1.4, 0]}>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#1a2535" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.25, 0.1, 0.51]}>
          <planeGeometry args={[0.3, 0.15]} />
          <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={2} />
        </mesh>
        <mesh position={[0.25, 0.1, 0.51]}>
          <planeGeometry args={[0.3, 0.15]} />
          <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* Arms */}
      <mesh position={[-0.9, 0.3, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.15, 0.15, 1]} />
        <meshStandardMaterial color="#1a2535" />
      </mesh>
      <group position={[0.9, 0.8, 0]} rotation={[0, 0, -2.5]}>
         <mesh position={[0, -0.5, 0]}>
           <cylinderGeometry args={[0.15, 0.15, 1]} />
           <meshStandardMaterial color="#1a2535" />
         </mesh>
      </group>
    </group>
  );
}

function Office() {
  return (
    <group position={[0, -2, 0]}>
      {/* Desk */}
      <mesh>
        <boxGeometry args={[8, 0.4, 4]} />
        <meshStandardMaterial color="#1a2535" metalness={0.4} />
      </mesh>
      
      {/* Laptop */}
      <group position={[-1, 0.5, 0]}>
        <mesh>
          <boxGeometry args={[2, 0.1, 1.5]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 0.6, -0.7]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[2, 1.2, 0.05]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Screen Glow */}
        <pointLight position={[0, 0.5, 0]} intensity={2} color="#00ccff" distance={5} />
      </group>
      
      {/* Floating Papers */}
      {[...Array(5)].map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={2} floatIntensity={1}>
          <mesh position={[(Math.random()-0.5)*6, Math.random()*3, (Math.random()-0.5)*3]}>
            <planeGeometry args={[0.4, 0.6]} />
            <meshStandardMaterial color="#d0e8f8" side={THREE.DoubleSide} transparent opacity={0.8} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function HeroScene() {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
      <ambientLight intensity={0.6} />
      <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
      <pointLight position={[-5, 5, 5]} intensity={1} color="#7700ff" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <group position={[-1, 0, 0]} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <Robot hovered={hovered} />
      </group>
      
      <Office />
      
      <fog attach="fog" args={['#010208', 5, 30]} />
    </>
  );
}
