import { useEffect, useRef } from 'react';

interface MatrixRainProps {
  opacity?: number;
  fontSize?: number;
  color?: string;
  className?: string;
}

/**
 * Cyberpunk Matrix-style falling characters background.
 * Renders to canvas, sized to its parent. Position parent as `relative`.
 */
const MatrixRain = ({
  opacity = 0.35,
  fontSize = 16,
  color = '#00FF9C',
  className = '',
}: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let drops: number[] = [];
    const chars =
      'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>/\\#@$%*+=-{}[]:;|';

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth ?? window.innerWidth;
      const h = parent?.clientHeight ?? window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const columns = Math.floor(w / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -50);
    };
    resize();

    let last = 0;
    const interval = 55; // ms between frames -> slower, smoother fall

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < interval) return;
      last = t;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      // Trail fade
      ctx.fillStyle = 'rgba(2, 6, 23, 0.08)';
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px ui-monospace, "Fira Code", monospace`;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;

      for (let i = 0; i < drops.length; i++) {
        const ch = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        // brighten the leading char
        if (Math.random() > 0.975) ctx.fillStyle = '#FFFFFF';
        else ctx.fillStyle = color;
        ctx.fillText(ch, x, y);

        if (y > h && Math.random() > 0.965) drops[i] = 0;
        drops[i] += 1;
      }
    };
    raf = requestAnimationFrame(draw);

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [fontSize, color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ opacity, mixBlendMode: 'screen' }}
    />
  );
};

export default MatrixRain;
