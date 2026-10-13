import React, { useState } from 'react';
import {
  X,
  ArrowUpCircle,
  Coins,
  DollarSign,
  Crosshair,
  ShieldAlert,
  Sparkles,
  Snowflake,
  Zap,
  Droplet,
  Flame,
  Award,
  Swords,
} from 'lucide-react';
import { TOWER_DEFINITIONS } from '../game/towers';
import { TargetMode, TowerInstance, TowerType } from '../game/types';

interface TowerInspectorProps {
  tower: TowerInstance;
  currentGold: number;
  onUpgrade: (branchChoice?: 'A' | 'B') => void;
  onSell: () => void;
  onChangeTargetMode: (mode: TargetMode) => void;
  onClose: () => void;
}

export const TowerInspector: React.FC<TowerInspectorProps> = ({
  tower,
  currentGold,
  onUpgrade,
  onSell,
  onChangeTargetMode,
  onClose,
}) => {
  const [showSellConfirm, setShowSellConfirm] = useState(false);
  const def = TOWER_DEFINITIONS[tower.type];
  const currentTier = def.tiers[tower.level - 1];
  const nextTier = tower.level < 4 ? def.tiers[tower.level] : null;

  const canAffordUpgrade = nextTier ? currentGold >= nextTier.cost : false;
  const sellValue = Math.round(tower.totalCostInvested * 0.7);

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

  const targetModes: TargetMode[] = ['FIRST', 'LAST', 'STRONGEST', 'NEAREST'];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-30 animate-slide-up">
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
              {getTowerIcon(tower.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-fantasy font-bold text-slate-100 text-base">
                  {currentTier.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  TIER {tower.level}
                </span>
              </div>
              <p className="text-xs text-slate-400">{def.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Targeting Modes */}
        <div className="my-3 flex items-center justify-between bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 pl-2">Target Priority:</span>
          <div className="flex gap-1">
            {targetModes.map((mode) => (
              <button
                key={mode}
                onClick={() => onChangeTargetMode(mode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  tower.targetMode === mode
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-3 text-center">
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">DAMAGE</span>
            <span className="font-mono font-bold text-sm text-slate-100">
              {tower.currentDamage}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">RANGE</span>
            <span className="font-mono font-bold text-sm text-slate-100">
              {tower.currentRange}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">SPEED</span>
            <span className="font-mono font-bold text-sm text-slate-100">
              {tower.currentAttackSpeed.toFixed(1)}/s
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">KILLS</span>
            <span className="font-mono font-bold text-sm text-amber-300">
              {tower.kills}
            </span>
          </div>
        </div>

        {/* Upgrade / Branching / Sell Actions */}
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
          {tower.level === 3 && def.branches ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-fantasy font-bold text-amber-300 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                CHOOSE TIER 4 BRANCHING SPECIALIZATION:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {def.branches.map((b) => {
                  const canAfford = currentGold >= b.cost;
                  return (
                    <button
                      key={b.branchId}
                      disabled={!canAfford}
                      onClick={() => onUpgrade(b.branchId)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer disabled:cursor-not-allowed ${
                        canAfford
                          ? 'bg-slate-900/90 hover:bg-slate-800 border-amber-500/50 hover:border-amber-400 shadow-md shadow-amber-500/10'
                          : 'bg-slate-950/60 border-slate-800 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-fantasy font-bold text-amber-200">
                            {b.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                            Path {b.branchId}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-sky-300 block mt-0.5">
                          {b.perkTitle}
                        </span>
                        <p className="text-[10px] text-slate-300 mt-1 line-clamp-2 leading-tight">
                          {b.specialDescription}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800 text-[11px] font-mono">
                        <span className="text-emerald-400 font-bold">
                          {b.damage} dmg • {b.attackSpeed.toFixed(1)}/s
                        </span>
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Coins className="w-3 h-3" />
                          <span>{b.cost}g</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : nextTier ? (
            <button
              disabled={!canAffordUpgrade}
              onClick={() => onUpgrade('A')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer disabled:cursor-not-allowed ${
                canAffordUpgrade
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4" />
                <div className="text-left">
                  <span className="block leading-tight">Upgrade to {nextTier.name}</span>
                  <span className="text-[10px] font-normal opacity-90 block">
                    {nextTier.specialDescription}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <Coins className="w-3.5 h-3.5" />
                <span>{nextTier.cost}</span>
              </div>
            </button>
          ) : (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
              <span className="text-xs font-fantasy font-bold text-amber-300 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {tower.specialization ? tower.specialization.name : 'MAX SPECIALIZATION'}
              </span>
              {tower.specialization && (
                <span className="text-[10px] text-amber-200/80 block mt-0.5">
                  {tower.specialization.specialDescription}
                </span>
              )}
            </div>
          )}

          {/* Sell Button Row */}
          <div className="flex justify-end">
            {showSellConfirm ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onSell();
                    setShowSellConfirm(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                >
                  Confirm (+{sellValue}g)
                </button>
                <button
                  onClick={() => setShowSellConfirm(false)}
                  className="px-2 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (tower.level >= 3) {
                    setShowSellConfirm(true);
                  } else {
                    onSell();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/80 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Sell Tower ({sellValue}g)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
