import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';

export default function AIPanel({ isThinking = false, isSpeaking = false, isDisconnected = false }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    // Speed up rotation when thinking or speaking
    const speedMultiplier = isThinking ? 3 : isSpeaking ? 1.5 : 0.5;
    meshRef.current.rotation.y += 0.01 * speedMultiplier;
    meshRef.current.rotation.x += 0.005 * speedMultiplier;
  });

  const color = isDisconnected ? "#ef4444" : isThinking ? "#f59e0b" : "#818cf8";
  const emissiveColor = isDisconnected ? "#991b1b" : isThinking ? "#b45309" : "#4f46e5";
  const distortAmount = isSpeaking ? 0.6 : isThinking ? 0.3 : 0.4;
  const speed = isSpeaking ? 4 : isThinking ? 2 : 2;

  return (
    <Float speed={speed} rotationIntensity={isThinking ? 1.5 : 0.5} floatIntensity={isThinking ? 2 : 1}>
      <mesh ref={meshRef}>
        {/* Wireframe outer structure */}
        <icosahedronGeometry args={[2.5, 1]} />
        <meshBasicMaterial color={emissiveColor} wireframe={true} transparent opacity={0.3} />
        
        {/* Solid inner core */}
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <MeshDistortMaterial 
            color={color} 
            attach="material" 
            distort={distortAmount} 
            speed={speed} 
            roughness={0.2} 
            metalness={0.8}
            emissive={emissiveColor}
            emissiveIntensity={1}
          />
        </mesh>
      </mesh>
    </Float>
  );
}
