import React from 'react';
import { Flame, Snowflake, Shield, Coins } from 'lucide-react';
import { ActiveSpellState, SpellType } from '../game/types';
import { SPELL_DEFINITIONS } from '../game/maps';

interface SpellBarProps {
  spells: Record<SpellType, ActiveSpellState>;
  targetingSpell: SpellType | null;
  onSelectSpell: (type: SpellType) => void;
  onCancelSpell: () => void;
}

export const SpellBar: React.FC<SpellBarProps> = ({
  spells,
  targetingSpell,
  onSelectSpell,
  onCancelSpell,
}) => {
  const getIcon = (type: SpellType) => {
    switch (type) {
      case 'METEOR':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'FREEZE':
        return <Snowflake className="w-5 h-5 text-sky-400" />;
      case 'REINFORCEMENTS':
        return <Shield className="w-5 h-5 text-amber-400" />;
      case 'GOLD_RUSH':
        return <Coins className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getBorderColor = (type: SpellType, isTargeting: boolean, onCooldown: boolean) => {
    if (isTargeting) return 'border-amber-400 ring-2 ring-amber-400/50 shadow-amber-500/50';
    if (onCooldown) return 'border-slate-800 opacity-60';
    switch (type) {
      case 'METEOR':
        return 'border-orange-500/50 hover:border-orange-400';
      case 'FREEZE':
        return 'border-sky-500/50 hover:border-sky-400';
      case 'REINFORCEMENTS':
        return 'border-amber-500/50 hover:border-amber-400';
      case 'GOLD_RUSH':
        return 'border-yellow-500/50 hover:border-yellow-400';
    }
  };

  return (
    <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 p-2 rounded-xl backdrop-blur-md shadow-xl">
      <div className="hidden sm:block text-xs font-fantasy font-semibold text-amber-400/90 tracking-wide pr-1 border-r border-slate-700">
        SPELLS
      </div>

      {SPELL_DEFINITIONS.map((def, idx) => {
        const state = spells[def.type];
        const isCooldown = state.cooldownRemaining > 0;
        const isTargeting = targetingSpell === def.type;
        const cooldownRatio = state.cooldownRemaining / def.cooldown;

        return (
          <button
            key={def.type}
            onClick={() => {
              if (isTargeting) {
                onCancelSpell();
              } else if (!isCooldown) {
                onSelectSpell(def.type);
              }
            }}
            disabled={isCooldown}
            title={`${def.name} (${idx + 1}): ${def.description}`}
            className={`relative group p-2 rounded-lg bg-slate-800/80 border transition-all cursor-pointer disabled:cursor-not-allowed ${getBorderColor(
              def.type,
              isTargeting,
              isCooldown
            )}`}
          >
            {/* Hotkey Tag */}
            <span className="absolute -top-2 -right-1 px-1 text-[10px] font-mono font-bold bg-slate-950 border border-slate-700 rounded text-slate-300">
              {idx + 1}
            </span>

            {/* Icon */}
            <div className="w-6 h-6 flex items-center justify-center">
              {getIcon(def.type)}
            </div>

            {/* Cooldown Radial Overlay */}
            {isCooldown && (
              <div
                className="absolute inset-0 bg-slate-950/80 rounded-lg flex items-center justify-center backdrop-blur-[1px]"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${
                    cooldownRatio > 0.125 ? '100% 0%,' : ''
                  }${cooldownRatio > 0.375 ? '100% 100%,' : ''}${
                    cooldownRatio > 0.625 ? '0% 100%,' : ''
                  }${cooldownRatio > 0.875 ? '0% 0%,' : ''} 50% 0%)`,
                }}
              >
                <span className="text-[11px] font-mono font-bold text-amber-300">
                  {Math.ceil(state.cooldownRemaining)}s
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
