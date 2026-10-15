import { lazy, Suspense } from 'react';
import type { SceneVariant } from '../Scene3D';

const Scene3D = lazy(() => import('../Scene3D'));

/** 3D scene loaded on demand, so pages render before three.js arrives. */
const LazyScene = ({ variant, className = '' }: { variant: SceneVariant; className?: string }) => (
  <Suspense fallback={<div className={className} aria-hidden="true" />}>
    <Scene3D variant={variant} className={className} />
  </Suspense>
);

export default LazyScene;
