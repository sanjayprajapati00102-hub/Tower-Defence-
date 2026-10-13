import {
  EliteModifierDef,
  EliteModifierType,
  EnemyDef,
  EnemyType,
  SynergyComboInfo,
  SynergyComboType,
  WaveDef,
} from './types';

export const SYNERGY_COMBOS: Record<SynergyComboType, SynergyComboInfo> = {
  COMBUSTION: {
    type: 'COMBUSTION',
    title: 'Toxic Combustion',
    description: 'Poison + Fire trigger a violent volatile blast dealing high AoE damage.',
    color: '#f97316',
    formula: 'Poison Status + Fire Damage',
  },
  SUPERCONDUCTOR: {
    type: 'SUPERCONDUCTOR',
    title: 'Superconductor Shock',
    description: 'Chilled/Frozen enemies conduct electricity violently, unleashing an EMP stun discharge.',
    color: '#38bdf8',
    formula: 'Frost / Slow + Lightning Damage',
  },
  THERMAL_SHOCK: {
    type: 'THERMAL_SHOCK',
    title: 'Thermal Shock Shatter',
    description: 'Rapid temperature contrast fractures armor (-50% armor) and triggers shatter damage.',
    color: '#e879f9',
    formula: 'Frost + Fire OR Burn + Frost',
  },
  CORROSION: {
    type: 'CORROSION',
    title: 'Acidic Corrosion',
    description: 'Acid melts cracked armor plates, amplifying physical damage taken by 30%.',
    color: '#84cc16',
    formula: 'Poison Status + Heavy Physical',
  },
};

export const ELITE_MODIFIERS: Record<EliteModifierType, EliteModifierDef> = {
  ARMORED_HORDE: {
    type: 'ARMORED_HORDE',
    name: 'Iron Plated',
    description: '+35% base armor. Weak to Armor Penetration, Acid, and Magic.',
    badgeColor: '#94a3b8',
    accentBg: 'rgba(148, 163, 184, 0.15)',
  },
  SWIFT_WIND: {
    type: 'SWIFT_WIND',
    name: 'Gale Wind',
    description: '+30% movement speed. Highly vulnerable to Frost and Slow.',
    badgeColor: '#38bdf8',
    accentBg: 'rgba(56, 189, 248, 0.15)',
  },
  REGENERATIVE: {
    type: 'REGENERATIVE',
    name: 'Troll Blood',
    description: 'Enemies continuously regenerate 3% max HP/s. Burn status stops healing.',
    badgeColor: '#22c55e',
    accentBg: 'rgba(34, 197, 94, 0.15)',
  },
  ARCANE_SHIELD: {
    type: 'ARCANE_SHIELD',
    name: 'Spell Warded',
    description: '+40% magic resist and kinetic barriers. Vulnerable to Lightning.',
    badgeColor: '#a855f7',
    accentBg: 'rgba(168, 85, 247, 0.15)',
  },
  BOUNTY_HUNTERS: {
    type: 'BOUNTY_HUNTERS',
    name: 'Golden Hoard',
    description: 'Enemies have +25% HP but yield +60% bonus Gold on defeat!',
    badgeColor: '#fbbf24',
    accentBg: 'rgba(251, 191, 36, 0.15)',
  },
  BERSERKERS: {
    type: 'BERSERKERS',
    name: 'Blood Frenzy',
    description: 'Enemies gain +40% speed when below 50% HP.',
    badgeColor: '#ef4444',
    accentBg: 'rgba(239, 68, 68, 0.15)',
  },
  COLOSSAL_SIZE: {
    type: 'COLOSSAL_SIZE',
    name: 'Colossal Swarm',
    description: '+50% HP and +20% size. High resistance to crowd control.',
    badgeColor: '#f97316',
    accentBg: 'rgba(249, 115, 22, 0.15)',
  },
};

