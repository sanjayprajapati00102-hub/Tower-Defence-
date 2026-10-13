import React from 'react';
import { Skull, Flame, ShieldAlert } from 'lucide-react';
import { EnemyInstance } from '../game/types';

interface BossBarProps {
  boss: EnemyInstance;
}

export const BossBar: React.FC<BossBarProps> = ({ boss }) => {
  const hpRatio = Math.max(0, Math.min(1, boss.hp / boss.maxHp));
  const hpPercent = Math.round(hpRatio * 100);
  const phase = boss.bossPhase || 1;

  const getPhaseBadge = () => {
    if (phase === 3) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/30 border border-purple-400 text-purple-200 animate-pulse">
          <ShieldAlert className="w-3 h-3 text-purple-300" />
          PHASE 3: CATACLYSM
        </span>
      );
    }
    if (phase === 2 || boss.isEnraged) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600/30 border border-red-500 text-red-200 animate-pulse">
          <Flame className="w-3 h-3 text-red-400" />
          PHASE 2: ENRAGED
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/50 text-amber-300">
        PHASE 1
      </span>
    );
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pointer-events-none z-20 animate-fade-in">
      <div className="bg-slate-900/95 border border-red-500/60 rounded-xl p-2.5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-red-950/80 border border-red-500/50 text-red-400">
              <Skull className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-fantasy font-bold text-sm text-red-200 tracking-wider">
                  {boss.name}
                </span>
                {getPhaseBadge()}
              </div>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-red-300">
            {boss.hp} / {boss.maxHp} HP ({hpPercent}%)
          </span>
        </div>

        {/* Health Bar */}
        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-red-900/50 relative">
          <div
            className={`h-full rounded-full transition-all duration-150 shadow-lg ${
              phase === 3
                ? 'bg-gradient-to-r from-purple-600 via-rose-500 to-amber-400 shadow-purple-500/50'
                : phase === 2
                ? 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 shadow-red-500/50'
                : 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shadow-red-500/50'
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>

        {/* Dread Barrier Shield (Phase 3) */}
        {boss.shieldHp > 0 && boss.maxShieldHp > 0 && (
          <div className="mt-1 h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-purple-800/60">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all"
              style={{ width: `${Math.round((boss.shieldHp / boss.maxShieldHp) * 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
