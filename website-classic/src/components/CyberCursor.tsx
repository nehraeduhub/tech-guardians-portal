import { useEffect, useRef } from 'react';

const CyberCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX - 10}px`;
        cursorRef.current.style.top = `${e.clientY - 10}px`;
      }
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX - 2}px`;
        dotRef.current.style.top = `${e.clientY - 2}px`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.body.style.cursor = 'none';
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = '';
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="cyber-cursor hidden md:block" />
      <div ref={dotRef} className="cyber-cursor-dot hidden md:block" />
    </>
  );
};

export default CyberCursor;
