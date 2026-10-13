import { MAP_HEIGHT, MAP_WIDTH, SPELL_DEFINITIONS } from './maps';
import { TOWER_DEFINITIONS } from './towers';
import { GameEngine } from './engine';
import {
  BuildSlot,
  EnemyInstance,
  FloatingText,
  GroundDecal,
  LightningArc,
  Particle,
  Point,
  Projectile,
  SceneryElement,
  Shockwave,
  TowerInstance,
} from './types';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private width: number = MAP_WIDTH;
  private height: number = MAP_HEIGHT;
  private dpr: number = 1;

  constructor(canvas: HTMLCanvasElement, dpr = 1) {
    this.canvas = canvas;
    this.dpr = dpr;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
  }

  public render(engine: GameEngine, mousePos: Point | null) {
    const ctx = this.ctx;
    const time = performance.now();
    ctx.save();
    if (this.dpr !== 1) {
      ctx.scale(this.dpr, this.dpr);
    }

    // Clear background
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Environmental Terrain & Paths
    this.drawTerrain(engine, time);
    this.drawPath(engine, time);
    this.drawScenery(engine, time);

    // 2. Draw Map Hazards & Environmental Boons
    this.drawMapHazards(engine, time);

    // 3. Draw Ground Decals (craters, scorch marks)
    this.drawGroundDecals(engine);

    // 3. Draw Build Slots
    this.drawBuildSlots(engine, mousePos, time);

    // 4. Draw Towers
    this.drawTowers(engine, time);

    // 5. Draw Enemies
    this.drawEnemies(engine, time);

    // 6. Draw Projectiles & Trails
    this.drawProjectiles(engine);

    // 7. Draw Lightning Arcs, Shockwaves & Particles
    this.drawShockwaves(engine);
    this.drawLightningArcs(engine);
    this.drawParticles(engine);

    // 8. Draw Range Rings & Selection Highlights
    this.drawSelectionOverlays(engine, mousePos, time);

    // 9. Draw Spell Targeting Reticle
    if (engine.targetingSpell && mousePos) {
      this.drawSpellReticle(engine, mousePos, time);
    }

    // 10. Draw Floating Combat Text
    this.drawFloatingTexts(engine);

    ctx.restore();
  }

  // --- Terrain & Paths ---

  private drawTerrain(engine: GameEngine, time: number) {
    const ctx = this.ctx;
    const theme = engine.currentMap.theme;

    if (theme === 'GRASSLAND') {
      const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
      grad.addColorStop(0, '#193f2f');
      grad.addColorStop(0.5, '#16382a');
      grad.addColorStop(1, '#0f291e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Subtle textured grass patches with wind sway
      ctx.fillStyle = 'rgba(45, 106, 79, 0.22)';
      for (let i = 0; i < 48; i++) {
        const x = (i * 97) % this.width;
        const y = (i * 73) % this.height;
        const sway = Math.sin(time * 0.002 + x * 0.05) * 2;
        ctx.beginPath();
        ctx.ellipse(x + sway, y, 16, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wildflower flecks
      for (let i = 0; i < 20; i++) {
        const x = (i * 157 + 30) % (this.width - 60);
        const y = (i * 123 + 40) % (this.height - 60);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(251, 191, 36, 0.6)' : 'rgba(167, 139, 250, 0.6)';
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (theme === 'FROZEN') {
      const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
      grad.addColorStop(0, '#0c2333');
      grad.addColorStop(0.5, '#091c2b');
      grad.addColorStop(1, '#05131e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Ice crystals & frosty sheen
      ctx.fillStyle = 'rgba(125, 211, 252, 0.12)';
      for (let i = 0; i < 40; i++) {
        const x = (i * 113) % this.width;
        const y = (i * 89) % this.height;
        const glint = (Math.sin(time * 0.003 + i) + 1) * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 16 + glint * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Specular diamond glints
      for (let i = 0; i < 15; i++) {
        const x = (i * 181 + 50) % (this.width - 50);
        const y = (i * 139 + 30) % (this.height - 50);
        const alpha = Math.max(0, Math.sin(time * 0.004 + i));
        ctx.fillStyle = `rgba(224, 242, 254, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // VOLCANIC
      const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
      grad.addColorStop(0, '#180d0f');
      grad.addColorStop(0.5, '#13080a');
      grad.addColorStop(1, '#0c0406');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Glowing ember fissures
      for (let i = 0; i < 30; i++) {
        const x = (i * 127) % this.width;
        const y = (i * 67) % this.height;
        const pulse = (Math.sin(time * 0.0025 + i) + 1) * 0.5;
        ctx.fillStyle = `rgba(239, 68, 68, ${0.05 + pulse * 0.08})`;
        ctx.beginPath();
        ctx.arc(x, y, 20 + pulse * 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawPath(engine: GameEngine, time: number) {
    const ctx = this.ctx;
    const waypoints = engine.currentMap.waypoints;
    if (waypoints.length < 2) return;

    const pathWidth = 48;

    // Outer stone foundation border
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = pathWidth + 12;
    ctx.strokeStyle = engine.currentMap.pathBorderColor;
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    ctx.stroke();

    // Main road surface
    ctx.lineWidth = pathWidth;
    ctx.strokeStyle = engine.currentMap.pathColor;
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    ctx.stroke();

    // Cobblestone flagstone relief along path
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const steps = Math.floor(dist / 22);

      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const sx = p1.x + (p2.x - p1.x) * t;
        const sy = p1.y + (p2.y - p1.y) * t;
        const offset = ((s % 3) - 1) * 10;
        const perpX = -(p2.y - p1.y) / dist;
        const perpY = (p2.x - p1.x) / dist;

        ctx.fillStyle = s % 2 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)';
        ctx.beginPath();
        ctx.arc(sx + perpX * offset, sy + perpY * offset, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Draw Grand Entrance Portal & Kingdom Castle Gateway
    this.drawEntrancePortal(waypoints[0], time);
    this.drawCastleGateway(waypoints[waypoints.length - 1], engine.lives, engine.maxLives, time);
  }

  private drawEntrancePortal(pt: Point, time: number) {
    const ctx = this.ctx;
    ctx.save();

    // Dark void background
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 24, 0, Math.PI * 2);
    ctx.fill();

    // Swirling dimensional vortex
    const rot = time * 0.003;
    ctx.translate(pt.x, pt.y);
    ctx.rotate(rot);

    // Glowing purple/red swirl spiral arms
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      const grad = ctx.createLinearGradient(0, 0, 26, 0);
      grad.addColorStop(0, '#ef4444');
      grad.addColorStop(0.5, '#a855f7');
      grad.addColorStop(1, 'transparent');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(10, 0, 14, 0, Math.PI);
      ctx.stroke();
    }

    // Outer runic stone ring
    ctx.rotate(-rot);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();

    // Center pulsating core
    const corePulse = (Math.sin(time * 0.006) + 1) * 0.5;
    ctx.fillStyle = '#f87171';
    ctx.shadowColor = '#f87171';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, 6 + corePulse * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawCastleGateway(pt: Point, lives: number, maxLives: number, time: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(pt.x, pt.y);

    // Heavy castle stone archway
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 10;

    // Stone towers flanking gate
    ctx.fillRect(-18, -20, 10, 40);
    ctx.strokeRect(-18, -20, 10, 40);
    ctx.fillRect(8, -20, 10, 40);
    ctx.strokeRect(8, -20, 10, 40);

    // Portcullis center
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-8, -16, 16, 32);

    // Iron gate bars
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, -16);
    ctx.lineTo(-4, 16);
    ctx.moveTo(0, -16);
    ctx.lineTo(0, 16);
    ctx.moveTo(4, -16);
    ctx.lineTo(4, 16);
    ctx.stroke();

    // Blue royal banner
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(-6, -26, 12, 8);

    // Mana beacon crystal on roof
    const isLowHp = lives <= maxLives * 0.25;
    const beaconColor = isLowHp ? '#ef4444' : '#38bdf8';
    const beaconPulse = (Math.sin(time * 0.005) + 1) * 0.5;

    ctx.fillStyle = beaconColor;
    ctx.shadowColor = beaconColor;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, -22, 4 + beaconPulse * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- Map Hazards & Tactical Boons ---

  private drawMapHazards(engine: GameEngine, time: number) {
    const ctx = this.ctx;
    engine.activeHazards.forEach((h) => {
      ctx.save();
      if (h.def.type === 'SHRINE' && h.def.x !== undefined && h.def.y !== undefined) {
        const x = h.def.x;
        const y = h.def.y;
        const rad = h.def.radius || 170;

        // Ancient Sun Shrine base
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = h.isActive ? '#fbbf24' : '#475569';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Altar sun emblem
        ctx.fillStyle = h.isActive ? '#f59e0b' : '#64748b';
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();

        // Active solar blessing radius aura
        if (h.isActive) {
          const pulse = (Math.sin(time * 0.005) + 1) * 0.5;
          ctx.fillStyle = `rgba(251, 191, 36, ${0.08 + pulse * 0.06})`;
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.arc(x, y, rad, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Rotating celestial glyphs
          ctx.setLineDash([]);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 28 + pulse * 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (h.def.type === 'BLIZZARD' && h.isActive) {
        // Sweeping arctic blizzard over the pass
        ctx.fillStyle = 'rgba(186, 230, 253, 0.12)';
        ctx.fillRect(0, 0, this.width, this.height);

        // Wind drift lines
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.4)';
        ctx.lineWidth = 1.5;
        for (let b = 0; b < 10; b++) {
          const startX = ((time * 0.4 + b * 130) % (this.width + 200)) - 100;
          const y = (b * 60 + 20) % this.height;
          ctx.beginPath();
          ctx.moveTo(startX, y);
          ctx.lineTo(startX + 90, y + 10);
          ctx.stroke();
        }
      } else if (h.def.type === 'LAVA_GEYSER' && h.def.x !== undefined && h.def.y !== undefined) {
        const x = h.def.x;
        const y = h.def.y;
        const r = h.def.radius || 75;

        // Volcanic fissure vent
        ctx.fillStyle = '#1c1917';
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y, 22, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (h.isActive) {
          // Erupting geyser plume
          const flamePulse = (Math.sin(time * 0.015) + 1) * 0.5;
          ctx.fillStyle = `rgba(239, 68, 68, ${0.28 + flamePulse * 0.15})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(x, y - 8 - flamePulse * 10, 14 + flamePulse * 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (h.cycleTimer <= 1.5) {
          // Warning smoke
          ctx.fillStyle = 'rgba(120, 113, 108, 0.45)';
          ctx.beginPath();
          ctx.arc(x, y - 10, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    });
  }

  private drawScenery(engine: GameEngine, time: number) {
    const ctx = this.ctx;
    const scenery = engine.currentMap.sceneryElements;

    scenery.forEach((elem: SceneryElement) => {
      ctx.save();
      if (elem.type === 'TREE') {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(elem.x + 4, elem.y + 6, elem.radius * 0.9, elem.radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wind sway
        const sway = Math.sin(time * 0.002 + elem.x * 0.02) * 2;

        // Tree Canopy layers
        ctx.fillStyle = elem.variant === 1 ? '#15803d' : elem.variant === 2 ? '#166534' : '#14532d';
        ctx.beginPath();
        ctx.arc(elem.x + sway, elem.y, elem.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight layer
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.arc(elem.x + sway - elem.radius * 0.3, elem.y - elem.radius * 0.3, elem.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      } else if (elem.type === 'WATER') {
        // River pond with animated wave caustics
        const pulse = Math.sin(time * 0.003 + elem.x) * 3;
        const grad = ctx.createRadialGradient(elem.x, elem.y, 5, elem.x, elem.y, elem.radius + pulse);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(0.6, '#0284c7');
        grad.addColorStop(1, '#075985');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(elem.x, elem.y, elem.radius + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Water sparkle rings
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(elem.x, elem.y, elem.radius * 0.6 + pulse * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      } else if (elem.type === 'ROCK') {
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.ellipse(elem.x, elem.y, elem.radius, elem.radius * 0.7, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath();
        ctx.arc(elem.x - elem.radius * 0.2, elem.y - elem.radius * 0.2, elem.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
      } else if (elem.type === 'CRYSTAL') {
        const glint = (Math.sin(time * 0.004 + elem.x) + 1) * 0.5;
        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10 * glint;

        ctx.beginPath();
        ctx.moveTo(elem.x, elem.y - elem.radius);
        ctx.lineTo(elem.x + elem.radius * 0.7, elem.y);
        ctx.lineTo(elem.x, elem.y + elem.radius);
        ctx.lineTo(elem.x - elem.radius * 0.7, elem.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (elem.type === 'LAVA_POOL') {
        const rad = elem.radius;
        const bubble = Math.sin(time * 0.0035 + elem.x) * 3;
        const grad = ctx.createRadialGradient(elem.x, elem.y, 4, elem.x, elem.y, rad + bubble);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.4, '#ea580c');
        grad.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = grad;
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 14;

        ctx.beginPath();
        ctx.arc(elem.x, elem.y, rad + bubble, 0, Math.PI * 2);
        ctx.fill();
      } else if (elem.type === 'TORCH') {
        // Torch animated light glow
        const flicker = (Math.sin(time * 0.008 + elem.x) + Math.cos(time * 0.012)) * 3;
        const glow = ctx.createRadialGradient(elem.x, elem.y, 2, elem.x, elem.y, 32 + flicker);
        glow.addColorStop(0, 'rgba(251, 191, 36, 0.85)');
        glow.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
        glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(elem.x, elem.y, 32 + flicker, 0, Math.PI * 2);
        ctx.fill();

        // Wooden stand
        ctx.fillStyle = '#78350f';
        ctx.fillRect(elem.x - 3, elem.y - 2, 6, 14);

        // Animated fire flame core
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(elem.x, elem.y - 4, 4 + flicker * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  private drawGroundDecals(engine: GameEngine) {
    const ctx = this.ctx;
    engine.particleManager.groundDecals.forEach((d: GroundDecal) => {
      ctx.save();
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // --- Build Slots ---

  private drawBuildSlots(engine: GameEngine, mousePos: Point | null, time: number) {
    const ctx = this.ctx;
    engine.buildSlots.forEach((slot: BuildSlot) => {
      if (slot.towerId) return; // Occupied

      const isSelected = engine.selectedSlotId === slot.id;
      const isHovered = mousePos && Math.hypot(mousePos.x - slot.x, mousePos.y - slot.y) <= slot.radius;

      ctx.save();
      // Stone foundation ring
      ctx.fillStyle = isSelected ? '#1e293b' : isHovered ? '#1e293b' : 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = isSelected ? '#fbbf24' : isHovered ? '#60a5fa' : 'rgba(203, 213, 225, 0.35)';
      ctx.lineWidth = isSelected ? 3 : isHovered ? 2.5 : 1.5;

      if (isSelected || isHovered) {
        ctx.shadowColor = isSelected ? '#fbbf24' : '#60a5fa';
        ctx.shadowBlur = 10;
      }

      ctx.beginPath();
      ctx.arc(slot.x, slot.y, slot.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rotating inner rune pips if hovered/selected
      if (isSelected || isHovered) {
        ctx.save();
        ctx.translate(slot.x, slot.y);
        ctx.rotate(time * 0.002);
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#60a5fa';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, slot.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        for (let p = 0; p < 4; p++) {
          ctx.rotate(Math.PI / 2);
          ctx.fillRect(slot.radius * 0.6 - 2, -2, 4, 4);
        }
        ctx.restore();
      }

      // Plus symbol
      ctx.fillStyle = isSelected ? '#fbbf24' : isHovered ? '#60a5fa' : 'rgba(203, 213, 225, 0.65)';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', slot.x, slot.y);

      ctx.restore();
    });
  }

  // --- Towers ---

  private drawTowers(engine: GameEngine, time: number) {
    const ctx = this.ctx;
    const isReinforced = engine.reinforcementsTimer > 0;

    engine.towers.forEach((t: TowerInstance) => {
      ctx.save();

      // Tower base shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(t.x + 3, t.y + 6, 22, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Reinforcement golden aura
      if (isReinforced) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 25, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Stone circular plinth with level bevel
      ctx.fillStyle = t.level === 4 ? '#451a03' : t.level === 3 ? '#1e293b' : '#334155';
      ctx.strokeStyle = t.level === 4 ? '#f59e0b' : t.level === 3 ? '#94a3b8' : '#475569';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Sniper laser aiming line
      if (t.type === 'SNIPER' && t.targetId) {
        const target = engine.enemies.find((e) => e.id === t.targetId && e.hp > 0);
        if (target) {
          ctx.save();
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(t.x, t.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();

          // Laser dot
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(target.x, target.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Tower specific body & turret
      this.drawTowerBody(t, time);

      // Level stars / tier badges
      this.drawTowerLevelPips(t);

      ctx.restore();
    });
  }

  private drawTowerBody(t: TowerInstance, time: number) {
    const ctx = this.ctx;
    const def = TOWER_DEFINITIONS[t.type];
    const recoil = t.firingAnimation * 5;

    ctx.save();
    ctx.translate(t.x, t.y);

    switch (t.type) {
      case 'ARCHER':
        // Wooden watch platform
        ctx.fillStyle = t.level >= 3 ? '#1e293b' : '#78350f';
        ctx.fillRect(-11, -11, 22, 22);
        ctx.strokeStyle = t.level === 4 ? '#fbbf24' : '#b45309';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-11, -11, 22, 22);

        // Rotating bow/turret
        ctx.rotate(t.angle);
        ctx.strokeStyle = t.level === 4 ? '#f59e0b' : def.color;
        ctx.lineWidth = t.level === 4 ? 4 : 3;
        ctx.beginPath();
        ctx.arc(6 - recoil, 0, 10, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();

        // Arrow drawn
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5 - recoil, 0);
        ctx.lineTo(13 - recoil, 0);
        ctx.stroke();

        // Tier 4 Eagle crest
        if (t.level === 4) {
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-4, -4, 8, 8);
        }
        break;

      case 'CANNON':
        // Iron base
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        // Cannon barrel with recoil kickback
        ctx.rotate(t.angle);
        ctx.fillStyle = t.level >= 3 ? '#334155' : '#475569';
        ctx.strokeStyle = t.level === 4 ? '#ea580c' : '#0f172a';
        ctx.lineWidth = 2;

        const barrelWidth = t.level === 4 ? 22 : 18;
        const barrelHeight = t.level === 4 ? 13 : 10;
        ctx.fillRect(-6 - recoil, -barrelHeight / 2, barrelWidth, barrelHeight);
        ctx.strokeRect(-6 - recoil, -barrelHeight / 2, barrelWidth, barrelHeight);

        // Brass muzzle band
        ctx.fillStyle = t.level === 4 ? '#f97316' : '#d97706';
        ctx.fillRect(barrelWidth - 7 - recoil, -barrelHeight / 2 - 1, 3, barrelHeight + 2);

        // Muzzle smoke flash
        if (t.firingAnimation > 0.5) {
          ctx.fillStyle = '#fdba74';
          ctx.beginPath();
          ctx.arc(barrelWidth - 4 - recoil, 0, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'MAGE':
        // Arcane rune circle
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.stroke();

        // Orbiting rune particles
        const runeRot = time * 0.003;
        for (let i = 0; i < (t.level === 4 ? 4 : 2); i++) {
          const a = runeRot + (Math.PI * 2 * i) / (t.level === 4 ? 4 : 2);
          ctx.fillStyle = '#c084fc';
          ctx.beginPath();
          ctx.arc(Math.cos(a) * 14, Math.sin(a) * 14, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Levitating glowing diamond crystal
        const floatY = Math.sin(time * 0.004) * 3;
        ctx.fillStyle = t.level === 4 ? '#e9d5ff' : '#c084fc';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, -12 + floatY);
        ctx.lineTo(8, floatY);
        ctx.lineTo(0, 12 + floatY);
        ctx.lineTo(-8, floatY);
        ctx.closePath();
        ctx.fill();
        break;

      case 'FROST':
        // Icy core with pulsating cold mist
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#7dd3fc';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting ice shards
        const shardCount = t.level === 4 ? 6 : t.level >= 2 ? 4 : 2;
        const shardRadius = 13 + Math.sin(time * 0.003) * 2;
        for (let i = 0; i < shardCount; i++) {
          const a = (Math.PI * 2 * i) / shardCount + time * 0.0025;
          ctx.fillStyle = '#bae6fd';
          ctx.beginPath();
          ctx.arc(Math.cos(a) * shardRadius, Math.sin(a) * shardRadius, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'TESLA':
        // Tesla transformer coils
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-5, -12, 10, 24);

        // Electrodes
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, -7, 8, 0, Math.PI * 2);
        ctx.fill();

        // Spark arcs on coil
        if (Math.random() > 0.4) {
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(Math.random() * 8 - 4, -7);
          ctx.lineTo(Math.random() * 12 - 6, Math.random() * 8);
          ctx.stroke();
        }
        break;

      case 'SNIPER':
        // Camouflaged turret
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        // Heavy rifle barrel
        ctx.rotate(t.angle);
        ctx.fillStyle = t.level === 4 ? '#b91c1c' : '#ef4444';
        const barrelLen = t.level === 4 ? 26 : 22;
        ctx.fillRect(0 - recoil, -2.5, barrelLen, 5);

        // Optical scope
        ctx.fillStyle = '#18181b';
        ctx.fillRect(6 - recoil, -5, 8, 2.5);
        break;

      case 'POISON':
        // Alchemical cauldron
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        // Bubbling green venom
        const bubbleR = 7 + Math.sin(time * 0.006) * 1.5;
        ctx.fillStyle = '#84cc16';
        ctx.shadowColor = '#84cc16';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, bubbleR, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'FLAME':
        // Incinerator body
        ctx.fillStyle = '#7c2d12';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        // Flame nozzle
        ctx.rotate(t.angle);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(2 - recoil, -4, 14, 8);

        // Heated nozzle glow
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(13 - recoil, -3, 3, 6);
        break;
    }

    ctx.restore();
  }

  private drawTowerLevelPips(t: TowerInstance) {
    const ctx = this.ctx;
    const count = t.level;
    const startX = t.x - (count * 6 - 3) / 2;

    for (let i = 0; i < count; i++) {
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(startX + i * 6, t.y + 16, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // --- Enemies ---

  private drawEnemies(engine: GameEngine, time: number) {
    const ctx = this.ctx;

    engine.enemies.forEach((e: EnemyInstance) => {
      ctx.save();

      // Stealth transparency
      if (e.isStealthed) {
        ctx.globalAlpha = 0.25;
      }

      // Ground shadow
      const shadowY = e.isFlying ? e.y + 16 : e.y + 4;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(e.x, shadowY, e.size * 0.9, e.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Boss Enraged Aura (Phase 2)
      if (e.type === 'BOSS' && e.isEnraged) {
        ctx.strokeStyle = '#ef4444';
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size + 6 + Math.sin(time * 0.008) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Boss Cataclysmic Barrier (Phase 3)
      if (e.type === 'BOSS' && e.bossPhase === 3) {
        ctx.strokeStyle = '#a855f7';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 16;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size + 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Enemy Body
      this.drawEnemyBody(e, time);

      // Hit flash overlay
      if (e.flashTimer > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tactical Status Effect Overlays (Marked crosshairs & Corrosion)
      if (e.statuses.some((s) => s.type === 'MARKED')) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y - e.size - 18, 6, 0, Math.PI * 2);
        ctx.moveTo(e.x - 9, e.y - e.size - 18);
        ctx.lineTo(e.x + 9, e.y - e.size - 18);
        ctx.moveTo(e.x, e.y - e.size - 27);
        ctx.lineTo(e.x, e.y - e.size - 9);
        ctx.stroke();
      }

      if (e.statuses.some((s) => s.type === 'CORROSION')) {
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(e.x - 8, e.y + Math.sin(time * 0.01) * 3, 2.5, 0, Math.PI * 2);
        ctx.arc(e.x + 8, e.y - Math.cos(time * 0.01) * 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Health bar & status indicators
      this.drawEnemyHealthBar(e);

      ctx.restore();
    });
  }

  private drawEnemyBody(e: EnemyInstance, time: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(e.x, e.y);

    switch (e.type) {
      case 'GRUNT':
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(0, 0, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Goblin ears & eyes
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.arc(-8, -8, 4, 0, Math.PI * 2);
        ctx.arc(8, -8, 4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'RUNNER':
        ctx.rotate(e.angle);
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, e.size * 1.3, e.size * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();
        // Snout
        ctx.beginPath();
        ctx.moveTo(e.size * 0.8, -3);
        ctx.lineTo(e.size * 1.5, 0);
        ctx.lineTo(e.size * 0.8, 3);
        ctx.closePath();
        ctx.fill();
        break;

      case 'TANK':
        // Armored iron golem
        ctx.fillStyle = '#475569';
        ctx.fillRect(-e.size, -e.size, e.size * 2, e.size * 2);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.strokeRect(-e.size, -e.size, e.size * 2, e.size * 2);

        // Core light
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'SHIELDBEARER':
        // Knight
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.arc(0, 0, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Energy shield arc
        if (e.shieldHp > 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, e.size + 6, e.angle - Math.PI / 2.2, e.angle + Math.PI / 2.2);
          ctx.stroke();
        }
        break;

      case 'HEALER':
        ctx.fillStyle = '#065f46';
        ctx.beginPath();
        ctx.arc(0, 0, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Emerald cross
        ctx.fillStyle = '#34d399';
        ctx.fillRect(-2, -6, 4, 12);
        ctx.fillRect(-6, -2, 12, 4);
        break;

      case 'FLYING':
        const wingFlap = Math.sin(e.walkCycle) * 8;
        ctx.fillStyle = '#6d28d9';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-14, -12 + wingFlap);
        ctx.lineTo(-6, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(14, -12 + wingFlap);
        ctx.lineTo(6, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(0, 0, e.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'STEALTH':
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, e.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-3, -2, 1.5, 0, Math.PI * 2);
        ctx.arc(3, -2, 1.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'BOSS':
        // Colossal dread titan
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.arc(0, 0, e.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Spikes / Horns
        ctx.fillStyle = '#450a0a';
        ctx.beginPath();
        ctx.moveTo(-16, -16);
        ctx.lineTo(-24, -30);
        ctx.lineTo(-8, -20);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(16, -16);
        ctx.lineTo(24, -30);
        ctx.lineTo(8, -20);
        ctx.fill();

        // Molten core
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  private drawEnemyHealthBar(e: EnemyInstance) {
    const ctx = this.ctx;
    const barW = Math.max(26, e.size * 2);
    const barH = 4;
    const barX = e.x - barW / 2;
    const barY = e.y - e.size - 8;

    // Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

    // HP Ratio
    const hpRatio = Math.max(0, e.hp / e.maxHp);
    ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(barX, barY, barW * hpRatio, barH);

    // Shield Bar (if any)
    if (e.maxShieldHp > 0 && e.shieldHp > 0) {
      const shieldRatio = e.shieldHp / e.maxShieldHp;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(barX, barY - 3, barW * shieldRatio, 2);
    }

    // Status effect indicator badges
    if (e.statuses.length > 0) {
      let iconX = barX;
      e.statuses.forEach((st) => {
        ctx.fillStyle = st.type === 'SLOW' || st.type === 'FREEZE' ? '#38bdf8' : st.type === 'POISON' ? '#84cc16' : '#f97316';
        ctx.beginPath();
        ctx.arc(iconX + 3, barY + barH + 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
        iconX += 7;
      });
    }
  }

  // --- Projectiles & Trails ---

  private drawProjectiles(engine: GameEngine) {
    const ctx = this.ctx;
    engine.projectiles.forEach((p: Projectile) => {
      // 1. Draw smooth projectile trail
      if (p.trail && p.trail.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let tIdx = 1; tIdx < p.trail.length; tIdx++) {
          ctx.lineTo(p.trail[tIdx].x, p.trail[tIdx].y);
        }
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.towerType === 'CANNON' ? 5 : p.towerType === 'MAGE' ? 4 : 2.5;
        ctx.globalAlpha = 0.35;
        ctx.stroke();
        ctx.restore();
      }

      // 2. Draw projectile head
      ctx.save();
      if (p.towerType === 'ARCHER') {
        const angle = Math.atan2(p.targetY - p.y, p.targetX - p.x);
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(6, 0);
        ctx.stroke();

        ctx.fillStyle = '#059669';
        ctx.fillRect(-8, -1.5, 3, 3);
      } else if (p.towerType === 'CANNON') {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.towerType === 'MAGE') {
        ctx.fillStyle = '#c084fc';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.towerType === 'FROST') {
        ctx.fillStyle = '#bae6fd';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.towerType === 'POISON') {
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  // --- Shockwaves, Particles & Lightning ---

  private drawShockwaves(engine: GameEngine) {
    const ctx = this.ctx;
    engine.particleManager.shockwaves.forEach((s: Shockwave) => {
      ctx.save();
      ctx.globalAlpha = s.alpha * 0.85;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  private drawLightningArcs(engine: GameEngine) {
    const ctx = this.ctx;
    engine.particleManager.lightningArcs.forEach((l: LightningArc) => {
      ctx.save();
      ctx.globalAlpha = l.alpha;
      ctx.strokeStyle = l.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = l.color;
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(l.points[0].x, l.points[0].y);
      for (let i = 1; i < l.points.length; i++) {
        ctx.lineTo(l.points[i].x, l.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    });
  }

  private drawParticles(engine: GameEngine) {
    const ctx = this.ctx;
    engine.particleManager.particles.forEach((p: Particle) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.glow) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // --- Range Rings & Selection Highlights ---

  private drawSelectionOverlays(engine: GameEngine, mousePos: Point | null, time: number) {
    const ctx = this.ctx;

    // 1. If a tower is selected, show its full attack range
    if (engine.selectedTowerId) {
      const tower = engine.towers.find((t: TowerInstance) => t.id === engine.selectedTowerId);
      if (tower) {
        const range = tower.currentRange * (engine.reinforcementsTimer > 0 ? 1.25 : 1.0);
        this.drawRangeRing(tower.x, tower.y, range, '#38bdf8', 'rgba(56, 189, 248, 0.12)', time);
      }
    }

    // 2. If hovering over a placed tower, preview range
    if (mousePos && !engine.selectedTowerId) {
      const hoveredTower = engine.towers.find((t: TowerInstance) => Math.hypot(mousePos.x - t.x, mousePos.y - t.y) <= 22);
      if (hoveredTower) {
        this.drawRangeRing(hoveredTower.x, hoveredTower.y, hoveredTower.currentRange, '#94a3b8', 'rgba(148, 163, 184, 0.08)', time);
      }
    }
  }

  private drawRangeRing(x: number, y: number, radius: number, strokeColor: string, fillColor: string, time: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.lineDashOffset = -time * 0.01;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // --- Spell Reticle ---

  private drawSpellReticle(engine: GameEngine, mousePos: Point, time: number) {
    const ctx = this.ctx;
    const spell = SPELL_DEFINITIONS.find((s) => s.type === engine.targetingSpell);
    if (!spell || spell.radius <= 0) return;

    ctx.save();
    const color = spell.type === 'METEOR' ? '#ef4444' : '#38bdf8';
    ctx.fillStyle = spell.type === 'METEOR' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(56, 189, 248, 0.18)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    // Target circle
    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, spell.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(mousePos.x - spell.radius * 0.4, mousePos.y);
    ctx.lineTo(mousePos.x + spell.radius * 0.4, mousePos.y);
    ctx.moveTo(mousePos.x, mousePos.y - spell.radius * 0.4);
    ctx.lineTo(mousePos.x, mousePos.y + spell.radius * 0.4);
    ctx.stroke();

    ctx.restore();
  }

  // --- Floating Combat Texts ---

  private drawFloatingTexts(engine: GameEngine) {
    const ctx = this.ctx;
    engine.particleManager.floatingTexts.forEach((t: FloatingText) => {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.color;
      ctx.font = `bold ${Math.round(13 * t.scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Drop shadow for crisp legibility
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });
  }
}
