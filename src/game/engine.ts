import { sound } from './audio';
import { CAMPAIGN_WAVES, ELITE_MODIFIERS, ENEMY_DEFINITIONS, generateEndlessWave } from './enemies';
import { MAP_DEFINITIONS, MAP_HEIGHT, MAP_WIDTH, SPELL_DEFINITIONS } from './maps';
import { ParticleManager } from './particles';
import { getActivePerks, loadSaveData, updateAchievementProgress, ActivePerks } from './storage';
import { TOWER_DEFINITIONS } from './towers';
import {
  ActiveMapHazardState,
  ActiveSpellState,
  BranchingSpecialization,
  BuildSlot,
  DamageType,
  Difficulty,
  EliteModifierDef,
  EnemyDef,
  EnemyInstance,
  EnemyType,
  GameStats,
  GameStatus,
  MapDef,
  MapId,
  Point,
  Projectile,
  SpellType,
  TargetMode,
  TowerInstance,
  TowerType,
  WaveDef,
} from './types';

export interface EngineStateSnapshot {
  mapId: MapId;
  gameStatus: GameStatus;
  lives: number;
  maxLives: number;
  gold: number;
  waveNumber: number;
  totalWaves: number;
  isEndless: boolean;
  speedMultiplier: number;
  enemiesRemaining: number;
  selectedSlotId: string | null;
  selectedTowerId: string | null;
  targetingSpell: SpellType | null;
  spells: Record<SpellType, ActiveSpellState>;
  waveCountdown: number;
  autoStartWaves: boolean;
  bossActive: EnemyInstance | null;
  reinforcementsActive: boolean;
  reinforcementsRemaining: number;
  stats: GameStats;
  currentEliteModifier: EliteModifierDef | null;
  activeHazards: ActiveMapHazardState[];
  perks: ActivePerks;
}

export class GameEngine {
  public currentMap: MapDef;
  public difficulty: Difficulty = 'NORMAL';
  public isEndless: boolean = false;
  public gameStatus: GameStatus = 'READY';

  public lives: number = 20;
  public maxLives: number = 20;
  public gold: number = 450;
  public waveNumber: number = 0;
  public totalWaves: number = 30;
  public speedMultiplier: number = 1;
  public autoStartWaves: boolean = false;
  public waveCountdown: number = 0;

  public buildSlots: BuildSlot[] = [];
  public towers: TowerInstance[] = [];
  public enemies: EnemyInstance[] = [];
  public projectiles: Projectile[] = [];
  public particleManager: ParticleManager = new ParticleManager();

  public currentEliteModifier: EliteModifierDef | null = null;
  public activeHazards: ActiveMapHazardState[] = [];
  public activePerks: ActivePerks = getActivePerks(loadSaveData());

  public activeSpells: Record<SpellType, ActiveSpellState> = {
    METEOR: { type: 'METEOR', cooldownRemaining: 0 },
    FREEZE: { type: 'FREEZE', cooldownRemaining: 0 },
    REINFORCEMENTS: { type: 'REINFORCEMENTS', cooldownRemaining: 0 },
    GOLD_RUSH: { type: 'GOLD_RUSH', cooldownRemaining: 0 },
  };

  public reinforcementsTimer: number = 0;
  public selectedSlotId: string | null = null;
  public selectedTowerId: string | null = null;
  public targetingSpell: SpellType | null = null;

  // Wave Spawner State
  public currentWaveDef: WaveDef | null = null;
  public spawnQueue: { enemyType: EnemyType; spawnTime: number }[] = [];
  public waveElapsedTime: number = 0;
  public isSpawningActive: boolean = false;
  public burstQueue: { towerId: string; targetId: string; delay: number; speed: number; bypassRatio?: number; isCorrosive?: boolean }[] = [];
  public showDamageNumbers: boolean = true;

  // Stats
  public stats: GameStats = {
    enemiesKilled: 0,
    totalDamageDealt: 0,
    goldEarned: 0,
    goldSpent: 0,
    towersBuilt: 0,
    towersUpgraded: 0,
    towersSold: 0,
    spellsCast: 0,
    wavesCompleted: 0,
    perfectWaves: 0,
    combosTriggered: 0,
  };

  private livesAtWaveStart: number = 20;
  private lastTimestamp: number = 0;
  private animFrameId: number | null = null;
  private onStateChangeCb?: (state: EngineStateSnapshot) => void;
  private onAnnouncementCb?: (title: string, subtitle: string) => void;
  private onScreenShakeCb?: () => void;

  constructor(mapId: MapId = 'greenwood', difficulty: Difficulty = 'NORMAL', isEndless = false) {
    this.currentMap = MAP_DEFINITIONS[mapId];
    this.difficulty = difficulty;
    this.isEndless = isEndless;
    this.initMap(mapId);
  }

  public setCallbacks(
    onStateChange: (state: EngineStateSnapshot) => void,
    onAnnouncement?: (title: string, subtitle: string) => void,
    onScreenShake?: () => void
  ) {
    this.onStateChangeCb = onStateChange;
    this.onAnnouncementCb = onAnnouncement;
    this.onScreenShakeCb = onScreenShake;
  }

  public initMap(mapId: MapId) {
    this.currentMap = MAP_DEFINITIONS[mapId];
    this.buildSlots = this.currentMap.buildSlots.map((slot) => ({ ...slot }));
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.burstQueue = [];
    this.particleManager.clear();
    this.activePerks = getActivePerks(loadSaveData());

    const diffMultiplier = this.difficulty === 'EASY' ? 1.2 : this.difficulty === 'HARD' ? 0.85 : 1.0;
    this.gold = Math.round(this.currentMap.startingGold * diffMultiplier) + this.activePerks.startingGoldBonus;
    this.lives = (this.difficulty === 'EASY' ? this.currentMap.startingLives + 5 : this.difficulty === 'HARD' ? Math.max(10, this.currentMap.startingLives - 5) : this.currentMap.startingLives) + this.activePerks.bonusCastleLives;
    this.maxLives = this.lives;
    this.livesAtWaveStart = this.lives;

    this.waveNumber = 0;
    this.totalWaves = 30;
    this.gameStatus = 'READY';
    this.selectedSlotId = null;
    this.selectedTowerId = null;
    this.targetingSpell = null;
    this.waveCountdown = 0;
    this.reinforcementsTimer = 0;
    this.isSpawningActive = false;
    this.spawnQueue = [];
    this.currentEliteModifier = null;

    // Initialize map hazards
    this.activeHazards = (this.currentMap.hazards || []).map((def) => ({
      def,
      cycleTimer: def.interval,
      activeRemaining: 0,
      isActive: false,
    }));

    // Reset spell cooldowns
    SPELL_DEFINITIONS.forEach((s) => {
      this.activeSpells[s.type].cooldownRemaining = 0;
    });

    this.emitState();
  }

  public start() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.lastTimestamp = performance.now();
    this.loop = this.loop.bind(this);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loop(timestamp: number) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const rawDt = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    const dt = Math.min(rawDt, 0.1); // Clamp against huge frame gaps

