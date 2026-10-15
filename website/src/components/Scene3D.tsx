import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

// Lightweight 3D backdrops for page heroes. Each page picks a variant:
//   globe   – dotted planet with orbit rings and data arcs (home, news, intel)
//   network – floating node graph (training, portals)
//   crystal – nested wireframe solids (products)
//   rings   – gyroscope security rings (about, assessment, account)
//   radar   – scanning grid disc (cyber range, events)
export type SceneVariant = 'globe' | 'network' | 'crystal' | 'rings' | 'radar';

const BLUE = new THREE.Color('#2f7bff');
const CYAN = new THREE.Color('#22d3ee');

const useReducedMotion = () => useMemo(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, []);

const Spin = ({ speed = 0.12, tilt = 0.35, children }: { speed?: number; tilt?: number; children: React.ReactNode }) => {
  const ref = useRef<THREE.Group>(null);
  const still = useReducedMotion();
  useFrame((state, delta) => {
    if (!ref.current || still) return;
    ref.current.rotation.y += delta * speed;
    ref.current.rotation.x = tilt + Math.sin(state.clock.elapsedTime * 0.25) * 0.05;
  });
  return <group ref={ref} rotation={[tilt, 0, 0]}>{children}</group>;
};

const fibonacciSphere = (count: number, radius: number) => {
  const pts = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    pts.set([Math.cos(t) * r * radius, y * radius, Math.sin(t) * r * radius], i * 3);
  }
  return pts;
};

const Globe = () => {
  const dots = useMemo(() => fibonacciSphere(1400, 1.55), []);
  const arcs = useMemo(() => {
    const out: THREE.Line[] = [];
    const rnd = (seed: number) => { const x = Math.sin(seed * 999) * 10000; return x - Math.floor(x); };
    for (let i = 0; i < 9; i++) {
      const a = new THREE.Vector3().setFromSphericalCoords(1.56, rnd(i + 1) * Math.PI, rnd(i + 7) * Math.PI * 2);
      const b = new THREE.Vector3().setFromSphericalCoords(1.56, rnd(i + 3) * Math.PI, rnd(i + 11) * Math.PI * 2);
      const mid = a.clone().add(b).normalize().multiplyScalar(2.3);
      const g = new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(40));
      out.push(new THREE.Line(g, new THREE.LineBasicMaterial({ color: i % 2 ? CYAN : BLUE, transparent: true, opacity: 0.75 })));
    }
    return out;
  }, []);
  return (
    <Spin speed={0.08} tilt={0.3}>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[dots, 3]} /></bufferGeometry>
        <pointsMaterial color={BLUE} size={0.022} transparent opacity={0.85} />
      </points>
      <mesh>
        <sphereGeometry args={[1.5, 40, 40]} />
        <meshBasicMaterial color="#0b2a66" transparent opacity={0.35} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.53, 24, 18]} />
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.08} />
      </mesh>
      {arcs.map((line, i) => <primitive key={i} object={line} />)}
      {[2.05, 2.35].map((r, i) => (
        <mesh key={r} rotation={[Math.PI / 2 + (i ? 0.35 : -0.2), 0, 0]}>
          <torusGeometry args={[r, 0.006, 8, 160]} />
          <meshBasicMaterial color={i ? CYAN : BLUE} transparent opacity={0.55} />
        </mesh>
      ))}
    </Spin>
  );
};

const Network = () => {
  const { points, lines } = useMemo(() => {
    const n = 70;
    const pts: THREE.Vector3[] = [];
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < n; i++) pts.push(new THREE.Vector3((rnd() - 0.5) * 4.4, (rnd() - 0.5) * 3, (rnd() - 0.5) * 2.4));
    const seg: number[] = [];
    pts.forEach((a, i) => pts.forEach((b, j) => { if (j > i && a.distanceTo(b) < 1.05) seg.push(a.x, a.y, a.z, b.x, b.y, b.z); }));
    return { points: new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z])), lines: new Float32Array(seg) };
  }, []);
  return (
    <Spin speed={0.06} tilt={0.1}>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[points, 3]} /></bufferGeometry>
        <pointsMaterial color={CYAN} size={0.07} transparent opacity={0.95} />
      </points>
      <lineSegments>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[lines, 3]} /></bufferGeometry>
        <lineBasicMaterial color={BLUE} transparent opacity={0.45} />
      </lineSegments>
    </Spin>
  );
};

