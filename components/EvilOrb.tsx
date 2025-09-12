'use client';

import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Sphere, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Evil orb shader material
const EvilOrbMaterial = shaderMaterial(
  {
    time: 0,
    audioLevel: 0,
    color1: new THREE.Color('#8B0000'),
    color2: new THREE.Color('#FF4500'),
    color3: new THREE.Color('#000000'),
  },
  // vertex shader
  `
    uniform float time;
    uniform float audioLevel;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      
      // Add gentle audio-reactive displacement
      vec3 displaced = position + normal * audioLevel * 0.1 * sin(time * 0.8 + position.y * 2.0);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `,
  // fragment shader
  `
    uniform float time;
    uniform float audioLevel;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      // Create gentle pulsing effect
      float pulse = sin(time * 1.2 + audioLevel * 4.0) * 0.3 + 0.7;
      
      // Create subtle texture based on position
      float noise = sin(vPosition.x * 4.0 + time * 0.5) * cos(vPosition.y * 4.0 + time * 0.5) * 0.3 + 0.7;
      
      // Mix colors based on audio and position
      vec3 baseColor = mix(color1, color2, pulse + audioLevel);
      vec3 finalColor = mix(baseColor, color3, noise * 0.3);
      
      // Add subtle rim lighting
      float rim = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
      finalColor += rim * color2 * audioLevel * 0.8;
      
      // Add gentle intensity variation
      float intensity = 0.9 + audioLevel * 0.2 + pulse * 0.1;
      
      gl_FragColor = vec4(finalColor * intensity, 0.9);
    }
  `
);

extend({ EvilOrbMaterial });

// Declare module for TypeScript
declare module '@react-three/fiber' {
  interface ThreeElements {
    evilOrbMaterial: any;
  }
}

interface EvilOrbProps {
  audioLevel: number;
  isActive: boolean;
}

function EvilOrbMesh({ audioLevel, isActive }: EvilOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<any>(null!);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
      materialRef.current.audioLevel = audioLevel;
    }
    
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
      
      // Subtle scaling based on audio and active state
      const scale = isActive ? 1.3 + audioLevel * 0.3 : 1.0 + audioLevel * 0.15;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <evilOrbMaterial ref={materialRef} />
    </Sphere>
  );
}

function ParticleField({ audioLevel }: { audioLevel: number }) {
  const particlesRef = useRef<THREE.Points>(null!);
  
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(100 * 3);
    
    for (let i = 0; i < 100; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.elapsedTime * 0.5 + positions[i]) * 0.005 * (1 + audioLevel * 0.5);
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef} geometry={particlesGeometry}>
      <pointsMaterial
        size={0.05}
        color="#FF4500"
        transparent
        opacity={0.4 + audioLevel * 0.2}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function EvilOrb({ audioLevel, isActive }: EvilOrbProps) {
  return (
    <div className="w-96 h-96 relative">
      <Canvas
        className="three-canvas"
        camera={{ position: [0, 0, 4], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.2} color="#660000" />
        <pointLight position={[0, 0, 5]} intensity={1} color="#FF4500" />
        <pointLight position={[5, 5, 0]} intensity={0.5} color="#8B0000" />
        
        <EvilOrbMesh audioLevel={audioLevel} isActive={isActive} />
        <ParticleField audioLevel={audioLevel} />
        
        <fog attach="fog" args={['#000000', 5, 15]} />
      </Canvas>
      
      {/* Overlay effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className={`absolute inset-0 rounded-full ${isActive ? 'animate-glow' : ''}`}
          style={{
            background: `radial-gradient(circle, rgba(139, 0, 0, ${audioLevel * 0.3}) 0%, transparent 70%)`,
          }}
        />
      </div>
    </div>
  );
}