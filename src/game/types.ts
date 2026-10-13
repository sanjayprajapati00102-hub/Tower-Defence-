export type TowerType =
  | 'ARCHER'
  | 'CANNON'
  | 'MAGE'
  | 'FROST'
  | 'TESLA'
  | 'SNIPER'
  | 'POISON'
  | 'FLAME';

export type EnemyType =
  | 'GRUNT'
  | 'RUNNER'
  | 'TANK'
  | 'SHIELDBEARER'
  | 'HEALER'
  | 'FLYING'
  | 'STEALTH'
  | 'BOSS';

export type TargetMode = 'FIRST' | 'LAST' | 'STRONGEST' | 'NEAREST';

export type DamageType = 'PHYSICAL' | 'MAGICAL' | 'FROST' | 'LIGHTNING' | 'POISON' | 'FIRE' | 'TRUE';

export type MapId = 'greenwood' | 'frozen' | 'volcanic';

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

export type SpellType = 'METEOR' | 'FREEZE' | 'REINFORCEMENTS' | 'GOLD_RUSH';

export type GameStatus = 'READY' | 'WAVE_ACTIVE' | 'WAVE_BREAK' | 'PAUSED' | 'VICTORY' | 'DEFEAT';

export interface Point {
  x: number;
  y: number;
}

export interface BuildSlot {
  id: string;
  x: number;
  y: number;
  radius: number;
  towerId?: string;
}

export interface BranchingSpecialization {
  branchId: 'A' | 'B';
  name: string;
  perkTitle: string;
  cost: number;
  damage: number;
  range: number;
  attackSpeed: number;
  damageType?: DamageType;
  specialDescription: string;
  color?: string;
}

export interface UpgradeTier {
  level: number;
  name: string;
  cost: number;
  damage: number;
  range: number;
  attackSpeed: number; // attacks per second
  specialDescription: string;
}

export interface TowerDef {
  type: TowerType;
  name: string;
  description: string;
  baseCost: number;
  damageType: DamageType;
  baseDamage: number;
  baseRange: number;
  baseAttackSpeed: number;
  projectileSpeed: number;
  color: string;
  accentColor: string;
  tiers: UpgradeTier[];
  branches?: [BranchingSpecialization, BranchingSpecialization];
}

export interface TowerInstance {
  id: string;
  type: TowerType;
  slotId: string;
  x: number;
  y: number;
  level: number; // 1 to 4
  branchChoice?: 'A' | 'B';
  specialization?: BranchingSpecialization;
  currentDamage: number;
  currentRange: number;
  currentAttackSpeed: number;
  damageType: DamageType;
  targetMode: TargetMode;
  totalCostInvested: number;
  kills: number;
  damageDealt: number;
  cooldownTimer: number; // seconds remaining until next attack
  targetId: string | null;
  angle: number; // orientation in radians for turret facing
  firingAnimation: number; // 0 to 1 for muzzle flash/kickback
}

export interface EnemyDef {
  type: EnemyType;
  name: string;
  description: string;
  baseHp: number;
  speed: number; // pixels per second
  armor: number; // 0 to 1 damage reduction from physical
  magicResist: number; // 0 to 1 damage reduction from magical
  reward: number; // gold reward
  scoreValue: number;
  baseDamage: number; // lives taken if reaching exit
  color: string;
  size: number;
  isFlying?: boolean;
  elementalAffinities?: {
    resistances?: Partial<Record<DamageType, number>>;
    vulnerabilities?: Partial<Record<DamageType, number>>;
  };
}

export interface StatusEffect {
  type: 'SLOW' | 'POISON' | 'FREEZE' | 'BURN' | 'CORROSION' | 'MARKED';
  duration: number; // seconds
  maxDuration: number;
  magnitude: number; // e.g. 0.4 = 40% slow or extra damage
  tickTimer?: number;
  damagePerTick?: number;
}

export interface EnemyInstance {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  shieldHp: number;
  maxShieldHp: number;
  speed: number;
  baseSpeed: number;
  armor: number;
  magicResist: number;
  armorShred: number; // accumulated reduction
  reward: number;
  baseDamage: number;
  size: number;
  color: string;
  isFlying: boolean;
  stealthTimer: number; // seconds remaining in current stealth cycle
  isStealthed: boolean;
  healCooldown: number; // for healer enemy
  bossSpecialTimer: number; // for boss attacks
  bossPhase: number; // 1, 2, or 3
  isEnraged: boolean;
  pathIndex: number; // waypoint index
  distanceTraveled: number;
  statuses: StatusEffect[];
  angle: number;
  flashTimer: number; // hit feedback flash
  walkCycle: number;
}