export const ENEMY_DEFINITIONS: Record<EnemyType, EnemyDef> = {
  GRUNT: {
    type: 'GRUNT',
    name: 'Goblin Raider',
    description: 'Standard aggressive foot soldier with balanced speed and health.',
    baseHp: 90,
    speed: 68,
    armor: 0.05,
    magicResist: 0.0,
    reward: 12,
    scoreValue: 50,
    baseDamage: 1,
    color: '#22c55e',
    size: 15,
    isFlying: false,
    elementalAffinities: {
      vulnerabilities: { PHYSICAL: 0.15, FIRE: 0.25 },
      resistances: {},
    },
  },

  RUNNER: {
    type: 'RUNNER',
    name: 'Dire Wolf Scout',
    description: 'Swift beast that dashes past slow defenses. Low health.',
    baseHp: 60,
    speed: 125,
    armor: 0.0,
    magicResist: 0.0,
    reward: 14,
    scoreValue: 65,
    baseDamage: 1,
    color: '#eab308',
    size: 13,
    isFlying: false,
    elementalAffinities: {
      vulnerabilities: { FROST: 0.4 },
      resistances: { PHYSICAL: 0.1 },
    },
  },

  TANK: {
    type: 'TANK',
    name: 'Ironclad Golem',
    description: 'Heavily armored juggernaut. Absorbs tremendous physical punishment.',
    baseHp: 380,
    speed: 40,
    armor: 0.45,
    magicResist: 0.1,
    reward: 35,
    scoreValue: 160,
    baseDamage: 2,
    color: '#94a3b8',
    size: 21,
    isFlying: false,
    elementalAffinities: {
      vulnerabilities: { POISON: 0.45 },
      resistances: { PHYSICAL: 0.35, FIRE: 0.2 },
    },
  },

  SHIELDBEARER: {
    type: 'SHIELDBEARER',
    name: 'Bastion Knight',
    description: 'Projects a kinetic energy barrier that absorbs 50% damage until shattered.',
    baseHp: 220,
    speed: 52,
    armor: 0.25,
    magicResist: 0.15,
    reward: 28,
    scoreValue: 120,
    baseDamage: 2,
    color: '#0284c7',
    size: 18,
    isFlying: false,
    elementalAffinities: {
      vulnerabilities: { LIGHTNING: 0.75 },
      resistances: { PHYSICAL: 0.25 },
    },
  },

  HEALER: {
    type: 'HEALER',
    name: 'Corrupted Shaman',
    description: 'Periodically pulses healing waves, restoring health to nearby companions.',
    baseHp: 170,
    speed: 55,
    armor: 0.0,
    magicResist: 0.35,
    reward: 30,
    scoreValue: 140,
    baseDamage: 2,
    color: '#10b981',
    size: 16,
    isFlying: false,
    elementalAffinities: {
      vulnerabilities: { FIRE: 0.35 },
      resistances: { POISON: 0.5, MAGICAL: 0.2 },
    },
  },

  FLYING: {
    type: 'FLYING',
    name: 'Gargoyle Skystalker',
    description: 'Winged fiend that glides above ground obstacles and moves with high agility.',
    baseHp: 130,
    speed: 90,
    armor: 0.1,
    magicResist: 0.2,
    reward: 22,
    scoreValue: 100,
    baseDamage: 1,
    color: '#8b5cf6',
    size: 16,
    isFlying: true,
    elementalAffinities: {
      vulnerabilities: { LIGHTNING: 0.5, PHYSICAL: 0.2 },
      resistances: { POISON: 0.3 },
    },
  },

  STEALTH: {
    type: 'STEALTH',
    name: 'Shadow Infiltrator',
    description: 'Cloaks in darkness every 5 seconds, becoming untargetable for 2.5 seconds.',
    baseHp: 150,
    speed: 78,
    armor: 0.1,
    magicResist: 0.1,
    reward: 26,
    scoreValue: 110,
    baseDamage: 1,
    color: '#475569',
    size: 14,
    isFlying: false,
    elementalAffinities: {
      vulnerabilities: { MAGICAL: 0.4, FROST: 0.25 },
      resistances: {},
    },
  },

  BOSS: {
    type: 'BOSS',
    name: 'Void Titan Overlord',
    description: 'Monumental entity with colossal durability, earthquake stomps, and dark shields.',
    baseHp: 3200,
    speed: 34,
    armor: 0.3,
    magicResist: 0.3,
    reward: 250,
    scoreValue: 1500,
    baseDamage: 5,
    color: '#dc2626',
    size: 28,
    isFlying: false,
    elementalAffinities: {
      vulnerabilities: { POISON: 0.25 },
      resistances: { PHYSICAL: 0.2, MAGICAL: 0.2, FIRE: 0.15 },
    },
  },
};

/**
 * 30 Progressively Challenging Waves
 */