    if (this.gameStatus !== 'PAUSED') {
      const scaledDt = dt * this.speedMultiplier;
      this.update(scaledDt);
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public update(dt: number) {
    if (this.gameStatus === 'VICTORY' || this.gameStatus === 'DEFEAT') {
      this.particleManager.update(dt);
      return;
    }

    // Reinforcements timer
    if (this.reinforcementsTimer > 0) {
      this.reinforcementsTimer = Math.max(0, this.reinforcementsTimer - dt);
    }

    // Spell cooldowns
    Object.values(this.activeSpells).forEach((s) => {
      if (s.cooldownRemaining > 0) {
        s.cooldownRemaining = Math.max(0, s.cooldownRemaining - dt);
      }
    });

    // Wave countdown
    if (this.gameStatus === 'WAVE_BREAK') {
      if (this.autoStartWaves) {
        this.waveCountdown -= dt;
        if (this.waveCountdown <= 0) {
          this.startNextWave();
        }
      }
    }

    // Spawning logic
    if (this.isSpawningActive) {
      this.waveElapsedTime += dt;
      this.processSpawnQueue();
    }

    // Check if wave is cleared
    if (this.gameStatus === 'WAVE_ACTIVE' && !this.isSpawningActive && this.enemies.length === 0) {
      this.handleWaveCompleted();
    }

    // Update game entities
    this.updateHazards(dt);
    this.updateEnemies(dt);
    this.updateTowers(dt);
    this.updateProjectiles(dt);
    this.particleManager.update(dt);

    this.emitState();
  }

  // --- Hazard System ---

  private updateHazards(dt: number) {
    for (const h of this.activeHazards) {
      if (h.isActive) {
        h.activeRemaining -= dt;
        if (h.activeRemaining <= 0) {
          h.isActive = false;
          h.cycleTimer = h.def.interval;
        } else {
          // Continuous active hazard effects
          if (h.def.type === 'LAVA_GEYSER' && h.def.x !== undefined && h.def.y !== undefined) {
            const r = h.def.radius || 75;
            this.enemies.forEach((e) => {
              if (!e.isFlying && e.hp > 0 && Math.hypot(e.x - h.def.x!, e.y - h.def.y!) <= r) {
                this.applyDamageToEnemy(e, 45 * dt, 'FIRE', false);
              }
            });
          }
        }
      } else {
        h.cycleTimer -= dt;
        if (h.cycleTimer <= 1.5 && h.cycleTimer + dt > 1.5) {
          if (h.def.type === 'LAVA_GEYSER' && h.def.x !== undefined && h.def.y !== undefined) {
            this.particleManager.spawnHazardWarning(h.def.x, h.def.y, h.def.radius || 60, '#ef4444');
          }
        }
        if (h.cycleTimer <= 0) {
          h.isActive = true;
          h.activeRemaining = h.def.duration;
          if (h.def.type === 'SHRINE' && h.def.x !== undefined && h.def.y !== undefined) {
            this.particleManager.spawnShockwave(h.def.x, h.def.y, h.def.radius || 170, '#fbbf24');
            this.onAnnouncementCb?.(h.def.name, 'Sacred Solar Blessing: Nearby towers attack +30% faster!');
            sound.playReinforceSpell();
          } else if (h.def.type === 'BLIZZARD') {
            this.onAnnouncementCb?.(h.def.name, 'Arctic Gale sweeps the pass: Ground enemies slowed by 40%!');
            sound.playFreezeSpell();
            this.enemies.forEach((e) => {
              if (!e.isFlying && e.hp > 0) {
                e.statuses.push({
                  type: 'SLOW',
                  duration: h.def.duration,
                  maxDuration: h.def.duration,
                  magnitude: 0.4,
                });
              }
            });
          } else if (h.def.type === 'LAVA_GEYSER' && h.def.x !== undefined && h.def.y !== undefined) {
            this.particleManager.spawnExplosion(h.def.x, h.def.y, h.def.radius || 75, '#ea580c');
            sound.playFlame();
          }
        }
      }
    }
  }

  // --- Wave Management ---

  public startNextWave() {
    if (this.gameStatus === 'WAVE_ACTIVE' || this.gameStatus === 'VICTORY' || this.gameStatus === 'DEFEAT') return;

    this.waveNumber++;
    this.gameStatus = 'WAVE_ACTIVE';
    this.waveCountdown = 0;
    this.livesAtWaveStart = this.lives;

    sound.playWaveHorn();

    let waveDef: WaveDef;
    if (this.isEndless && this.waveNumber > 30) {
      waveDef = generateEndlessWave(this.waveNumber);
    } else {
      const idx = Math.min(this.waveNumber - 1, CAMPAIGN_WAVES.length - 1);
      waveDef = CAMPAIGN_WAVES[idx];
    }

    this.currentWaveDef = waveDef;
    this.waveElapsedTime = 0;
    this.isSpawningActive = true;
    this.spawnQueue = [];

    // Elite modifier setup
    if (waveDef.eliteModifier && ELITE_MODIFIERS[waveDef.eliteModifier]) {
      this.currentEliteModifier = ELITE_MODIFIERS[waveDef.eliteModifier];
      this.onAnnouncementCb?.(
        `ELITE WAVE: ${this.currentEliteModifier.name}!`,
        this.currentEliteModifier.description
      );
    } else {
      this.currentEliteModifier = null;
    }

    // Announce wave
    if (waveDef.isBossWave) {
      sound.playBossRoar();
      this.onAnnouncementCb?.(`BOSS WAVE ${this.waveNumber}!`, waveDef.bossName || 'Colossal Threat Approaching!');
      this.onScreenShakeCb?.();
    } else if (!waveDef.eliteModifier) {
      this.onAnnouncementCb?.(`Wave ${this.waveNumber}`, waveDef.description);
    }

    // Populate spawn queue
    waveDef.groups.forEach((group) => {
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push({
          enemyType: group.enemyType,
          spawnTime: group.initialDelay + i * group.interval,
        });
      }
    });

    // Sort queue by spawn time
    this.spawnQueue.sort((a, b) => a.spawnTime - b.spawnTime);
    this.emitState();
  }

  private processSpawnQueue() {
    while (this.spawnQueue.length > 0 && this.spawnQueue[0].spawnTime <= this.waveElapsedTime) {
      const item = this.spawnQueue.shift()!;
      this.spawnEnemy(item.enemyType);
    }

    if (this.spawnQueue.length === 0) {
      this.isSpawningActive = false;
    }
  }