export interface Projectile {
  id: string;
  towerType: TowerType;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  targetEnemyId: string | null;
  speed: number;
  damage: number;
  damageType: DamageType;
  splashRadius: number;
  slowDuration: number;
  slowMagnitude: number;
  poisonDuration: number;
  poisonDps: number;
  chainRemaining: number;
  chainTargetIds: string[];
  pierceRemaining: number;
  hitRadius: number;
  color: string;
  trail?: Point[];
}

export interface Shockwave {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  gravity?: number;
  glow?: boolean;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  scale: number;
}

export interface LightningArc {
  id: string;
  points: Point[];
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface GroundDecal {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface WaveEnemyGroup {
  enemyType: EnemyType;
  count: number;
  interval: number; // seconds between spawns
  initialDelay: number; // delay before this group begins
}

export type EliteModifierType =
  | 'ARMORED_HORDE'
  | 'SWIFT_WIND'
  | 'REGENERATIVE'
  | 'ARCANE_SHIELD'
  | 'BOUNTY_HUNTERS'
  | 'BERSERKERS'
  | 'COLOSSAL_SIZE';

export interface EliteModifierDef {
  type: EliteModifierType;
  name: string;
  description: string;
  badgeColor: string;
  accentBg: string;
}

export type SynergyComboType = 'COMBUSTION' | 'SUPERCONDUCTOR' | 'THERMAL_SHOCK' | 'CORROSION';

export interface SynergyComboInfo {
  type: SynergyComboType;
  title: string;
  description: string;
  color: string;
  formula: string;
}

export interface WaveDef {
  waveNumber: number;
  groups: WaveEnemyGroup[];
  bonusGold: number;
  description: string;
  isBossWave?: boolean;
  bossName?: string;
  eliteModifier?: EliteModifierType;
}

export type MapHazardType = 'SHRINE' | 'BLIZZARD' | 'LAVA_GEYSER';

export interface MapHazardDef {
  id: string;
  name: string;
  type: MapHazardType;
  description: string;
  x?: number;
  y?: number;
  radius?: number;
  interval: number; // seconds between activation cycles
  duration: number; // duration of active effect
}

export interface ActiveMapHazardState {
  def: MapHazardDef;
  cycleTimer: number;
  activeRemaining: number;
  isActive: boolean;
}

export interface MapDef {
  id: MapId;
  name: string;
  subtitle: string;
  description: string;
  difficulty: Difficulty;
  theme: 'GRASSLAND' | 'FROZEN' | 'VOLCANIC';
  backgroundColor: string;
  pathColor: string;
  pathBorderColor: string;
  waypoints: Point[];
  flyingWaypoints?: Point[];
  buildSlots: BuildSlot[];
  startingGold: number;
  startingLives: number;
  sceneryElements: SceneryElement[];
  hazards?: MapHazardDef[];
}

export interface SceneryElement {
  type: 'TREE' | 'ROCK' | 'WATER' | 'SNOW_PATCH' | 'LAVA_POOL' | 'CRYSTAL' | 'RUINS' | 'TORCH';
  x: number;
  y: number;
  radius: number;
  variant?: number;
}

export interface SpellDef {
  type: SpellType;
  name: string;
  description: string;
  cooldown: number; // seconds
  goldCost: number;
  radius: number;
  icon: string;
}

export interface ActiveSpellState {
  type: SpellType;
  cooldownRemaining: number;
}

export interface GameStats {
  enemiesKilled: number;
  totalDamageDealt: number;
  goldEarned: number;
  goldSpent: number;
  towersBuilt: number;
  towersUpgraded: number;
  towersSold: number;
  spellsCast: number;
  wavesCompleted: number;
  perfectWaves: number;
  combosTriggered: number;
}

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  showDamageNumbers: boolean;
  screenShake: boolean;
  autoStartWaves: boolean;
  particleQuality: 'HIGH' | 'LOW';
}

export interface MapProgress {
  unlocked: boolean;
  completed: boolean;
  stars: number;
  highestWave: number;
  highScore: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  perkDescription: string;
  category: 'COMBAT' | 'SPECIALIZATION' | 'CAMPAIGN' | 'TACTICS';
  targetValue: number;
}

export interface AchievementState {
  id: string;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  rank?: number;
  commanderName: string;
  waveReached: number;
  score: number;
  enemiesKilled: number;
  mapId: MapId;
  difficulty: Difficulty;
  date: string;
}

export interface SaveData {
  campaignProgress: Record<MapId, MapProgress>;
  endlessHighScore: number;
  totalEnemiesSlain: number;
  settings: GameSettings;
  tutorialCompleted: boolean;
  commanderName: string;
  achievements: Record<string, AchievementState>;
  endlessLeaderboard: LeaderboardEntry[];
}
