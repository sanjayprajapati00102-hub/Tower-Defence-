import {
  AchievementDef,
  AchievementState,
  GameSettings,
  LeaderboardEntry,
  MapId,
  SaveData,
} from './types';

const STORAGE_KEY = 'kingdom_guardians_save_v1';

export const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  {
    id: 'first_blood',
    title: 'First Blood',
    description: 'Defeat your very first enemy wave.',
    perkDescription: '+35 Starting Gold on all deployments.',
    category: 'COMBAT',
    targetValue: 1,
  },
  {
    id: 'tactical_specialist',
    title: 'Legendary Arsenal',
    description: 'Upgrade any tower to a Tier 4 Specialization.',
    perkDescription: '5% permanent discount on all tower upgrades.',
    category: 'SPECIALIZATION',
    targetValue: 1,
  },
  {
    id: 'elemental_master',
    title: 'Elemental Fusion',
    description: 'Trigger 25 Synergy Combos (Combustion, Superconductor, etc.).',
    perkDescription: '+20% bonus damage on all synergy combo explosions.',
    category: 'TACTICS',
    targetValue: 25,
  },
  {
    id: 'flawless_defense',
    title: 'Iron Bastion',
    description: 'Complete any battlefield with 100% castle lives remaining.',
    perkDescription: '+5 Base Castle Lives on every map.',
    category: 'CAMPAIGN',
    targetValue: 1,
  },
  {
    id: 'shield_shatterer',
    title: 'Barrier Breaker',
    description: 'Break 40 enemy energy shields with Lightning or Acid.',
    perkDescription: '+30% bonus damage against shielded enemies.',
    category: 'COMBAT',
    targetValue: 40,
  },
  {
    id: 'titan_slayer',
    title: 'Titan Slayer',
    description: 'Defeat the monumental Dread Titan Valgorath on Wave 30.',
    perkDescription: '+120 Starting Gold on all maps.',
    category: 'CAMPAIGN',
    targetValue: 1,
  },
  {
    id: 'survival_commander',
    title: 'Endless Veteran',
    description: 'Survive to Wave 20 or higher in Endless Mode.',
    perkDescription: '+12% bonus gold from all slain enemies.',
    category: 'SPECIALIZATION',
    targetValue: 20,
  },
  {
    id: 'meteor_wrath',
    title: 'Wrath of the Heavens',
    description: 'Obliterate 60 enemies with Meteor Strike spells.',
    perkDescription: '-15% spell cooldowns across all spells.',
    category: 'TACTICS',
    targetValue: 60,
  },
  {
    id: 'thermal_engineer',
    title: 'Thermal Fracture',
    description: 'Inflict Thermal Shock or Acidic Corrosion 30 times.',
    perkDescription: '+15% armor penetration on all physical towers.',
    category: 'TACTICS',
    targetValue: 30,
  },
  {
    id: 'absolute_frost',
    title: 'Glacial Warden',
    description: 'Slow or freeze 150 enemies with Frost towers or spells.',
    perkDescription: '+1.0 second freeze and slow duration.',
    category: 'SPECIALIZATION',
    targetValue: 150,
  },
  {
    id: 'hellfire_scourge',
    title: 'Dragon Fire',
    description: 'Deal 35,000 total Fire damage to enemy legions.',
    perkDescription: '+25% burn damage over time tick rate.',
    category: 'COMBAT',
    targetValue: 35000,
  },
  {
    id: 'grand_guardian',
    title: 'Grand Guardian of the Realm',
    description: 'Earn 3 Stars on all 3 Campaign Battlefields.',
    perkDescription: 'Crown of Victory aura: All towers deal +10% bonus damage.',
    category: 'CAMPAIGN',
    targetValue: 3,
  },
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lb-1',
    rank: 1,
    commanderName: 'Archmage Varis',
    waveReached: 42,
    score: 84500,
    enemiesKilled: 642,
    mapId: 'volcanic',
    difficulty: 'HARD',
    date: '2026-10-10',
  },
  {
    id: 'lb-2',
    rank: 2,
    commanderName: 'Lady Elyse of Greenwood',
    waveReached: 37,
    score: 69200,
    enemiesKilled: 512,
    mapId: 'greenwood',
    difficulty: 'NORMAL',
    date: '2026-10-09',
  },
  {
    id: 'lb-3',
    rank: 3,
    commanderName: 'Iron Lord Torben',
    waveReached: 31,
    score: 51800,
    enemiesKilled: 418,
    mapId: 'frozen',
    difficulty: 'NORMAL',
    date: '2026-10-08',
  },
  {
    id: 'lb-4',
    rank: 4,
    commanderName: 'Ranger Captain Kira',
    waveReached: 26,
    score: 38400,
    enemiesKilled: 320,
    mapId: 'greenwood',
    difficulty: 'EASY',
    date: '2026-10-07',
  },
];

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.85,
  sfxVolume: 0.8,
  musicVolume: 0.4,
  showDamageNumbers: true,
  screenShake: true,
  autoStartWaves: false,
  particleQuality: 'HIGH',
};