export const CAMPAIGN_WAVES: WaveDef[] = [
  // Waves 1 - 5: Tutorial & Early Foundations
  {
    waveNumber: 1,
    description: 'Scout Vanguard - A band of basic goblin raiders approaches.',
    bonusGold: 50,
    groups: [{ enemyType: 'GRUNT', count: 6, interval: 1.6, initialDelay: 0.5 }],
  },
  {
    waveNumber: 2,
    description: 'Fast Infiltration - Dire wolf scouts sprint ahead.',
    bonusGold: 55,
    groups: [
      { enemyType: 'GRUNT', count: 6, interval: 1.4, initialDelay: 0.5 },
      { enemyType: 'RUNNER', count: 4, interval: 1.2, initialDelay: 5.0 },
    ],
  },
  {
    waveNumber: 3,
    description: 'Goblin Horde - Heavy foot soldier presence.',
    bonusGold: 60,
    groups: [
      { enemyType: 'GRUNT', count: 10, interval: 1.2, initialDelay: 0.5 },
      { enemyType: 'RUNNER', count: 5, interval: 1.0, initialDelay: 6.0 },
    ],
  },
  {
    waveNumber: 4,
    description: 'Speed Rush - Multiple swift packs rushing the gate.',
    bonusGold: 65,
    eliteModifier: 'SWIFT_WIND',
    groups: [
      { enemyType: 'RUNNER', count: 12, interval: 0.8, initialDelay: 0.5 },
      { enemyType: 'GRUNT', count: 6, interval: 1.1, initialDelay: 6.0 },
    ],
  },
  {
    waveNumber: 5,
    description: 'Armored Vanguard - First appearance of Ironclad Golems!',
    bonusGold: 75,
    groups: [
      { enemyType: 'TANK', count: 2, interval: 3.5, initialDelay: 0.5 },
      { enemyType: 'GRUNT', count: 8, interval: 1.1, initialDelay: 3.0 },
    ],
  },

  // Waves 6 - 10: Mixed Formations & First Mini-Boss
  {
    waveNumber: 6,
    description: 'Iron March - Armored golems screening swift wolves.',
    bonusGold: 80,
    eliteModifier: 'ARMORED_HORDE',
    groups: [
      { enemyType: 'TANK', count: 3, interval: 3.0, initialDelay: 0.5 },
      { enemyType: 'RUNNER', count: 8, interval: 1.0, initialDelay: 4.0 },
    ],
  },
  {
    waveNumber: 7,
    description: 'Shield Wall - Bastion Knights deploy energy barriers.',
    bonusGold: 85,
    groups: [
      { enemyType: 'SHIELDBEARER', count: 4, interval: 2.2, initialDelay: 0.5 },
      { enemyType: 'GRUNT', count: 12, interval: 1.0, initialDelay: 3.5 },
    ],
  },
  {
    waveNumber: 8,
    description: 'Phalanx Charge - Coordinated shields and runners.',
    bonusGold: 90,
    groups: [
      { enemyType: 'SHIELDBEARER', count: 6, interval: 1.8, initialDelay: 0.5 },
      { enemyType: 'RUNNER', count: 10, interval: 0.9, initialDelay: 5.0 },
    ],
  },
  {
    waveNumber: 9,
    description: 'Heavy Siege Formation - Triple ironclad golems supported by foot troops.',
    bonusGold: 100,
    groups: [
      { enemyType: 'TANK', count: 4, interval: 2.5, initialDelay: 0.5 },
      { enemyType: 'SHIELDBEARER', count: 4, interval: 2.0, initialDelay: 4.0 },
      { enemyType: 'GRUNT', count: 10, interval: 0.9, initialDelay: 8.0 },
    ],
  },
  {
    waveNumber: 10,
    description: 'MINI-BOSS: Golem Crusher descends upon the valley!',
    bonusGold: 150,
    isBossWave: true,
    bossName: 'Golem Crusher',
    groups: [
      { enemyType: 'BOSS', count: 1, interval: 1.0, initialDelay: 0.5 },
      { enemyType: 'TANK', count: 2, interval: 3.0, initialDelay: 4.0 },
      { enemyType: 'RUNNER', count: 8, interval: 1.0, initialDelay: 8.0 },
    ],
  },

  // Waves 11 - 15: Magic Support & Sky Invasions
  {
    waveNumber: 11,
    description: 'Dark Sorcery - Corrupted Shamans healing frontline troops.',
    bonusGold: 110,
    eliteModifier: 'REGENERATIVE',
    groups: [
      { enemyType: 'HEALER', count: 3, interval: 2.5, initialDelay: 0.5 },
      { enemyType: 'TANK', count: 3, interval: 2.5, initialDelay: 1.5 },
      { enemyType: 'GRUNT', count: 10, interval: 1.0, initialDelay: 4.0 },
    ],
  },
  {
    waveNumber: 12,
    description: 'Sky Terror - Gargoyles take flight over defenses!',
    bonusGold: 115,
    groups: [
      { enemyType: 'FLYING', count: 8, interval: 1.3, initialDelay: 0.5 },
      { enemyType: 'RUNNER', count: 8, interval: 1.0, initialDelay: 4.0 },
    ],
  },
  {
    waveNumber: 13,
    description: 'Dual Threat - Combined aerial swarm and shield wall.',
    bonusGold: 120,
    groups: [
      { enemyType: 'SHIELDBEARER', count: 6, interval: 1.8, initialDelay: 0.5 },
      { enemyType: 'FLYING', count: 7, interval: 1.4, initialDelay: 3.0 },
      { enemyType: 'HEALER', count: 3, interval: 2.5, initialDelay: 6.0 },
    ],
  },
  {
    waveNumber: 14,
    description: 'Sustained Assault - High-density healing columns.',
    bonusGold: 130,
    eliteModifier: 'ARCANE_SHIELD',
    groups: [
      { enemyType: 'TANK', count: 4, interval: 2.2, initialDelay: 0.5 },
      { enemyType: 'HEALER', count: 4, interval: 2.0, initialDelay: 2.0 },
      { enemyType: 'RUNNER', count: 12, interval: 0.8, initialDelay: 6.0 },
    ],
  },
  {
    waveNumber: 15,
    description: 'Aerial Blitzkrieg - Wave after wave of gargoyle skystalkers.',
    bonusGold: 140,
    groups: [
      { enemyType: 'FLYING', count: 14, interval: 1.1, initialDelay: 0.5 },
      { enemyType: 'TANK', count: 3, interval: 3.0, initialDelay: 4.0 },
    ],
  },

  // Waves 16 - 20: Stealth Attacks & Second Mini-Boss
  {
    waveNumber: 16,
    description: 'Shadow Infiltration - Shadow Assassins vanish into thin air!',
    bonusGold: 145,
    groups: [
      { enemyType: 'STEALTH', count: 6, interval: 1.8, initialDelay: 0.5 },
      { enemyType: 'RUNNER', count: 8, interval: 1.0, initialDelay: 3.0 },
    ],
  },
  {
    waveNumber: 17,
    description: 'Unseen Danger - Cloaked assassins under shield cover.',
    bonusGold: 150,
    groups: [
      { enemyType: 'SHIELDBEARER', count: 6, interval: 1.6, initialDelay: 0.5 },
      { enemyType: 'STEALTH', count: 7, interval: 1.5, initialDelay: 2.5 },
      { enemyType: 'FLYING', count: 6, interval: 1.4, initialDelay: 6.0 },
    ],
  },
  {
    waveNumber: 18,
    description: 'The Black March - Dense multi-class legion with blood frenzy.',
    bonusGold: 160,
    eliteModifier: 'BERSERKERS',
    groups: [
      { enemyType: 'TANK', count: 5, interval: 2.0, initialDelay: 0.5 },
      { enemyType: 'HEALER', count: 4, interval: 2.0, initialDelay: 2.0 },
      { enemyType: 'STEALTH', count: 8, interval: 1.2, initialDelay: 5.0 },
      { enemyType: 'RUNNER', count: 10, interval: 0.8, initialDelay: 8.0 },
    ],
  },
  {
    waveNumber: 19,
    description: 'Storm of Steel - Massive armored front with aerial backline.',
    bonusGold: 175,
    groups: [
      { enemyType: 'SHIELDBEARER', count: 8, interval: 1.5, initialDelay: 0.5 },
      { enemyType: 'TANK', count: 4, interval: 2.2, initialDelay: 3.0 },
      { enemyType: 'FLYING', count: 10, interval: 1.2, initialDelay: 6.0 },
    ],
  },
  {
    waveNumber: 20,
    description: 'MINI-BOSS: Necrolord Malakor commands the undead legion!',
    bonusGold: 220,
    isBossWave: true,
    bossName: 'Necrolord Malakor',
    groups: [
      { enemyType: 'BOSS', count: 1, interval: 1.0, initialDelay: 0.5 },
      { enemyType: 'STEALTH', count: 6, interval: 1.5, initialDelay: 3.0 },
      { enemyType: 'HEALER', count: 3, interval: 2.5, initialDelay: 5.0 },
      { enemyType: 'FLYING', count: 8, interval: 1.2, initialDelay: 8.0 },
    ],
  },

  // Waves 21 - 25: Elite Formations
  {
    waveNumber: 21,
    description: 'Relentless Swarm - Rapid successive waves of elite runners and skystalkers.',
    bonusGold: 180,
    groups: [
      { enemyType: 'RUNNER', count: 18, interval: 0.7, initialDelay: 0.5 },
      { enemyType: 'FLYING', count: 10, interval: 1.1, initialDelay: 5.0 },
    ],
  },
  {
    waveNumber: 22,
    description: 'Indomitable Wall - Heavy shield ranks flanked by healers.',
    bonusGold: 190,
    groups: [
      { enemyType: 'SHIELDBEARER', count: 10, interval: 1.4, initialDelay: 0.5 },
      { enemyType: 'HEALER', count: 5, interval: 2.0, initialDelay: 2.5 },
      { enemyType: 'TANK', count: 4, interval: 2.2, initialDelay: 6.0 },
    ],
  },
  {
    waveNumber: 23,
    description: 'Ghostly Vanguard - Cloaked stealth assassins and flying monstrosities.',
    bonusGold: 200,
    groups: [
      { enemyType: 'STEALTH', count: 12, interval: 1.2, initialDelay: 0.5 },
      { enemyType: 'FLYING', count: 12, interval: 1.2, initialDelay: 4.0 },
      { enemyType: 'RUNNER', count: 14, interval: 0.8, initialDelay: 8.0 },
    ],
  },
  {
    waveNumber: 24,
    description: 'Cataclysm Formation - Heavy iron golems backed by regenerative shamans.',
    bonusGold: 215,
    groups: [
      { enemyType: 'TANK', count: 7, interval: 2.0, initialDelay: 0.5 },
      { enemyType: 'HEALER', count: 6, interval: 1.8, initialDelay: 2.0 },
      { enemyType: 'SHIELDBEARER', count: 8, interval: 1.4, initialDelay: 6.0 },
    ],
  },
  {
    waveNumber: 25,
    description: 'Twin Behemoths - Two devastating mini-bosses advance together!',
    bonusGold: 260,
    isBossWave: true,
    bossName: 'Twin Behemoths',
    groups: [
      { enemyType: 'BOSS', count: 2, interval: 6.0, initialDelay: 0.5 },
      { enemyType: 'STEALTH', count: 8, interval: 1.3, initialDelay: 4.0 },
      { enemyType: 'FLYING', count: 10, interval: 1.2, initialDelay: 8.0 },
    ],
  },

  // Waves 26 - 29: The Final Crucible
  {
    waveNumber: 26,
    description: 'Endless Sky - Maximum aerial raid against kingdom airspace.',
    bonusGold: 230,
    groups: [
      { enemyType: 'FLYING', count: 22, interval: 0.9, initialDelay: 0.5 },
      { enemyType: 'RUNNER', count: 16, interval: 0.7, initialDelay: 5.0 },
    ],
  },
  {
    waveNumber: 27,
    description: 'Shadow Influx - Huge company of stealth assassins slipping through lines.',
    bonusGold: 240,
    groups: [
      { enemyType: 'STEALTH', count: 16, interval: 1.0, initialDelay: 0.5 },
      { enemyType: 'SHIELDBEARER', count: 10, interval: 1.3, initialDelay: 4.0 },
      { enemyType: 'HEALER', count: 6, interval: 1.6, initialDelay: 7.0 },
    ],
  },
  {
    waveNumber: 28,
    description: 'Armored Catastrophe - Unstoppable armored juggernauts.',
    bonusGold: 260,
    groups: [
      { enemyType: 'TANK', count: 10, interval: 1.8, initialDelay: 0.5 },
      { enemyType: 'HEALER', count: 8, interval: 1.5, initialDelay: 2.0 },
      { enemyType: 'SHIELDBEARER', count: 12, interval: 1.2, initialDelay: 6.0 },
    ],
  },
  {
    waveNumber: 29,
    description: 'The Calm Before the Storm - Complete combined arms armada!',
    bonusGold: 300,
    groups: [
      { enemyType: 'TANK', count: 6, interval: 1.8, initialDelay: 0.5 },
      { enemyType: 'SHIELDBEARER', count: 10, interval: 1.2, initialDelay: 3.0 },
      { enemyType: 'FLYING', count: 14, interval: 1.0, initialDelay: 6.0 },
      { enemyType: 'STEALTH', count: 12, interval: 1.1, initialDelay: 9.0 },
      { enemyType: 'RUNNER', count: 20, interval: 0.6, initialDelay: 12.0 },
    ],
  },

  // Wave 30: THE GRAND FINAL BOSS ENCOUNTER
  {
    waveNumber: 30,
    description: 'FINAL CONFRONTATION: Dread Titan Valgorath approaches to shatter the Kingdom!',
    bonusGold: 500,
    isBossWave: true,
    bossName: 'Dread Titan Valgorath',
    groups: [
      { enemyType: 'BOSS', count: 1, interval: 1.0, initialDelay: 0.5 },
      { enemyType: 'TANK', count: 6, interval: 2.2, initialDelay: 5.0 },
      { enemyType: 'HEALER', count: 6, interval: 2.0, initialDelay: 8.0 },
      { enemyType: 'FLYING', count: 14, interval: 1.0, initialDelay: 12.0 },
      { enemyType: 'STEALTH', count: 10, interval: 1.2, initialDelay: 16.0 },
    ],
  },
];