  private spawnEnemy(type: EnemyType) {
    const def = ENEMY_DEFINITIONS[type];
    const isBoss = type === 'BOSS';

    // Difficulty scaling
    const hpScale = this.difficulty === 'EASY' ? 0.85 : this.difficulty === 'HARD' ? 1.25 : 1.0;
    const endlessScale = this.isEndless && this.waveNumber > 30 ? Math.pow(1.12, this.waveNumber - 30) : 1.0;

    let totalHp = Math.round(def.baseHp * hpScale * endlessScale);
    let shieldHp = 0;

    if (type === 'SHIELDBEARER') {
      shieldHp = Math.round(totalHp * 0.7);
    }

    let armor = def.armor;
    let speed = def.speed;
    let magicResist = def.magicResist;
    let reward = def.reward;
    let size = def.size;

    // Apply active wave elite modifier
    if (this.currentEliteModifier) {
      if (this.currentEliteModifier.type === 'ARMORED_HORDE') {
        armor = Math.min(0.85, armor + 0.35);
      } else if (this.currentEliteModifier.type === 'SWIFT_WIND') {
        speed = Math.round(speed * 1.3);
      } else if (this.currentEliteModifier.type === 'ARCANE_SHIELD') {
        magicResist = Math.min(0.85, magicResist + 0.4);
        const bonusBarrier = Math.round(totalHp * 0.4);
        shieldHp += bonusBarrier;
      } else if (this.currentEliteModifier.type === 'BOUNTY_HUNTERS') {
        totalHp = Math.round(totalHp * 1.25);
        reward = Math.round(reward * 1.6);
      } else if (this.currentEliteModifier.type === 'COLOSSAL_SIZE') {
        totalHp = Math.round(totalHp * 1.5);
        size = Math.round(size * 1.25);
      }
    }

    const startPt = def.isFlying && this.currentMap.flyingWaypoints ? this.currentMap.flyingWaypoints[0] : this.currentMap.waypoints[0];

    const enemy: EnemyInstance = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      name: isBoss && this.currentWaveDef?.bossName ? this.currentWaveDef.bossName : def.name,
      x: startPt.x,
      y: startPt.y,
      hp: totalHp,
      maxHp: totalHp,
      shieldHp,
      maxShieldHp: shieldHp,
      speed,
      baseSpeed: speed,
      armor,
      magicResist,
      armorShred: 0,
      reward,
      baseDamage: def.baseDamage,
      size,
      color: def.color,
      isFlying: !!def.isFlying,
      stealthTimer: 0,
      isStealthed: false,
      healCooldown: 0,
      bossSpecialTimer: 0,
      bossPhase: 1,
      isEnraged: false,
      pathIndex: 0,
      distanceTraveled: 0,
      statuses: [],
      angle: 0,
      flashTimer: 0,
      walkCycle: 0,
    };

    // If blizzard hazard is currently active, ground enemies spawn chilled
    const blizzardHazard = this.activeHazards.find((h) => h.def.type === 'BLIZZARD' && h.isActive);
    if (blizzardHazard && !enemy.isFlying) {
      enemy.statuses.push({
        type: 'SLOW',
        duration: blizzardHazard.activeRemaining,
        maxDuration: blizzardHazard.def.duration,
        magnitude: 0.4,
      });
    }

    this.enemies.push(enemy);

