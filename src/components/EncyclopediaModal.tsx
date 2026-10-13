import React, { useState } from 'react';
import {
  X,
  Shield,
  Crosshair,
  Sparkles,
  Snowflake,
  Zap,
  Droplet,
  Flame,
  ShieldAlert,
  Skull,
  Coins,
  Heart,
  Layers,
  Swords,
  Wind,
  Activity,
  Award,
  BookOpen,
} from 'lucide-react';
import { TOWER_DEFINITIONS } from '../game/towers';
import { ENEMY_DEFINITIONS, ELITE_MODIFIERS, SYNERGY_COMBOS } from '../game/enemies';
import { MAP_DEFINITIONS } from '../game/maps';
import { EnemyType, TowerType, DamageType } from '../game/types';

interface EncyclopediaModalProps {
  onClose: () => void;
}

type TabType = 'TOWERS' | 'ENEMIES' | 'SYNERGIES' | 'MODIFIERS';

export const EncyclopediaModal: React.FC<EncyclopediaModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('TOWERS');
  const [selectedTower, setSelectedTower] = useState<TowerType>('ARCHER');
  const [selectedEnemy, setSelectedEnemy] = useState<EnemyType>('GRUNT');

  const towers = Object.values(TOWER_DEFINITIONS);
  const enemies = Object.values(ENEMY_DEFINITIONS);

  const curTower = TOWER_DEFINITIONS[selectedTower];
  const curEnemy = ENEMY_DEFINITIONS[selectedEnemy];

  const getDamageTypeColor = (type: DamageType) => {
    switch (type) {
      case 'PHYSICAL':
        return 'text-slate-300 bg-slate-800/80 border-slate-700';
      case 'MAGICAL':
        return 'text-purple-300 bg-purple-950/60 border-purple-800';
      case 'FIRE':
        return 'text-orange-300 bg-orange-950/60 border-orange-800';
      case 'FROST':
        return 'text-sky-300 bg-sky-950/60 border-sky-800';
      case 'LIGHTNING':
        return 'text-yellow-300 bg-yellow-950/60 border-yellow-800';
      case 'POISON':
        return 'text-lime-300 bg-lime-950/60 border-lime-800';
      case 'TRUE':
        return 'text-rose-300 bg-rose-950/60 border-rose-800';
      default:
        return 'text-amber-300 bg-amber-950/60 border-amber-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full h-[88vh] max-h-[720px] p-6 shadow-2xl flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-3 pr-10">
          <div>
            <h2 className="font-fantasy font-bold text-slate-100 text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              Tactical Codex & Battle Compendium
            </h2>
            <p className="text-xs text-slate-400">
              Master tower branching specs, elemental synergies, elite enemy affinities & map shrines
            </p>
          </div>

          <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('TOWERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-fantasy font-semibold transition-all cursor-pointer ${
                activeTab === 'TOWERS'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              TOWERS (8)
            </button>
            <button
              onClick={() => setActiveTab('ENEMIES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-fantasy font-semibold transition-all cursor-pointer ${
                activeTab === 'ENEMIES'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ENEMIES (8)
            </button>
            <button
              onClick={() => setActiveTab('SYNERGIES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-fantasy font-semibold transition-all cursor-pointer ${
                activeTab === 'SYNERGIES'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SYNERGIES & COMBOS
            </button>
            <button
              onClick={() => setActiveTab('MODIFIERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-fantasy font-semibold transition-all cursor-pointer ${
                activeTab === 'MODIFIERS'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ELITE MODIFIERS & MAPS
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex gap-5 overflow-hidden">
          {/* TAB 1: TOWERS */}
          {activeTab === 'TOWERS' && (
            <>
              {/* Left Tower List */}
              <div className="w-1/3 overflow-y-auto space-y-2 pr-2">
                {towers.map((t) => (
                  <button
                    key={t.type}
                    onClick={() => setSelectedTower(t.type)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedTower === t.type
                        ? 'bg-amber-500/20 border-amber-500/80 text-amber-300'
                        : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block">{t.name}</span>
                      <span className="text-[10px] uppercase font-mono opacity-75">
                        {t.damageType}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs text-amber-400">
                      <Coins className="w-3 h-3" />
                      <span>{t.baseCost}g</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Right Tower Detail Pane */}
              <div className="flex-1 bg-slate-950/60 rounded-xl p-4 border border-slate-800 overflow-y-auto space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-fantasy font-bold text-slate-100 text-lg">
                      {curTower.name}
                    </h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getDamageTypeColor(curTower.damageType)}`}>
                      {curTower.damageType} DAMAGE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{curTower.description}</p>
                </div>

                {/* Base Stats */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">BASE DMG</span>
                    <span className="font-mono font-bold text-sm text-slate-200">
                      {curTower.baseDamage}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">BASE RNG</span>
                    <span className="font-mono font-bold text-sm text-slate-200">
                      {curTower.baseRange}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">SPEED</span>
                    <span className="font-mono font-bold text-sm text-slate-200">
                      {curTower.baseAttackSpeed}/s
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">COST</span>
                    <span className="font-mono font-bold text-xs text-amber-300">
                      {curTower.baseCost}g
                    </span>
                  </div>
                </div>

                {/* Tiers 1-3 Progression */}
                <div>
                  <h4 className="text-xs font-fantasy font-bold text-amber-300 mb-2 uppercase tracking-wide">
                    Standard Tiers 1-3
                  </h4>
                  <div className="space-y-1.5">
                    {curTower.tiers.slice(0, 3).map((tier) => (
                      <div
                        key={tier.level}
                        className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">
                              Tier {tier.level}: {tier.name}
                            </span>
                            <span className="text-[10px] font-mono text-amber-400">
                              +{tier.cost}g
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {tier.specialDescription}
                          </span>
                        </div>
                        <div className="text-right text-[10px] font-mono text-slate-400">
                          <div>DMG: {tier.damage}</div>
                          <div>RNG: {tier.range}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Branching Tier 4 Specializations */}
                {curTower.branches && (
                  <div>
                    <h4 className="text-xs font-fantasy font-bold text-amber-300 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Tier 4 Branching Specializations (Choose Path A or B)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {curTower.branches.map((b) => (
                        <div
                          key={b.branchId}
                          className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-fantasy font-bold text-xs text-amber-200">
                                {b.name}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                                Path {b.branchId}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-sky-300 block mt-0.5">
                              {b.perkTitle}
                            </span>
                            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                              {b.specialDescription}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300">
                            <span className="text-emerald-400 font-bold">
                              {b.damage} DMG • {b.attackSpeed.toFixed(1)}/s
                            </span>
                            <span className="text-amber-400 font-bold">{b.cost}g</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: ENEMIES */}
          {activeTab === 'ENEMIES' && (
            <>
              {/* Left Enemy List */}
              <div className="w-1/3 overflow-y-auto space-y-2 pr-2">
                {enemies.map((e) => (
                  <button
                    key={e.type}
                    onClick={() => setSelectedEnemy(e.type)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedEnemy === e.type
                        ? 'bg-red-500/20 border-red-500/80 text-red-300'
                        : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block">{e.name}</span>
                      <span className="text-[10px] font-mono opacity-75">
                        {e.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs text-rose-400">
                      <Heart className="w-3 h-3" />
                      <span>{e.baseHp}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Right Enemy Detail Pane */}
              <div className="flex-1 bg-slate-950/60 rounded-xl p-4 border border-slate-800 overflow-y-auto space-y-4">
                <div>
                  <h3 className="font-fantasy font-bold text-slate-100 text-lg">
                    {curEnemy.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">{curEnemy.description}</p>
                </div>

                {/* Enemy Stats Grid */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">BASE HP</span>
                    <span className="font-mono font-bold text-sm text-rose-400">
                      {curEnemy.baseHp}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">SPEED</span>
                    <span className="font-mono font-bold text-sm text-slate-200">
                      {curEnemy.speed} px/s
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">ARMOR</span>
                    <span className="font-mono font-bold text-sm text-sky-400">
                      {(curEnemy.armor * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">MAGIC RESIST</span>
                    <span className="font-mono font-bold text-sm text-purple-400">
                      {((curEnemy.magicResist || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Elemental Affinities */}
                {curEnemy.elementalAffinities && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                      Elemental Strengths & Vulnerabilities
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
                        <span className="font-bold text-emerald-400 block text-[11px]">
                          VULNERABILITIES (Takes Extra Damage):
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(curEnemy.elementalAffinities.vulnerabilities || {}).length > 0 ? (
                            Object.entries(curEnemy.elementalAffinities.vulnerabilities || {}).map(([type, mult]) => (
                              <span
                                key={type}
                                className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 text-[10px] font-mono font-bold"
                              >
                                {type} (+{Math.round(((mult as number) - 1) * 100)}%)
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10px]">None</span>
                          )}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-red-950/40 border border-red-800/60">
                        <span className="font-bold text-red-400 block text-[11px]">
                          RESISTANCES (Resists Damage):
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(curEnemy.elementalAffinities.resistances || {}).length > 0 ? (
                            Object.entries(curEnemy.elementalAffinities.resistances || {}).map(([type, mult]) => (
                              <span
                                key={type}
                                className="px-1.5 py-0.5 rounded bg-red-900/60 text-red-200 text-[10px] font-mono font-bold"
                              >
                                {type} (-{Math.round((1 - (mult as number)) * 100)}%)
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10px]">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Boss Phases Info */}
                {curEnemy.type === 'BOSS' && (
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/60 space-y-2 text-xs">
                    <h4 className="font-bold text-purple-300">Boss Multi-Phase Combat Mechanics:</h4>
                    <div className="space-y-1.5 text-slate-300 text-[11px]">
                      <div>
                        <strong className="text-amber-300">Phase 1 (100% - 60% HP):</strong> Standard march with periodic Ground Stomp earthquake that temporarily stuns adjacent towers.
                      </div>
                      <div>
                        <strong className="text-red-400">Phase 2 (60% - 25% HP - Berserk):</strong> Enraged surge! +30% movement speed and spawns Vanguard Minion escorts.
                      </div>
                      <div>
                        <strong className="text-purple-400">Phase 3 (25% - 0% HP - Cataclysm):</strong> Activates a massive Cataclysmic Shield Barrier (30% Max HP) and pulses apocalyptic shockwaves.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 3: SYNERGIES & COMBOS */}
          {activeTab === 'SYNERGIES' && (
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <h3 className="font-fantasy font-bold text-amber-200 text-sm">
                  Elemental Reactions & Tower Synergies
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Combining different elemental damage types triggers explosive reactions and status overloads.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.values(SYNERGY_COMBOS).map((combo) => (
                  <div
                    key={combo.type}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-fantasy font-bold text-sm" style={{ color: combo.color }}>
                          {combo.title}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-bold">
                          {combo.formula}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {combo.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: combo.color }} />
                      <span>Triggers floating combo notifications & awards achievement progress!</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ELITE MODIFIERS & MAP HAZARDS */}
          {activeTab === 'MODIFIERS' && (
            <div className="flex-1 overflow-y-auto pr-1 space-y-5">
              {/* Elite Modifiers */}
              <div>
                <h3 className="font-fantasy font-bold text-amber-300 text-sm mb-2 uppercase tracking-wide flex items-center gap-1.5">
                  <Skull className="w-4 h-4 text-red-400" />
                  Elite Wave Modifiers (Campaign & Endless Waves)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {Object.values(ELITE_MODIFIERS).map((mod) => (
                    <div
                      key={mod.type}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3"
                    >
                      <div
                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: mod.badgeColor }}
                      />
                      <div>
                        <span className="font-fantasy font-bold text-xs text-slate-100">
                          {mod.name}
                        </span>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                          {mod.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Hazards & Shrines */}
              <div>
                <h3 className="font-fantasy font-bold text-amber-300 text-sm mb-2 uppercase tracking-wide flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Battlefield Shrines & Environmental Hazards
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {Object.values(MAP_DEFINITIONS).map((map) => (
                    <div
                      key={map.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <span className="font-fantasy font-bold text-xs text-amber-200">
                          {map.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block mb-1">
                          {map.subtitle}
                        </span>
                        {map.hazards && map.hazards[0] ? (
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 mt-2">
                            <strong className="text-amber-300 block mb-0.5">
                              {map.hazards[0].name}
                            </strong>
                            <span>{map.hazards[0].description}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Close Compendium
          </button>
        </div>
      </div>
    </div>
  );
};
