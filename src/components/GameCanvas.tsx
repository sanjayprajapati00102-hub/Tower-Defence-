import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { MAP_HEIGHT, MAP_WIDTH } from '../game/maps';
import { CanvasRenderer } from '../game/renderer';
import { Point } from '../game/types';

interface GameCanvasProps {
  engine: GameEngine;
  screenShake: boolean;
  onSlotClick: (slotId: string) => void;
  onTowerClick: (towerId: string) => void;
  onGroundClick: () => void;
  onCastSpellAt: (pt: Point) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engine,
  screenShake,
  onSlotClick,
  onTowerClick,
  onGroundClick,
  onCastSpellAt,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const mousePosRef = useRef<Point | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Screen shake trigger from engine
  useEffect(() => {
    if (screenShake) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 250);
      return () => clearTimeout(timer);
    }
  }, [screenShake]);

  // Setup Canvas & High-DPI
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(MAP_WIDTH * dpr);
    canvas.height = Math.round(MAP_HEIGHT * dpr);
    rendererRef.current = new CanvasRenderer(canvas, dpr);

    let animId: number;
    const renderLoop = () => {
      if (rendererRef.current && engine) {
        rendererRef.current.render(engine, mousePosRef.current);
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  // Translate client coordinates into internal 1000x640 virtual coordinates
  const getCanvasCoords = useCallback((clientX: number, clientY: number): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = MAP_WIDTH / rect.width;
    const scaleY = MAP_HEIGHT / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e.clientX, e.clientY);
    mousePosRef.current = pt;
  };

  const handlePointerLeave = () => {
    mousePosRef.current = null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button === 2) {
      onGroundClick();
      return;
    }

    const pt = getCanvasCoords(e.clientX, e.clientY);
    if (!pt) return;

    // 1. If currently targeting a spell, cast it!
    if (engine.targetingSpell) {
      onCastSpellAt(pt);
      return;
    }

    // 2. Check if clicked on a placed tower
    const clickedTower = engine.towers.find(
      (t) => Math.hypot(pt.x - t.x, pt.y - t.y) <= 24
    );
    if (clickedTower) {
      onTowerClick(clickedTower.id);
      return;
    }

    // 3. Check if clicked on an empty build slot
    const clickedSlot = engine.buildSlots.find(
      (s) => Math.hypot(pt.x - s.x, pt.y - s.y) <= s.radius + 6
    );
    if (clickedSlot) {
      if (clickedSlot.towerId) {
        onTowerClick(clickedSlot.towerId);
      } else {
        onSlotClick(clickedSlot.id);
      }
      return;
    }

    // 4. Clicked on ground / path
    onGroundClick();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden transition-transform duration-75 ${
        isShaking ? 'translate-x-1 -translate-y-1' : ''
      }`}
    >
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onContextMenu={(e) => {
          e.preventDefault();
          onGroundClick();
        }}
        className="w-full h-full max-w-full max-h-full object-contain cursor-crosshair select-none shadow-2xl"
        style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}`, touchAction: 'none' }}
      />
    </div>
  );
};