/**
 * Generates an endless mode wave with scaling difficulty
 */
export function generateEndlessWave(waveNum: number): WaveDef {
  const hpMultiplier = Math.pow(1.12, waveNum - 30);
  const isBossWave = waveNum % 5 === 0;

  const gruntCount = Math.floor(10 + (waveNum - 30) * 1.5);
  const runnerCount = Math.floor(8 + (waveNum - 30) * 1.2);
  const tankCount = Math.floor(4 + (waveNum - 30) * 0.8);
  const flyingCount = Math.floor(6 + (waveNum - 30) * 0.8);
  const stealthCount = Math.floor(5 + (waveNum - 30) * 0.7);

  const groups = [
    { enemyType: 'TANK' as EnemyType, count: tankCount, interval: 1.8, initialDelay: 0.5 },
    { enemyType: 'SHIELDBEARER' as EnemyType, count: Math.floor(tankCount * 1.2), interval: 1.4, initialDelay: 3.0 },
    { enemyType: 'FLYING' as EnemyType, count: flyingCount, interval: 1.1, initialDelay: 5.0 },
    { enemyType: 'STEALTH' as EnemyType, count: stealthCount, interval: 1.1, initialDelay: 8.0 },
    { enemyType: 'RUNNER' as EnemyType, count: runnerCount, interval: 0.7, initialDelay: 11.0 },
    { enemyType: 'GRUNT' as EnemyType, count: gruntCount, interval: 0.9, initialDelay: 14.0 },
  ];

  if (isBossWave) {
    groups.unshift({
      enemyType: 'BOSS' as EnemyType,
      count: Math.floor(1 + (waveNum - 30) / 10),
      interval: 8.0,
      initialDelay: 1.0,
    });
  }

  const modifierPool: EliteModifierType[] = [
    'ARMORED_HORDE',
    'SWIFT_WIND',
    'REGENERATIVE',
    'ARCANE_SHIELD',
    'BOUNTY_HUNTERS',
    'BERSERKERS',
    'COLOSSAL_SIZE',
  ];
  const rolledModifier = modifierPool[(waveNum * 3) % modifierPool.length];

  return {
    waveNumber: waveNum,
    description: isBossWave
      ? `Endless Wave ${waveNum}: Cataclysmic Titan Assault!`
      : `Endless Wave ${waveNum}: Ruthless Swarm (HP x${hpMultiplier.toFixed(2)})`,
    bonusGold: Math.floor(150 + waveNum * 8),
    isBossWave,
    bossName: isBossWave ? `Abyssal Behemoth Mk.${waveNum}` : undefined,
    eliteModifier: rolledModifier,
    groups,
  };
}
