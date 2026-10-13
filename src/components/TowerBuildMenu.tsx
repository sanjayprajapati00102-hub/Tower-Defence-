import React from 'react';
import {
  X,
  Coins,
  Crosshair,
  Zap,
  Flame,
  Snowflake,
  ShieldAlert,
  Sparkles,
  Droplet,
} from 'lucide-react';
import { TOWER_DEFINITIONS } from '../game/towers';
import { TowerType } from '../game/types';

interface TowerBuildMenuProps {
  currentGold: number;
  onSelectTower: (type: TowerType) => void;
  onClose: () => void;
}

export const TowerBuildMenu: React.FC<TowerBuildMenuProps> = ({
  currentGold,
  onSelectTower,
  onClose,
}) => {
  const towers = Object.values(TOWER_DEFINITIONS);

  const getTowerIcon = (type: TowerType) => {
    switch (type) {
      case 'ARCHER':
        return <Crosshair className="w-5 h-5 text-emerald-400" />;
      case 'CANNON':
        return <ShieldAlert className="w-5 h-5 text-orange-400" />;
      case 'MAGE':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'FROST':
        return <Snowflake className="w-5 h-5 text-sky-400" />;
      case 'TESLA':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'SNIPER':
        return <Crosshair className="w-5 h-5 text-red-400" />;
      case 'POISON':
        return <Droplet className="w-5 h-5 text-lime-400" />;
      case 'FLAME':
        return <Flame className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-30 animate-slide-up">
      <div className="bg-slate-900/95 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-fantasy font-bold text-amber-300 text-sm tracking-wider uppercase">
              Construct Defense Tower
            </span>
            <span className="text-xs text-slate-400">
              Select a tower to deploy at this location
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {towers.map((t) => {
            const canAfford = currentGold >= t.baseCost;

            return (
              <button
                key={t.type}
                disabled={!canAfford}
                onClick={() => onSelectTower(t.type)}
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer disabled:cursor-not-allowed ${
                  canAfford
                    ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 hover:border-amber-400/80 hover:scale-[1.03]'
                    : 'bg-slate-900/60 border-slate-800/80 opacity-50'
                }`}
              >
                {/* Header with Icon and Cost */}
                <div className="w-full flex items-center justify-between mb-1.5">
                  <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700/60">
                    {getTowerIcon(t.type)}
                  </div>
                  <div
                    className={`flex items-center gap-1 font-mono text-xs font-bold ${
                      canAfford ? 'text-amber-300' : 'text-red-400'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.baseCost}</span>
                  </div>
                </div>

                {/* Name */}
                <div className="w-full text-center">
                  <h4 className="font-bold text-xs text-slate-200 truncate">
                    {t.name.replace(' Tower', '')}
                  </h4>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    {t.damageType}
                  </span>
                </div>

                {/* Stats */}
                <div className="w-full mt-2 pt-1.5 border-t border-slate-700/50 flex justify-around text-[10px] font-mono text-slate-400">
                  <div title="Base Damage">
                    <span className="text-slate-500">D:</span>
                    <span className="text-slate-200 ml-0.5">{t.baseDamage}</span>
                  </div>
                  <div title="Attack Range">
                    <span className="text-slate-500">R:</span>
                    <span className="text-slate-200 ml-0.5">{t.baseRange}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