const Crystal = () => (
  <Spin speed={0.18} tilt={0.4}>
    <mesh><icosahedronGeometry args={[1.45, 1]} /><meshBasicMaterial color={BLUE} wireframe transparent opacity={0.65} /></mesh>
    <mesh rotation={[0.6, 0.3, 0]}><octahedronGeometry args={[0.85, 0]} /><meshBasicMaterial color={CYAN} wireframe transparent opacity={0.9} /></mesh>
    <mesh><icosahedronGeometry args={[0.55, 0]} /><meshBasicMaterial color="#1d4ed8" transparent opacity={0.55} /></mesh>
    <mesh rotation={[Math.PI / 2.4, 0, 0]}><torusGeometry args={[2.1, 0.008, 8, 160]} /><meshBasicMaterial color={CYAN} transparent opacity={0.5} /></mesh>
  </Spin>
);

const Rings = () => {
  const refs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  const still = useReducedMotion();
  useFrame((_, d) => {
    if (still) return;
    refs.forEach((r, i) => { if (r.current) { r.current.rotation.x += d * (0.2 + i * 0.12); r.current.rotation.y += d * (0.15 + i * 0.08); } });
  });
  return (
    <group>
      {[1.9, 1.5, 1.1].map((r, i) => (
        <mesh key={r} ref={refs[i]} rotation={[i, i * 0.6, 0]}>
          <torusGeometry args={[r, 0.02, 12, 180]} />
          <meshBasicMaterial color={i === 1 ? CYAN : BLUE} transparent opacity={0.85} />
        </mesh>
      ))}
      <mesh><sphereGeometry args={[0.55, 32, 32]} /><meshBasicMaterial color="#1d4ed8" transparent opacity={0.35} /></mesh>
      <mesh><sphereGeometry args={[0.6, 16, 12]} /><meshBasicMaterial color={CYAN} wireframe transparent opacity={0.35} /></mesh>
    </group>
  );
};

const Radar = () => {
  const sweep = useRef<THREE.Mesh>(null);
  const still = useReducedMotion();
  useFrame((_, d) => { if (sweep.current && !still) sweep.current.rotation.z -= d * 0.9; });
  const blips = useMemo(() => [[0.8, 0.5], [-1.1, 0.7], [0.3, -1.2], [-0.5, -0.4], [1.4, -0.6]], []);
  return (
    <group rotation={[-1.05, 0, 0.2]}>
      {[0.6, 1.2, 1.8, 2.4].map((r) => (
        <mesh key={r}><ringGeometry args={[r - 0.008, r + 0.008, 128]} /><meshBasicMaterial color={BLUE} transparent opacity={0.6} side={THREE.DoubleSide} /></mesh>
      ))}
      <mesh><circleGeometry args={[2.4, 64]} /><meshBasicMaterial color="#0b2a66" transparent opacity={0.35} /></mesh>
      <mesh ref={sweep}><circleGeometry args={[2.4, 48, 0, Math.PI / 3]} /><meshBasicMaterial color={CYAN} transparent opacity={0.22} side={THREE.DoubleSide} /></mesh>
      {blips.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.02]}><circleGeometry args={[0.06, 16]} /><meshBasicMaterial color={i % 2 ? CYAN : '#ff6b6b'} /></mesh>
      ))}
      <gridHelper args={[4.8, 16, '#1d4ed8', '#1d4ed8']} rotation={[Math.PI / 2, 0, 0]} material-transparent material-opacity={0.18} />
    </group>
  );
};

const VARIANTS: Record<SceneVariant, () => JSX.Element> = { globe: Globe, network: Network, crystal: Crystal, rings: Rings, radar: Radar };

/** A 3D scene that only animates while it is on screen. */
const Scene3D = ({ variant = 'globe', className = '' }: { variant?: SceneVariant; className?: string }) => {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!box.current || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px' });
    io.observe(box.current);
    return () => io.disconnect();
  }, []);
  const Variant = VARIANTS[variant] || Globe;
  return (
    <div ref={box} className={className} aria-hidden="true">
      <Canvas frameloop={visible ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0, variant === 'globe' ? 6.4 : variant === 'radar' ? 5.6 : 5.2], fov: 45 }} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}>
        <Variant />
      </Canvas>
    </div>
  );
};

export default Scene3D;