const DEFAULT_SAVE: SaveData = {
  campaignProgress: {
    greenwood: {
      unlocked: true,
      completed: false,
      stars: 0,
      highestWave: 0,
      highScore: 0,
    },
    frozen: {
      unlocked: false,
      completed: false,
      stars: 0,
      highestWave: 0,
      highScore: 0,
    },
    volcanic: {
      unlocked: false,
      completed: false,
      stars: 0,
      highestWave: 0,
      highScore: 0,
    },
  },
  endlessHighScore: 0,
  totalEnemiesSlain: 0,
  settings: DEFAULT_SETTINGS,
  tutorialCompleted: false,
  commanderName: 'Guardian Rowan',
  achievements: ACHIEVEMENT_DEFINITIONS.reduce((acc, a) => {
    acc[a.id] = { id: a.id, progress: 0, unlocked: false };
    return acc;
  }, {} as Record<string, AchievementState>),
  endlessLeaderboard: INITIAL_LEADERBOARD,
};

export function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SAVE;
    const parsed = JSON.parse(raw);

    // Merge achievements ensuring new achievements exist
    const mergedAchievements = { ...DEFAULT_SAVE.achievements };
    if (parsed.achievements) {
      Object.keys(parsed.achievements).forEach((k) => {
        if (mergedAchievements[k]) {
          mergedAchievements[k] = parsed.achievements[k];
        }
      });
    }

    return {
      ...DEFAULT_SAVE,
      ...parsed,
      campaignProgress: {
        ...DEFAULT_SAVE.campaignProgress,
        ...(parsed.campaignProgress || {}),
      },
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {}),
      },
      commanderName: parsed.commanderName || DEFAULT_SAVE.commanderName,
      achievements: mergedAchievements,
      endlessLeaderboard: parsed.endlessLeaderboard && parsed.endlessLeaderboard.length > 0
        ? parsed.endlessLeaderboard
        : INITIAL_LEADERBOARD,
    };
  } catch {
    return DEFAULT_SAVE;
  }
}

export function saveGameData(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save game data to localStorage', e);
  }
}

export function updateCommanderName(name: string): SaveData {
  const data = loadSaveData();
  data.commanderName = name.trim() || 'Guardian Rowan';
  saveGameData(data);
  return data;
}

