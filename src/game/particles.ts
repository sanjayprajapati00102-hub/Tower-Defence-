import { FloatingText, GroundDecal, LightningArc, Particle, Point, Shockwave } from './types';

export class ParticleManager {
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public lightningArcs: LightningArc[] = [];
  public groundDecals: GroundDecal[] = [];
  public shockwaves: Shockwave[] = [];

  public update(dt: number) {
    // Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.life -= dt;
      if (s.life <= 0) {
        this.shockwaves.splice(i, 1);
        continue;
      }
      s.radius += ((s.maxRadius - s.radius) * Math.min(1, dt * 10)) + 60 * dt;
      s.alpha = Math.max(0, s.life / s.maxLife);
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }
      p.alpha = Math.max(0, p.life / p.maxLife);
    }

    // Floating text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.life -= dt;
      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      t.y -= 28 * dt; // Float upwards
      t.alpha = Math.min(1, t.life / (t.maxLife * 0.4));
    }

    // Lightning arcs
    for (let i = this.lightningArcs.length - 1; i >= 0; i--) {
      const l = this.lightningArcs[i];
      l.life -= dt;
      if (l.life <= 0) {
        this.lightningArcs.splice(i, 1);
        continue;
      }
      l.alpha = l.life / l.maxLife;
    }

    // Ground decals
    for (let i = this.groundDecals.length - 1; i >= 0; i--) {
      const d = this.groundDecals[i];
      d.life -= dt;
      if (d.life <= 0) {
        this.groundDecals.splice(i, 1);
        continue;
      }
      d.alpha = Math.min(0.6, d.life / d.maxLife);
    }
  }

  public clear() {
    this.particles = [];
    this.floatingTexts = [];
    this.lightningArcs = [];
    this.groundDecals = [];
    this.shockwaves = [];
  }

  public spawnShockwave(x: number, y: number, maxRadius = 60, color = '#f59e0b') {
    this.shockwaves.push({
      id: Math.random().toString(36).substring(2, 9),
      x,
      y,
      radius: 4,
      maxRadius,
      color,
      alpha: 1,
      life: 0.35,
      maxLife: 0.35,
    });
  }

  public spawnLevelUpBurst(x: number, y: number, tierName: string) {
    this.spawnShockwave(x, y, 75, '#fbbf24');
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        id: Math.random().toString(36).substring(2, 9),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color: '#fbbf24',
        alpha: 1,
        life: 0.6,
        maxLife: 0.6,
        glow: true,
      });
    }

    this.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 9),
      text: `★ ${tierName.toUpperCase()}!`,
      x,
      y: y - 24,
      color: '#fef08a',
      alpha: 1,
      life: 1.4,
      maxLife: 1.4,
      scale: 1.3,
    });
  }

  public spawnShieldDeflect(x: number, y: number) {
    this.spawnShockwave(x, y, 32, '#38bdf8');
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 25 + Math.random() * 50;
      this.particles.push({
        id: Math.random().toString(36).substring(2, 9),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5,
        color: '#bae6fd',
        alpha: 1,
        life: 0.25,
        maxLife: 0.25,
        glow: true,
      });
    }
  }

  public spawnBossSummonEffect(x: number, y: number) {
    this.spawnShockwave(x, y, 120, '#dc2626');
    this.spawnShockwave(x, y, 80, '#f97316');
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 110;
      this.particles.push({
        id: Math.random().toString(36).substring(2, 9),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        size: 4 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#ef4444' : '#7f1d1d',
        alpha: 1,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
        glow: true,
      });
    }
  }

  public spawnDamageText(x: number, y: number, text: string, color = '#f87171', scale = 1.0) {
    this.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 9),
      text,
      x: x + (Math.random() * 16 - 8),
      y: y - 10 + (Math.random() * 10 - 5),
      color,
      alpha: 1,
      life: 0.85,
      maxLife: 0.85,
      scale,
    });
  }

  public spawnGoldText(x: number, y: number, amount: number) {
    this.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 9),
      text: `+${amount}g`,
      x: x + (Math.random() * 10 - 5),
      y: y - 12,
      color: '#fbbf24',
      alpha: 1,
      life: 1.1,
      maxLife: 1.1,
      scale: 1.2,
    });
  }

  public spawnExplosion(x: number, y: number, radius = 50, color = '#f97316') {
    this.spawnShockwave(x, y, radius * 1.2, color);
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      const speed = 40 + Math.random() * (radius * 1.8);
      this.particles.push({
        id: Math.random().toString(36).substring(2, 9),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color,
        alpha: 1,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        gravity: 40,
        glow: true,
      });
    }

    // Scorch decal
    this.groundDecals.push({
      id: Math.random().toString(36).substring(2, 9),
      x,
      y,
      radius: radius * 0.8,
      color: '#18181b',
      alpha: 0.5,
      life: 5.0,
      maxLife: 5.0,
    });
  }

  public spawnSparks(x: number, y: number, color = '#fbbf24', count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 80;
      this.particles.push({
        id: Math.random().toString(36).substring(2, 9),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2,
        color,
        alpha: 1,
        life: 0.2 + Math.random() * 0.2,
        maxLife: 0.4,
      });
    }
  }

  public spawnLightning(p1: Point, p2: Point, color = '#facc15') {
    const points: Point[] = [p1];
    const steps = 5;
    const dx = (p2.x - p1.x) / steps;
    const dy = (p2.y - p1.y) / steps;

    for (let i = 1; i < steps; i++) {
      const perpX = -dy * (Math.random() * 0.6 - 0.3);
      const perpY = dx * (Math.random() * 0.6 - 0.3);
      points.push({
        x: p1.x + dx * i + perpX,
        y: p1.y + dy * i + perpY,
      });
    }
    points.push(p2);

    this.lightningArcs.push({
      id: Math.random().toString(36).substring(2, 9),
      points,
      color,
      alpha: 1,
      life: 0.18,
      maxLife: 0.18,
    });
  }

  public spawnFrostBurst(x: number, y: number, radius = 60) {
    this.spawnShockwave(x, y, radius * 1.2, '#38bdf8');
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * (radius * 1.5);
      this.particles.push({
        id: Math.random().toString(36).substring(2, 9),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3,
        color: '#7dd3fc',
        alpha: 1,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        glow: true,
      });
    }

    this.groundDecals.push({
      id: Math.random().toString(36).substring(2, 9),
      x,
      y,
      radius: radius * 0.75,
      color: '#38bdf8',
      alpha: 0.35,
      life: 4.0,
      maxLife: 4.0,
    });
  }

  public spawnPoisonBurst(x: number, y: number, radius = 40) {
    this.spawnShockwave(x, y, radius, '#84cc16');
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 15 + Math.random() * radius;
      this.particles.push({
        id: Math.random().toString(36).substring(2, 9),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color: '#84cc16',
        alpha: 0.8,
        life: 0.6 + Math.random() * 0.3,
        maxLife: 0.9,
      });
    }
  }

  public spawnFlames(x: number, y: number, angle: number, distance: number) {
    for (let i = 0; i < 4; i++) {
      const spread = (Math.random() - 0.5) * 0.45;
      const speed = 80 + Math.random() * (distance * 1.2);
      this.particles.push({
        id: Math.random().toString(36).substring(2, 9),
        x,
        y,
        vx: Math.cos(angle + spread) * speed,
        vy: Math.sin(angle + spread) * speed,
        size: 4 + Math.random() * 5,
        color: Math.random() > 0.4 ? '#f97316' : '#eab308',
        alpha: 0.9,
        life: 0.25 + Math.random() * 0.2,
        maxLife: 0.45,
        glow: true,
      });
    }
  }

  public spawnMeteorImpact(x: number, y: number, radius = 130) {
    this.spawnExplosion(x, y, radius, '#ef4444');
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * (radius * 1.6);
      this.particles.push({
        id: Math.random().toString(36).substring(2, 9),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        color: Math.random() > 0.5 ? '#f97316' : '#dc2626',
        alpha: 1,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
        gravity: 50,
        glow: true,
      });
    }

    this.groundDecals.push({
      id: Math.random().toString(36).substring(2, 9),
      x,
      y,
      radius,
      color: '#450a0a',
      alpha: 0.7,
      life: 8.0,
      maxLife: 8.0,
    });
  }

  public spawnComboText(x: number, y: number, text: string, color = '#f97316') {
    this.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 9),
      text,
      x: x + (Math.random() - 0.5) * 16,
      y: y - 12,
      color,
      alpha: 1,
      life: 1.4,
      maxLife: 1.4,
      scale: 1.35,
    });
  }

  public spawnHazardWarning(x: number, y: number, radius = 60, color = '#ef4444') {
    this.spawnShockwave(x, y, radius, color);
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        id: Math.random().toString(36).substring(2, 9),
        x: x + (Math.random() - 0.5) * radius,
        y: y + (Math.random() - 0.5) * radius,
        vx: 0,
        vy: -30 - Math.random() * 40,
        size: 3 + Math.random() * 3,
        color,
        alpha: 0.8,
        life: 0.6,
        maxLife: 0.6,
      });
    }
  }
}
