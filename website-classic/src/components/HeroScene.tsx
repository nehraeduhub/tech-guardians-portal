import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

/* 3D Shield – distorted sphere with orbiting rings */
const ShieldSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
    }
  });
  return (
    <Sphere ref={meshRef} args={[1.8, 64, 64]}>
      <MeshDistortMaterial
        color="#00D4FF"
        emissive="#00D4FF"
        emissiveIntensity={0.2}
        roughness={0.15}
        metalness={0.85}
        wireframe
        distort={0.25}
        speed={1.5}
      />
    </Sphere>
  );
};

const FloatingRing = ({ radius, speed, color }: { radius: number; speed: number; color: string }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * speed;
      ref.current.rotation.z = clock.getElapsedTime() * speed * 0.5;
    }
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.012, 16, 100]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.7} />
    </mesh>
  );
};

/* Data particles orbiting */
const DataParticles = () => {
  const ref = useRef<THREE.Points>(null);
  const count = 200;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = 2.5 + Math.random() * 2;
    positions[i * 3] = Math.cos(angle) * r;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
    positions[i * 3 + 2] = Math.sin(angle) * r;
  }

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#00FF9C" size={0.03} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
};

const HeroScene = () => (
  <div className="absolute inset-0 opacity-75">
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#00D4FF" />
        <pointLight position={[-5, -3, 3]} intensity={0.4} color="#00FF9C" />
        <pointLight position={[0, -5, 2]} intensity={0.3} color="#FF3B3B" />
        <ShieldSphere />
        <FloatingRing radius={2.5} speed={0.3} color="#00D4FF" />
        <FloatingRing radius={3} speed={-0.2} color="#00FF9C" />
        <FloatingRing radius={3.5} speed={0.15} color="#FF9F1C" />
        <DataParticles />
      </Suspense>
    </Canvas>
  </div>
);

export default HeroScene;
