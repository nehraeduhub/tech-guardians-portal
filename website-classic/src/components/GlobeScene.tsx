import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

const Globe = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.12;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2, 42, 42]} />
      <meshBasicMaterial color="#00D4FF" wireframe transparent opacity={0.22} />
    </mesh>
  );
};

const OrbitRing = ({ radius, speed, color }: { radius: number; speed: number; color: string }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * speed;
      ref.current.rotation.z = clock.getElapsedTime() * speed * 0.6;
    }
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.008, 12, 90]} />
      <meshBasicMaterial color={color} transparent opacity={0.45} />
    </mesh>
  );
};

/* Decorative rotating 3D globe used as a section background */
const GlobeScene = () => (
  <div className="absolute inset-0 pointer-events-none opacity-60">
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <Globe />
        <OrbitRing radius={2.7} speed={0.25} color="#00D4FF" />
        <OrbitRing radius={3.2} speed={-0.18} color="#00FF9C" />
        <OrbitRing radius={3.7} speed={0.12} color="#FF9F1C" />
      </Suspense>
    </Canvas>
  </div>
);

export default GlobeScene;
