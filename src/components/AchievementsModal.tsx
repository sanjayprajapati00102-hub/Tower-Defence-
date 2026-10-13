import React, { useState } from 'react';
import {
  X,
  Trophy,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  Flame,
  Shield,
  Coins,
  Crown,
  Swords,
  Layers,
} from 'lucide-react';
import { ACHIEVEMENT_DEFINITIONS } from '../game/storage';
import { SaveData } from '../game/types';

interface AchievementsModalProps {
  saveData: SaveData;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  saveData,
  onClose,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'COMBAT' | 'TACTICS' | 'SPECIALIZATION' | 'CAMPAIGN'>('ALL');

  const totalAchievements = ACHIEVEMENT_DEFINITIONS.length;
  const unlockedCount = ACHIEVEMENT_DEFINITIONS.filter(
    (a) => saveData.achievements[a.id]?.unlocked
  ).length;

  const filteredAchievements = ACHIEVEMENT_DEFINITIONS.filter(
    (a) => filter === 'ALL' || a.category === filter
  );

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

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-slate-800 pb-4 pr-10">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <h2 className="font-fantasy font-bold text-slate-100 text-xl tracking-wide">
                Royal Achievements & Passive Perks
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Accomplish tactical milestones to earn permanent kingdom buffs, starting gold, and spell bonuses
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-amber-500/30">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Progress</span>
              <span className="text-sm font-mono font-bold text-amber-300">
                {unlockedCount} / {totalAchievements} Unlocked
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-amber-500/40 flex items-center justify-center font-bold text-xs text-amber-400 font-mono">
              {Math.round((unlockedCount / totalAchievements) * 100)}%
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
          {(['ALL', 'COMBAT', 'TACTICS', 'SPECIALIZATION', 'CAMPAIGN'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-fantasy font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filter === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'ALL ACHIEVEMENTS' : cat}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredAchievements.map((ach) => {
            const state = saveData.achievements[ach.id] || { progress: 0, unlocked: false };
            const isUnlocked = state.unlocked;
            const progressRatio = Math.min(1, (state.progress || 0) / ach.targetValue);

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-slate-950/80 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${
                          isUnlocked
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isUnlocked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-fantasy font-bold text-sm text-slate-100">
                          {ach.title}
                        </h4>
                        <span className="text-[10px] font-mono uppercase text-slate-400">
                          {ach.category}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isUnlocked
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isUnlocked ? 'ACTIVE PERK' : `${state.progress || 0} / ${ach.targetValue}`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2.5 font-sans leading-relaxed">
                    {ach.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  {/* Perk Badge */}
                  <div
                    className={`flex items-center gap-1.5 p-2 rounded-lg text-xs ${
                      isUnlocked
                        ? 'bg-amber-950/40 border border-amber-500/30 text-amber-200'
                        : 'bg-slate-900 border border-slate-800 text-slate-500'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="font-medium text-[11px] leading-tight">
                      <strong>Perk:</strong> {ach.perkDescription}
                    </span>
                  </div>

                  {/* Progress Bar (if not unlocked) */}
                  {!isUnlocked && (
                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(progressRatio * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>All unlocked perks stack automatically in Campaign and Endless modes.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