    if (isBoss) {
      this.particleManager.spawnBossSummonEffect(startPt.x, startPt.y);
    }
  }

  private handleWaveCompleted() {
    this.stats.wavesCompleted++;

    const isPerfect = this.lives === this.livesAtWaveStart;
    if (isPerfect) this.stats.perfectWaves++;

    const waveBonus = this.currentWaveDef?.bonusGold || 50;
    const perfectBonus = isPerfect ? 25 : 0;
    const totalBonus = waveBonus + perfectBonus;

    this.gold += totalBonus;
    this.stats.goldEarned += totalBonus;
    sound.playCoin();

    // Check Victory
    if (!this.isEndless && this.waveNumber >= this.totalWaves) {
      this.gameStatus = 'VICTORY';
      sound.playVictory();
      this.onAnnouncementCb?.('VICTORY!', 'The Kingdom has been successfully defended!');
      this.emitState();
      return;
    }

    // Intermission
    this.gameStatus = 'WAVE_BREAK';
    this.waveCountdown = this.autoStartWaves ? 3.0 : 9.0;
    this.onAnnouncementCb?.(
      `Wave ${this.waveNumber} Cleared!`,
      `+${totalBonus} Gold ${isPerfect ? '(Flawless Defense Bonus!)' : ''}`
    );
  }

  // --- Entity Updates ---

  private updateEnemies(dt: number) {
    const waypoints = this.currentMap.waypoints;
    const flyingWaypoints = this.currentMap.flyingWaypoints || waypoints;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e) continue;

      // Update flash feedback
      if (e.flashTimer > 0) e.flashTimer = Math.max(0, e.flashTimer - dt);

      // Update status effects
      let speedMult = 1.0;
      let enemyDiedFromDoT = false;

      for (let sIdx = e.statuses.length - 1; sIdx >= 0; sIdx--) {
        const st = e.statuses[sIdx];
        st.duration -= dt;

        if (st.type === 'SLOW') {
          speedMult = Math.min(speedMult, Math.max(0.2, 1.0 - st.magnitude));
        } else if (st.type === 'FREEZE') {
          speedMult = 0;
        } else if (st.type === 'POISON' || st.type === 'BURN') {
          st.tickTimer = (st.tickTimer || 0) + dt;
          if (st.tickTimer >= 0.5) {
            st.tickTimer = 0;
            const dmg = (st.damagePerTick || 10) * 0.5;
            this.applyDamageToEnemy(e, dmg, st.type === 'POISON' ? 'POISON' : 'FIRE', false);
            if (e.hp <= 0 || !this.enemies.includes(e)) {
              enemyDiedFromDoT = true;
              break;
            }
          }
        }

        if (st.duration <= 0) {
          e.statuses.splice(sIdx, 1);
        }
      }

      // If dead from status effect DoT, enemy was already eliminated in applyDamageToEnemy
      if (enemyDiedFromDoT || e.hp <= 0 || !this.enemies.includes(e)) {
        continue;
      }

      // Stealth ability
      if (e.type === 'STEALTH') {
        e.stealthTimer += dt;
        if (e.stealthTimer >= 5.0) {
          e.isStealthed = true;
          if (e.stealthTimer >= 7.5) {
            e.isStealthed = false;
            e.stealthTimer = 0;
          }
        }
      }

      // Healer ability
      if (e.type === 'HEALER' && e.hp > 0) {
        e.healCooldown += dt;
        if (e.healCooldown >= 3.5) {
          e.healCooldown = 0;
          this.triggerHealerPulse(e);
        }
      }

      // Boss ability
      if (e.type === 'BOSS' && e.hp > 0) {
        e.bossSpecialTimer += dt;
        if (e.bossSpecialTimer >= 8.0) {
          e.bossSpecialTimer = 0;
          this.triggerBossSpecial(e);
        }
      }

      // Movement along waypoints with corner smoothing
      const path = e.isFlying ? flyingWaypoints : waypoints;
      let moveDist = e.speed * speedMult * dt;
      e.walkCycle += dt * 8;

      let reachedExit = false;
      while (moveDist > 0) {
        const targetPt = path[e.pathIndex + 1];
        if (!targetPt) {
          reachedExit = true;
          break;
        }

        const dx = targetPt.x - e.x;
        const dy = targetPt.y - e.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= 1e-4) {
          e.pathIndex++;
          continue;
        }

        e.angle = Math.atan2(dy, dx);

        if (dist <= moveDist) {
          e.x = targetPt.x;
          e.y = targetPt.y;
          e.pathIndex++;
          e.distanceTraveled += dist;
          moveDist -= dist;
        } else {
          e.x += (dx / dist) * moveDist;
          e.y += (dy / dist) * moveDist;
          e.distanceTraveled += moveDist;
          moveDist = 0;
        }
      }

      if (reachedExit) {
        this.lives = Math.max(0, this.lives - e.baseDamage);
        sound.playHit();
        this.onScreenShakeCb?.();
        this.enemies.splice(i, 1);

        if (this.lives <= 0) {
          this.gameStatus = 'DEFEAT';
          sound.playDefeat();
          this.onAnnouncementCb?.('DEFEAT', 'The Kingdom Gate has fallen!');
          return;
        }
        continue;
      }
    }
  }

  private triggerHealerPulse(healer: EnemyInstance) {
    const healRange = 140;
    const healAmount = 50;
    this.particleManager.spawnSparks(healer.x, healer.y, '#34d399', 12);

    this.enemies.forEach((other) => {
      if (other.id !== healer.id && Math.hypot(other.x - healer.x, other.y - healer.y) <= healRange) {
        if (other.hp < other.maxHp) {
          other.hp = Math.min(other.maxHp, other.hp + healAmount);
          this.particleManager.spawnDamageText(other.x, other.y, `+${healAmount}`, '#10b981', 1.0);
        }
      }
    });
  }

  private triggerBossSpecial(boss: EnemyInstance) {
    sound.playBossRoar();
    this.onScreenShakeCb?.();
    this.particleManager.spawnExplosion(boss.x, boss.y, 100, '#dc2626');

    // Stun / Slow nearby towers temporarily
    const stunRadius = 160;
    this.towers.forEach((t) => {
      if (Math.hypot(t.x - boss.x, t.y - boss.y) <= stunRadius) {
        t.cooldownTimer += 2.0;
        this.particleManager.spawnDamageText(t.x, t.y, 'STUNNED', '#ef4444', 1.1);
      }
    });
  }

  private updateTowers(dt: number) {
    const isReinforced = this.reinforcementsTimer > 0;
    const rateBuff = isReinforced ? 1.5 : 1.0;
    const rangeBuff = isReinforced ? 1.25 : 1.0;

    // Process queued multi-shot bursts (e.g. Archer Lv4 Hawkeye Citadel)
    for (let b = this.burstQueue.length - 1; b >= 0; b--) {
      const burst = this.burstQueue[b];
      burst.delay -= dt * rateBuff;
      if (burst.delay <= 0) {
        this.burstQueue.splice(b, 1);
        const target = this.enemies.find((e) => e.id === burst.targetId && !e.isStealthed && e.hp > 0);
        const tower = this.towers.find((t) => t.id === burst.towerId);
        if (target && tower) {
          sound.playArrow();
          this.spawnProjectile(tower, target, burst.speed, 0);
        }
      }
    }

    for (let i = 0; i < this.towers.length; i++) {
      const t = this.towers[i];

      if (t.cooldownTimer > 0) {
        t.cooldownTimer -= dt * rateBuff;
      }
      if (t.firingAnimation > 0) {
        t.firingAnimation = Math.max(0, t.firingAnimation - dt * 4);
      }

      // Check target
      const range = t.currentRange * rangeBuff;
      const target = this.acquireTarget(t, range);

      if (target) {
        t.targetId = target.id;
        t.angle = Math.atan2(target.y - t.y, target.x - t.x);

        if (t.cooldownTimer <= 0) {
          this.fireTower(t, target);
          t.cooldownTimer = 1.0 / (t.currentAttackSpeed * rateBuff);
          t.firingAnimation = 1.0;
        }
      } else {
        t.targetId = null;
      }
    }
  }

  private acquireTarget(t: TowerInstance, range: number): EnemyInstance | null {
    const candidates = this.enemies.filter((e) => {
      if (e.isStealthed || e.hp <= 0) return false;
      return Math.hypot(e.x - t.x, e.y - t.y) <= range;
    });

    if (candidates.length === 0) return null;

    switch (t.targetMode) {
      case 'FIRST':
        return candidates.reduce((prev, cur) => (cur.distanceTraveled > prev.distanceTraveled ? cur : prev));
      case 'LAST':
        return candidates.reduce((prev, cur) => (cur.distanceTraveled < prev.distanceTraveled ? cur : prev));
      case 'STRONGEST':
        return candidates.reduce((prev, cur) => {
          const effectiveCur = cur.hp + cur.shieldHp;
          const effectivePrev = prev.hp + prev.shieldHp;
          if (effectiveCur === effectivePrev) {
            return cur.distanceTraveled > prev.distanceTraveled ? cur : prev;
          }
          return effectiveCur > effectivePrev ? cur : prev;
        });
      case 'NEAREST':
        return candidates.reduce((prev, cur) => {
          const dCur = Math.hypot(cur.x - t.x, cur.y - t.y);
          const dPrev = Math.hypot(prev.x - t.x, prev.y - t.y);
          return dCur < dPrev ? cur : prev;
        });
      default:
        return candidates[0];
    }
  }

  private fireTower(t: TowerInstance, target: EnemyInstance) {
    const def = TOWER_DEFINITIONS[t.type];

    switch (t.type) {
      case 'ARCHER':
        sound.playArrow();
        this.spawnProjectile(t, target, def.projectileSpeed, 0);
        // Hawkeye Citadel (Tier 4) fires rapid double volley via in-engine queue
        if (t.level === 4) {
          this.burstQueue.push({
            towerId: t.id,
            targetId: target.id,
            delay: 0.08,
            speed: def.projectileSpeed,
          });
          this.burstQueue.push({
            towerId: t.id,
            targetId: target.id,
            delay: 0.16,
            speed: def.projectileSpeed,
          });
        }
        break;

      case 'CANNON':
        sound.playCannon();
        const splashR = t.level === 4 ? 80 : t.level === 3 ? 65 : t.level === 2 ? 55 : 45;
        this.spawnProjectile(t, target, def.projectileSpeed, splashR);
        break;

      case 'MAGE':
        sound.playMage();
        this.spawnProjectile(t, target, def.projectileSpeed, 0);
        break;

      case 'FROST':
        sound.playFrost();
        const slowMag = t.level === 4 ? 0.65 : t.level === 3 ? 0.55 : t.level === 2 ? 0.45 : 0.35;
        const frostSplash = t.level >= 2 ? 50 : 0;
        this.spawnProjectile(t, target, def.projectileSpeed, frostSplash, slowMag, 2.8);
        break;

      case 'TESLA':
        sound.playTesla();
        this.executeTeslaChain(t, target);
        break;

      case 'SNIPER':
        sound.playSniper();
        this.executeSniperShot(t, target);
        break;

      case 'POISON':
        sound.playPoison();
        const poisonDps = t.level === 4 ? 140 : t.level === 3 ? 70 : t.level === 2 ? 32 : 14;
        const poisonSplash = t.level >= 3 ? 45 : 0;
        this.spawnProjectile(t, target, def.projectileSpeed, poisonSplash, 0, 0, 4.0, poisonDps);
        break;

      case 'FLAME':
        sound.playFlame();
        this.executeFlameBurst(t, target);
        break;
    }
  }

  private spawnProjectile(
    t: TowerInstance,
    target: EnemyInstance,
    speed: number,
    splashRadius = 0,
    slowMag = 0,
    slowDur = 0,
    poisonDur = 0,
    poisonDps = 0
  ) {
    this.projectiles.push({
      id: Math.random().toString(36).substring(2, 9),
      towerType: t.type,
      x: t.x,
      y: t.y,
      startX: t.x,
      startY: t.y,
      targetX: target.x,
      targetY: target.y,
      targetEnemyId: target.id,
      speed,
      damage: t.currentDamage,
      damageType: t.damageType,
      splashRadius,
      slowMagnitude: slowMag,
      slowDuration: slowDur,
      poisonDuration: poisonDur,
      poisonDps: poisonDps,
      chainRemaining: 0,
      chainTargetIds: [],
      pierceRemaining: 0,
      hitRadius: 12,
      color: TOWER_DEFINITIONS[t.type].color,
    });
  }

  private executeTeslaChain(t: TowerInstance, initialTarget: EnemyInstance) {
    const maxChains = t.level === 4 ? 6 : t.level === 3 ? 4 : t.level === 2 ? 3 : 2;
    const chainRange = 120;
    const hitEnemies: EnemyInstance[] = [initialTarget];

    let currentEnemy = initialTarget;
    this.applyDamageToEnemy(initialTarget, t.currentDamage, 'LIGHTNING', false, t);

    this.particleManager.spawnLightning({ x: t.x, y: t.y }, { x: initialTarget.x, y: initialTarget.y }, '#facc15');

    for (let c = 1; c < maxChains; c++) {
      const candidates = this.enemies.filter(
        (e) => !hitEnemies.includes(e) && !e.isStealthed && e.hp > 0 && Math.hypot(e.x - currentEnemy.x, e.y - currentEnemy.y) <= chainRange
      );

      if (candidates.length === 0) break;

      const nextEnemy = candidates[0];
      hitEnemies.push(nextEnemy);

      const chainDmg = t.currentDamage * Math.pow(0.85, c);
      this.applyDamageToEnemy(nextEnemy, chainDmg, 'LIGHTNING', false, t);

      this.particleManager.spawnLightning(
        { x: currentEnemy.x, y: currentEnemy.y },
        { x: nextEnemy.x, y: nextEnemy.y },
        '#facc15'
      );

      currentEnemy = nextEnemy;
    }
  }

  private executeSniperShot(t: TowerInstance, target: EnemyInstance) {
    const isCrit = t.level >= 2 && Math.random() < 0.25;
    const mult = isCrit ? 2.0 : 1.0;
    const finalDmg = t.currentDamage * mult;

    // Sniper instantaneous tracer line
    this.particleManager.spawnLightning({ x: t.x, y: t.y }, { x: target.x, y: target.y }, '#ef4444');
    this.particleManager.spawnSparks(target.x, target.y, '#f87171', 10);

    // Bypasses armor if level 3/4
    const isArmorPiercing = t.level >= 4;
    this.applyDamageToEnemy(target, finalDmg, 'PHYSICAL', isCrit, t, isArmorPiercing ? 1.0 : t.level === 3 ? 0.4 : 0.0);
  }

  private executeFlameBurst(t: TowerInstance, target: EnemyInstance) {
    const angle = Math.atan2(target.y - t.y, target.x - t.x);
    this.particleManager.spawnFlames(t.x, t.y, angle, t.currentRange);

    const isOmni = t.level === 4;
    const coneAngle = isOmni ? Math.PI * 2 : Math.PI / 3; // 360 degree for tier 4, 60 degree for tiers 1-3

    this.enemies.forEach((e) => {
      if (e.isStealthed || e.hp <= 0) return;
      const dist = Math.hypot(e.x - t.x, e.y - t.y);
      if (dist <= t.currentRange) {
        let inCone = isOmni;
        if (!inCone) {
          const eAngle = Math.atan2(e.y - t.y, e.x - t.x);
          let diff = Math.abs(angle - eAngle);
          if (diff > Math.PI) diff = Math.PI * 2 - diff;
          inCone = diff <= coneAngle / 2;
        }

        if (inCone) {
          this.applyDamageToEnemy(e, t.currentDamage, 'FIRE', false, t);
          // Apply burn DoT with clean refresh
          const existingBurn = e.statuses.find((s) => s.type === 'BURN');
          if (existingBurn) {
            existingBurn.duration = 2.0;
            existingBurn.damagePerTick = Math.max(existingBurn.damagePerTick || 0, t.currentDamage * 0.4);
          } else {
            e.statuses.push({
              type: 'BURN',
              duration: 2.0,
              maxDuration: 2.0,
              magnitude: 0,
              damagePerTick: t.currentDamage * 0.4,
            });
          }
        }
      }
    });
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      // If target enemy exists and is alive, track towards current position
      if (p.targetEnemyId) {
        const target = this.enemies.find((e) => e.id === p.targetEnemyId && e.hp > 0);
        if (target) {
          p.targetX = target.x;
          p.targetY = target.y;
        }
      }

      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const dist = Math.hypot(dx, dy);
      const step = p.speed * dt;

      if (dist <= Math.max(step, p.hitRadius) || dist < 1e-4) {
        // Hit target!
        this.detonateProjectile(p);
        this.projectiles.splice(i, 1);
      } else {
        if (!p.trail) p.trail = [];
        p.trail.unshift({ x: p.x, y: p.y });
        if (p.trail.length > 6) p.trail.pop();

        p.x += (dx / dist) * step;
        p.y += (dy / dist) * step;
      }
    }
  }

  private detonateProjectile(p: Projectile) {
    const tower = this.towers.find((t) => t.type === p.towerType);

    if (p.splashRadius > 0) {
      // Area splash
      if (p.towerType === 'CANNON') {
        this.particleManager.spawnExplosion(p.x, p.y, p.splashRadius, '#f97316');
      } else if (p.towerType === 'FROST') {
        this.particleManager.spawnFrostBurst(p.x, p.y, p.splashRadius);
      } else if (p.towerType === 'POISON') {
        this.particleManager.spawnPoisonBurst(p.x, p.y, p.splashRadius);
      }

      this.enemies.forEach((e) => {
        if (e.hp <= 0) return;
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d <= p.splashRadius) {
          const falloff = 1.0 - (d / p.splashRadius) * 0.4;
          this.applyDamageToEnemy(e, p.damage * falloff, p.damageType, false, tower);

          if (p.slowMagnitude > 0) {
            const existingSlow = e.statuses.find((s) => s.type === 'SLOW');
            if (existingSlow) {
              existingSlow.duration = Math.max(existingSlow.duration, p.slowDuration);
              existingSlow.magnitude = Math.max(existingSlow.magnitude, p.slowMagnitude);
            } else {
              e.statuses.push({
                type: 'SLOW',
                duration: p.slowDuration,
                maxDuration: p.slowDuration,
                magnitude: p.slowMagnitude,
              });
            }
          }

          if (p.poisonDps > 0) {
            const existingPoison = e.statuses.find((s) => s.type === 'POISON');
            if (existingPoison) {
              existingPoison.duration = Math.max(existingPoison.duration, p.poisonDuration);
              existingPoison.damagePerTick = Math.min((existingPoison.damagePerTick || 0) + p.poisonDps * 0.25, p.poisonDps * 2.0);
            } else {
              e.statuses.push({
                type: 'POISON',
                duration: p.poisonDuration,
                maxDuration: p.poisonDuration,
                magnitude: 0,
                damagePerTick: p.poisonDps,
              });
            }
          }
        }
      });
    } else {
      // Single target hit - if primary target died mid-flight, hit closest enemy within hit radius
      let target = this.enemies.find((e) => e.id === p.targetEnemyId && e.hp > 0);
      if (!target) {
        target = this.enemies.find((e) => e.hp > 0 && Math.hypot(e.x - p.x, e.y - p.y) <= p.hitRadius + 14);
      }

      if (target) {
        this.applyDamageToEnemy(target, p.damage, p.damageType, false, tower);

        if (p.slowMagnitude > 0) {
          const existingSlow = target.statuses.find((s) => s.type === 'SLOW');
          if (existingSlow) {
            existingSlow.duration = Math.max(existingSlow.duration, p.slowDuration);
            existingSlow.magnitude = Math.max(existingSlow.magnitude, p.slowMagnitude);
          } else {
            target.statuses.push({
              type: 'SLOW',
              duration: p.slowDuration,
              maxDuration: p.slowDuration,
              magnitude: p.slowMagnitude,
            });
          }
        }

        if (p.poisonDps > 0) {
          const existingPoison = target.statuses.find((s) => s.type === 'POISON');
          if (existingPoison) {
            existingPoison.duration = Math.max(existingPoison.duration, p.poisonDuration);
            existingPoison.damagePerTick = Math.min((existingPoison.damagePerTick || 0) + p.poisonDps * 0.25, p.poisonDps * 2.0);
          } else {
            target.statuses.push({
              type: 'POISON',
              duration: p.poisonDuration,
              maxDuration: p.poisonDuration,
              magnitude: 0,
              damagePerTick: p.poisonDps,
            });
          }
        }
      }
    }
  }

  public applyDamageToEnemy(
    e: EnemyInstance,
    rawDmg: number,
    dmgType: DamageType,
    isCrit = false,
    tower?: TowerInstance,
    armorBypassRatio = 0.0
  ) {
    if (e.hp <= 0) return;

    // Check target MARKED status (from Sniper Deadeye specialization)
    if (e.statuses.some((s) => s.type === 'MARKED')) {
      rawDmg *= 1.35;
    }

    // Check target CORROSION status
    if (dmgType === 'PHYSICAL' && e.statuses.some((s) => s.type === 'CORROSION')) {
      rawDmg *= 1.30;
    }

    // 1. SYNERGIES: Detect elemental interactions
    const isPoisoned = e.statuses.some((s) => s.type === 'POISON');
    const isChilledOrFrozen = e.statuses.some((s) => s.type === 'SLOW' || s.type === 'FREEZE');
    const isBurning = e.statuses.some((s) => s.type === 'BURN');

    // A. COMBUSTION (Poison + Fire)
    if (isPoisoned && (dmgType === 'FIRE' || dmgType === 'TRUE')) {
      const comboDmg = (150 + Math.round(e.maxHp * 0.18)) * (1 + this.activePerks.comboDamageBonus);
      this.particleManager.spawnComboText(e.x, e.y, '💥 COMBUSTION!', '#f97316');
      this.particleManager.spawnExplosion(e.x, e.y, 75, '#ea580c');
      this.stats.combosTriggered++;
      updateAchievementProgress('elemental_master', 1);
      sound.playCannon();
      this.enemies.forEach((other) => {
        if (other.id !== e.id && other.hp > 0 && Math.hypot(other.x - e.x, other.y - e.y) <= 75) {
          other.hp -= Math.round(comboDmg * 0.7);
          other.flashTimer = 0.12;
        }
      });
      rawDmg += comboDmg;
    }

    // B. SUPERCONDUCTOR (Frost/Slow + Lightning)
    if (isChilledOrFrozen && dmgType === 'LIGHTNING') {
      const comboDmg = (120 + Math.round(e.maxHp * 0.15)) * (1 + this.activePerks.comboDamageBonus);
      this.particleManager.spawnComboText(e.x, e.y, '⚡ SUPERCONDUCTOR!', '#38bdf8');
      this.particleManager.spawnShockwave(e.x, e.y, 90, '#38bdf8');
      this.stats.combosTriggered++;
      updateAchievementProgress('elemental_master', 1);
      sound.playTesla();
      this.enemies.forEach((other) => {
        if (other.hp > 0 && Math.hypot(other.x - e.x, other.y - e.y) <= 90) {
          other.hp -= Math.round(comboDmg * 0.65);
          other.statuses.push({ type: 'FREEZE', duration: 1.2, maxDuration: 1.2, magnitude: 1.0 });
        }
      });
      rawDmg += comboDmg;
    }

    // C. THERMAL SHOCK (Cold taking Fire OR Burning taking Frost)
    if ((isChilledOrFrozen && dmgType === 'FIRE') || (isBurning && dmgType === 'FROST')) {
      this.particleManager.spawnComboText(e.x, e.y, '❄️🔥 THERMAL SHOCK!', '#e879f9');
      const shatterDmg = 190 * (1 + this.activePerks.comboDamageBonus);
      rawDmg += shatterDmg;
      e.armorShred = (e.armorShred || 0) + e.armor * 0.5;
      e.armor = Math.max(0, e.armor * 0.5);
      this.stats.combosTriggered++;
      updateAchievementProgress('thermal_engineer', 1);
      updateAchievementProgress('elemental_master', 1);
    }

    // D. CORROSION (Poison taking heavy Physical)
    if (isPoisoned && dmgType === 'PHYSICAL' && !e.statuses.some((s) => s.type === 'CORROSION')) {
      e.statuses.push({ type: 'CORROSION', duration: 4.0, maxDuration: 4.0, magnitude: 0.3 });
      this.particleManager.spawnComboText(e.x, e.y, '🧪 CORROSION!', '#84cc16');
      this.stats.combosTriggered++;
      updateAchievementProgress('thermal_engineer', 1);
    }

    // 2. Armor and Elemental Resistances
    const def = ENEMY_DEFINITIONS[e.type];
    const affinities = def?.elementalAffinities;
    const vuln = affinities?.vulnerabilities?.[dmgType] || 0;
    const resist = affinities?.resistances?.[dmgType] || 0;
    const elementalMultiplier = Math.max(0.1, 1.0 + vuln - resist);

    const totalArmorBypass = Math.min(1.0, armorBypassRatio + (this.activePerks.armorPenBonus || 0));
    let effectiveArmor = e.armor * Math.max(0, 1.0 - totalArmorBypass);
    let effectiveMagic = e.magicResist;

    let calculatedDamage = rawDmg * elementalMultiplier * (1 + this.activePerks.globalDamageBonus);
    if (dmgType === 'PHYSICAL') {
      calculatedDamage = calculatedDamage * Math.max(0, 1.0 - effectiveArmor);
    } else if (dmgType === 'MAGICAL') {
      calculatedDamage = calculatedDamage * Math.max(0, 1.0 - effectiveMagic * 0.5);
    } else if (dmgType === 'LIGHTNING' || dmgType === 'FROST' || dmgType === 'FIRE') {
      calculatedDamage = calculatedDamage * Math.max(0, 1.0 - effectiveMagic);
    } else if (dmgType === 'POISON') {
      calculatedDamage = calculatedDamage * Math.max(0, 1.0 - effectiveMagic * 0.3);
    } else if (dmgType === 'TRUE') {
      // 100% True damage ignores all resistances!
    }

    calculatedDamage = Math.max(1, Math.round(calculatedDamage));

    // Shield absorbing (Lightning deals 2.2x to energy shields!)
    if (e.shieldHp > 0) {
      const shieldBonus = dmgType === 'LIGHTNING' ? 2.2 + this.activePerks.shieldDamageBonus : 1.0;
      const shieldDmg = Math.round(calculatedDamage * shieldBonus);
      const shieldAbsorb = Math.min(e.shieldHp, Math.ceil(shieldDmg * 0.6));
      e.shieldHp -= shieldAbsorb;
      calculatedDamage = Math.max(0, calculatedDamage - Math.round(shieldAbsorb / shieldBonus));
      this.particleManager.spawnSparks(e.x, e.y, '#38bdf8', 5);
      if (e.shieldHp <= 0) {
        this.particleManager.spawnSparks(e.x, e.y, '#bae6fd', 12);
        updateAchievementProgress('shield_shatterer', 1);
      }
    }

    // 3. Multi-Phase Boss Transitions
    if (e.type === 'BOSS') {
      const remainingHp = e.hp - calculatedDamage;
      // Phase 2 Enrage
      if (remainingHp <= e.maxHp * 0.6 && e.bossPhase === 1) {
        e.bossPhase = 2;
        e.isEnraged = true;
        e.speed = Math.round(e.baseSpeed * 1.3);
        sound.playBossRoar();
        this.onScreenShakeCb?.();
        this.onAnnouncementCb?.(
          'BOSS ENRAGED - PHASE 2!',
          'Titan gains blood frenzy (+30% speed) and summons escorts!'
        );
        for (let esc = 0; esc < 3; esc++) {
          this.enemies.push({
            id: Math.random().toString(36).substring(2, 9),
            type: 'RUNNER',
            name: 'Titan Vanguard',
            x: e.x + (esc - 1) * 20,
            y: e.y + (esc - 1) * 15,
            hp: 90,
            maxHp: 90,
            shieldHp: 0,
            maxShieldHp: 0,
            speed: 130,
            baseSpeed: 130,
            armor: 0.1,
            magicResist: 0.1,
            armorShred: 0,
            reward: 15,
            baseDamage: 1,
            size: 13,
            color: '#ef4444',
            isFlying: false,
            stealthTimer: 0,
            isStealthed: false,
            healCooldown: 0,
            bossSpecialTimer: 0,
            bossPhase: 1,
            isEnraged: false,
            pathIndex: e.pathIndex,
            distanceTraveled: e.distanceTraveled,
            statuses: [],
            angle: e.angle,
            flashTimer: 0,
            walkCycle: 0,
          });
        }
      }
      // Phase 3 Cataclysm
      if (remainingHp <= e.maxHp * 0.25 && e.bossPhase === 2) {
        e.bossPhase = 3;
        const barrier = Math.round(e.maxHp * 0.3);
        e.shieldHp += barrier;
        e.maxShieldHp += barrier;
        sound.playBossRoar();
        this.onScreenShakeCb?.();
        this.onAnnouncementCb?.(
          'CATACLYSM - FINAL PHASE!',
          'Dread Overlord activates Cataclysmic Shield Barrier!'
        );
      }
    }

    e.hp -= calculatedDamage;
    e.flashTimer = 0.12;

    this.stats.totalDamageDealt += calculatedDamage;
    if (tower) {
      tower.damageDealt += calculatedDamage;
    }

    // Floating damage numbers (if enabled in settings)
    if (this.showDamageNumbers && calculatedDamage > 0) {
      const color =
        isCrit ? '#f59e0b' : dmgType === 'MAGICAL' ? '#c084fc' : dmgType === 'FROST' ? '#38bdf8' : dmgType === 'POISON' ? '#a3e635' : dmgType === 'FIRE' ? '#fb923c' : '#f87171';
      this.particleManager.spawnDamageText(e.x, e.y, `${calculatedDamage}`, color, isCrit ? 1.3 : 1.0);
    }

    if (e.hp <= 0) {
      const idx = this.enemies.indexOf(e);
      if (idx !== -1) {
        if (tower) tower.kills++;
        if (e.type === 'BOSS') {
          updateAchievementProgress('titan_slayer', 1);
        }
        this.eliminateEnemy(idx, true);
      }
    }
  }

  private eliminateEnemy(index: number, rewardGold: boolean) {
    const e = this.enemies[index];
    if (!e) return;

    sound.playDeath();
    this.stats.enemiesKilled++;

    if (rewardGold) {
      const bonusMult = 1 + (this.activePerks.goldRewardBonus || 0);
      const earned = Math.round(e.reward * bonusMult);
      this.gold += earned;
      this.stats.goldEarned += earned;
      this.particleManager.spawnGoldText(e.x, e.y, earned);
    }

    this.particleManager.spawnSparks(e.x, e.y, e.color, 12);
    this.enemies.splice(index, 1);
  }

  // --- Tower Construction & Upgrades ---

  public buildTower(slotId: string, type: TowerType): boolean {
    const slot = this.buildSlots.find((s) => s.id === slotId);
    if (!slot || slot.towerId) return false;

    const def = TOWER_DEFINITIONS[type];
    if (this.gold < def.baseCost) return false;

    this.gold -= def.baseCost;
    this.stats.goldSpent += def.baseCost;
    this.stats.towersBuilt++;

    const tower: TowerInstance = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      slotId: slot.id,
      x: slot.x,
      y: slot.y,
      level: 1,
      currentDamage: def.baseDamage,
      currentRange: def.baseRange,
      currentAttackSpeed: def.baseAttackSpeed,
      damageType: def.damageType,
      targetMode: type === 'SNIPER' ? 'STRONGEST' : 'FIRST',
      totalCostInvested: def.baseCost,
      kills: 0,
      damageDealt: 0,
      cooldownTimer: 0,
      targetId: null,
      angle: -Math.PI / 2,
      firingAnimation: 0,
    };

    slot.towerId = tower.id;
    this.towers.push(tower);
    this.selectedTowerId = tower.id;

    sound.playBuild();
    this.particleManager.spawnSparks(tower.x, tower.y, '#fbbf24', 15);
    this.emitState();
    return true;
  }

  public upgradeTower(towerId: string, branchChoice: 'A' | 'B' = 'A'): boolean {
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower || tower.level >= 4) return false;

    const def = TOWER_DEFINITIONS[tower.type];
    const discount = this.activePerks.upgradeDiscount || 0;

    let tierCost = 0;
    let tierDamage = 0;
    let tierRange = 0;
    let tierSpeed = 0;
    let tierName = '';
    let tierDesc = '';

    if (tower.level === 3 && def.branches) {
      const chosenBranch = branchChoice === 'B' ? def.branches[1] : def.branches[0];
      tierCost = Math.round(chosenBranch.cost * (1 - discount));
      if (this.gold < tierCost) return false;

      tower.branchChoice = chosenBranch.branchId;
      tower.specialization = chosenBranch;
      tierDamage = chosenBranch.damage;
      tierRange = chosenBranch.range;
      tierSpeed = chosenBranch.attackSpeed;
      tierName = chosenBranch.name;
      tierDesc = chosenBranch.specialDescription;
      updateAchievementProgress('tactical_specialist', 1);
    } else {
      const nextTier = def.tiers[tower.level]; // 0-indexed: tier[1] is Lv2
      if (!nextTier) return false;
      tierCost = Math.round(nextTier.cost * (1 - discount));
      if (this.gold < tierCost) return false;

      tierDamage = nextTier.damage;
      tierRange = nextTier.range;
      tierSpeed = nextTier.attackSpeed;
      tierName = nextTier.name;
      tierDesc = nextTier.specialDescription;
    }

    this.gold -= tierCost;
    this.stats.goldSpent += tierCost;
    this.stats.towersUpgraded++;

    tower.level++;
    tower.currentDamage = tierDamage;
    tower.currentRange = tierRange;
    tower.currentAttackSpeed = tierSpeed;
    tower.totalCostInvested += tierCost;

    sound.playUpgrade();
    this.particleManager.spawnLevelUpBurst(tower.x, tower.y, tierName);
    this.onAnnouncementCb?.(`${tierName} Ready!`, tierDesc);
    this.emitState();
    return true;
  }

  public sellTower(towerId: string): boolean {
    const towerIdx = this.towers.findIndex((t) => t.id === towerId);
    if (towerIdx === -1) return false;

    const tower = this.towers[towerIdx];
    const slot = this.buildSlots.find((s) => s.id === tower.slotId);

    const sellRefund = Math.round(tower.totalCostInvested * 0.7);
    this.gold += sellRefund;
    this.stats.goldEarned += sellRefund;
    this.stats.towersSold++;

    if (slot) slot.towerId = undefined;
    this.towers.splice(towerIdx, 1);
    this.selectedTowerId = null;

    sound.playSell();
    this.particleManager.spawnGoldText(tower.x, tower.y, sellRefund);
    this.emitState();
    return true;
  }

  public setTowerTargetMode(towerId: string, mode: TargetMode) {
    const tower = this.towers.find((t) => t.id === towerId);
    if (tower) {
      tower.targetMode = mode;
      this.emitState();
    }
  }

  // --- Active Spells ---

  public castSpell(type: SpellType, targetPt?: Point): boolean {
    if (this.gameStatus === 'PAUSED' || this.gameStatus === 'VICTORY' || this.gameStatus === 'DEFEAT') {
      return false;
    }
    const spell = this.activeSpells[type];
    const def = SPELL_DEFINITIONS.find((s) => s.type === type);
    if (!spell || !def || spell.cooldownRemaining > 0) return false;

    this.stats.spellsCast++;
    spell.cooldownRemaining = def.cooldown;

    switch (type) {
      case 'METEOR':
        if (!targetPt) return false;
        sound.playMeteor();
        this.particleManager.spawnMeteorImpact(targetPt.x, targetPt.y, def.radius);
        this.onScreenShakeCb?.();

        const meteorDmg = 650 + this.waveNumber * 45;
        this.enemies.forEach((e) => {
          if (Math.hypot(e.x - targetPt.x, e.y - targetPt.y) <= def.radius) {
            this.applyDamageToEnemy(e, meteorDmg, 'FIRE', true);
          }
        });
        break;

      case 'FREEZE':
        if (!targetPt) return false;
        sound.playFreezeSpell();
        this.particleManager.spawnFrostBurst(targetPt.x, targetPt.y, def.radius);

        this.enemies.forEach((e) => {
          if (Math.hypot(e.x - targetPt.x, e.y - targetPt.y) <= def.radius) {
            e.statuses.push({
              type: 'FREEZE',
              duration: 4.0,
              maxDuration: 4.0,
              magnitude: 1.0,
            });
          }
        });
        break;

      case 'REINFORCEMENTS':
        sound.playReinforceSpell();
        this.reinforcementsTimer = 8.0;
        this.onAnnouncementCb?.('BATTLE CRY ACTIVE!', 'All towers gain +50% fire rate and +25% range!');
        this.towers.forEach((t) => {
          this.particleManager.spawnSparks(t.x, t.y, '#f59e0b', 12);
        });
        break;

      case 'GOLD_RUSH':
        sound.playCoin();
        const goldBonus = Math.floor(160 + this.waveNumber * 6);
        this.gold += goldBonus;
        this.stats.goldEarned += goldBonus;
        this.particleManager.spawnGoldText(MAP_WIDTH / 2, MAP_HEIGHT / 2, goldBonus);
        this.onAnnouncementCb?.('ROYAL TREASURY!', `Received emergency grant of +${goldBonus} Gold!`);
        break;
    }

    this.targetingSpell = null;
    this.emitState();
    return true;
  }

  // --- Selection & Input Controls ---

  public selectSlot(slotId: string | null) {
    this.selectedSlotId = slotId;
    if (slotId) {
      const slot = this.buildSlots.find((s) => s.id === slotId);
      this.selectedTowerId = slot?.towerId || null;
    } else {
      this.selectedTowerId = null;
    }
    this.emitState();
  }

  public selectTower(towerId: string | null) {
    this.selectedTowerId = towerId;
    if (towerId) {
      const tower = this.towers.find((t) => t.id === towerId);
      this.selectedSlotId = tower?.slotId || null;
    }
    this.emitState();
  }

  public setSpeed(multiplier: number) {
    this.speedMultiplier = multiplier;
    this.emitState();
  }

  public togglePause() {
    if (this.gameStatus === 'VICTORY' || this.gameStatus === 'DEFEAT') return;

    if (this.gameStatus === 'PAUSED') {
      this.gameStatus = this.isSpawningActive || this.enemies.length > 0 ? 'WAVE_ACTIVE' : 'WAVE_BREAK';
    } else if (this.gameStatus === 'WAVE_ACTIVE' || this.gameStatus === 'WAVE_BREAK' || this.gameStatus === 'READY') {
      this.gameStatus = 'PAUSED';
    }
    this.emitState();
  }

  public toggleAutoStart() {
    this.autoStartWaves = !this.autoStartWaves;
    this.emitState();
  }

  public setTargetingSpell(type: SpellType | null) {
    this.targetingSpell = type;
    this.emitState();
  }

  public emitState() {
    if (!this.onStateChangeCb) return;

    const boss = this.enemies.find((e) => e.type === 'BOSS') || null;

    this.onStateChangeCb({
      mapId: this.currentMap.id,
      gameStatus: this.gameStatus,
      lives: this.lives,
      maxLives: this.maxLives,
      gold: this.gold,
      waveNumber: this.waveNumber,
      totalWaves: this.totalWaves,
      isEndless: this.isEndless,
      speedMultiplier: this.speedMultiplier,
      enemiesRemaining: this.enemies.length + this.spawnQueue.length,
      selectedSlotId: this.selectedSlotId,
      selectedTowerId: this.selectedTowerId,
      targetingSpell: this.targetingSpell,
      spells: { ...this.activeSpells },
      waveCountdown: Math.max(0, this.waveCountdown),
      autoStartWaves: this.autoStartWaves,
      bossActive: boss,
      reinforcementsActive: this.reinforcementsTimer > 0,
      reinforcementsRemaining: this.reinforcementsTimer,
      stats: { ...this.stats },
      currentEliteModifier: this.currentEliteModifier,
      activeHazards: [...this.activeHazards],
      perks: { ...this.activePerks },
    });
  }
}