export function updateMapProgress(
  mapId: MapId,
  wave: number,
  score: number,
  completed: boolean,
  livesRemaining: number,
  maxLives: number
): SaveData {
  const data = loadSaveData();
  const current = data.campaignProgress[mapId] || {
    unlocked: true,
    completed: false,
    stars: 0,
    highestWave: 0,
    highScore: 0,
  };

  const stars = completed
    ? livesRemaining === maxLives
      ? 3
      : livesRemaining > maxLives * 0.5
      ? 2
      : 1
    : current.stars;

  data.campaignProgress[mapId] = {
    unlocked: true,
    completed: current.completed || completed,
    stars: Math.max(current.stars, stars),
    highestWave: Math.max(current.highestWave, wave),
    highScore: Math.max(current.highScore, score),
  };

  // Unlock next map
  if (completed) {
    if (mapId === 'greenwood') {
      data.campaignProgress.frozen.unlocked = true;
    } else if (mapId === 'frozen') {
      data.campaignProgress.volcanic.unlocked = true;
    }
  }

  saveGameData(data);
  return data;
}

export function updateAchievementProgress(
  achievementId: string,
  incrementBy = 1,
  setValue?: number
): { data: SaveData; justUnlocked: boolean } {
  const data = loadSaveData();
  const ach = data.achievements[achievementId];
  const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.id === achievementId);
  if (!ach || !def) return { data, justUnlocked: false };

  if (ach.unlocked) return { data, justUnlocked: false };

  const prevProgress = ach.progress;
  ach.progress = setValue !== undefined ? setValue : prevProgress + incrementBy;

  let justUnlocked = false;
  if (ach.progress >= def.targetValue && !ach.unlocked) {
    ach.unlocked = true;
    ach.unlockedAt = new Date().toISOString().split('T')[0];
    justUnlocked = true;
  }

  saveGameData(data);
  return { data, justUnlocked };
}

export function addLeaderboardRecord(
  entry: Omit<LeaderboardEntry, 'id' | 'rank'>
): SaveData {
  const data = loadSaveData();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: Math.random().toString(36).substring(2, 9),
  };

  const list = [...data.endlessLeaderboard, newEntry];
  // Sort descending by waveReached, then by score
  list.sort((a, b) => {
    if (b.waveReached !== a.waveReached) return b.waveReached - a.waveReached;
    return b.score - a.score;
  });

  // Re-rank top 10
  const top10 = list.slice(0, 10).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  data.endlessLeaderboard = top10;
  data.endlessHighScore = Math.max(data.endlessHighScore, entry.waveReached);
  saveGameData(data);
  return data;
}

export interface ActivePerks {
  startingGoldBonus: number;
  bonusCastleLives: number;
  upgradeDiscount: number;
  comboDamageBonus: number;
  shieldDamageBonus: number;
  armorPenBonus: number;
  spellCooldownReduction: number;
  burnDpsBonus: number;
  freezeDurationBonus: number;
  goldRewardBonus: number;
  globalDamageBonus: number;
}

export function getActivePerks(saveData: SaveData): ActivePerks {
  const ach = saveData.achievements;
  return {
    startingGoldBonus: (ach['first_blood']?.unlocked ? 35 : 0) + (ach['titan_slayer']?.unlocked ? 120 : 0),
    bonusCastleLives: ach['flawless_defense']?.unlocked ? 5 : 0,
    upgradeDiscount: ach['tactical_specialist']?.unlocked ? 0.05 : 0.0,
    comboDamageBonus: ach['elemental_master']?.unlocked ? 0.20 : 0.0,
    shieldDamageBonus: ach['shield_shatterer']?.unlocked ? 0.30 : 0.0,
    armorPenBonus: ach['thermal_engineer']?.unlocked ? 0.15 : 0.0,
    spellCooldownReduction: ach['meteor_wrath']?.unlocked ? 0.15 : 0.0,
    burnDpsBonus: ach['hellfire_scourge']?.unlocked ? 0.25 : 0.0,
    freezeDurationBonus: ach['absolute_frost']?.unlocked ? 1.0 : 0.0,
    goldRewardBonus: ach['survival_commander']?.unlocked ? 0.12 : 0.0,
    globalDamageBonus: ach['grand_guardian']?.unlocked ? 0.10 : 0.0,
  };
}
