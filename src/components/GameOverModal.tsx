import React from 'react';
import { Trophy, Skull, Star, RotateCcw, Home, Play, Swords } from 'lucide-react';
import { GameStats, GameStatus } from '../game/types';

interface GameOverModalProps {
  status: GameStatus;
  waveReached: number;
  totalWaves: number;
  livesRemaining: number;
  maxLives: number;
  isEndless: boolean;
  stats: GameStats;
  onRetry: () => void;
  onContinueEndless?: () => void;
  onReturnToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  waveReached,
  totalWaves,
  livesRemaining,
  maxLives,
  isEndless,
  stats,
  onRetry,
  onContinueEndless,
  onReturnToMenu,
}) => {
  const isVictory = status === 'VICTORY';

  const stars = isVictory
    ? livesRemaining === maxLives
      ? 3
      : livesRemaining > maxLives * 0.5
      ? 2
      : 1
    : 0;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div
        className={`bg-slate-900 border ${
          isVictory ? 'border-amber-500/70 shadow-amber-500/20' : 'border-red-500/70 shadow-red-500/20'
        } rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-center`}
      >
        {/* Emblem */}
        <div className="inline-flex p-3 rounded-2xl bg-slate-950 border border-slate-800 mb-3 shadow-xl">
          {isVictory ? (
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          ) : (
            <Skull className="w-10 h-10 text-red-500" />
          )}
        </div>

        {/* Title */}
        <h2 className="font-fantasy font-black text-2xl tracking-wider text-slate-100">
          {isVictory ? 'VICTORY ACHIEVED!' : isEndless ? 'ENDLESS RUN ENDED' : 'THE KINGDOM HAS FALLEN'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {isVictory
            ? (isEndless ? `Endless Horde conquered through Wave ${waveReached}!` : 'All 30 enemy waves defeated! The kingdom stands triumphant.')
            : (isEndless ? `Defenses collapsed on Endless Wave ${waveReached}.` : `Defenses collapsed on Wave ${waveReached}. The citadel gate was breached.`)}
        </p>

        {/* Star Rating for Victory */}
        {isVictory && (
          <div className="flex justify-center gap-2 my-4">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-7 h-7 transition-all ${
                  starIdx <= stars
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>
        )}

        {/* Flawless Badge */}
        {isVictory && livesRemaining === maxLives && (
          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-fantasy text-xs font-bold mb-3">
            👑 FLAWLESS DEFENSE - ZERO GATE DAMAGE!
          </div>
        )}

        {/* Combat Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 text-center">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">WAVES</span>
            <span className="font-mono font-bold text-sm text-slate-200">
              {stats.wavesCompleted}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">ENEMIES SLAIN</span>
            <span className="font-mono font-bold text-sm text-red-400">
              {stats.enemiesKilled}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">TOTAL DAMAGE</span>
            <span className="font-mono font-bold text-sm text-amber-300">
              {stats.totalDamageDealt.toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">COMBOS</span>
            <span className="font-mono font-bold text-sm text-orange-400">
              {stats.combosTriggered || 0}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">GOLD EARNED</span>
            <span className="font-mono font-bold text-sm text-yellow-400">
              {stats.goldEarned}g
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">TOWERS BUILT</span>
            <span className="font-mono font-bold text-sm text-slate-200">
              {stats.towersBuilt} ({stats.towersUpgraded} up)
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 col-span-2">
            <span className="text-[10px] font-mono text-slate-400 block">SPELLS CAST</span>
            <span className="font-mono font-bold text-sm text-sky-400">
              {stats.spellsCast}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
          {isVictory && onContinueEndless && !isEndless && (
            <button
              onClick={onContinueEndless}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-fantasy font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/20 cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>CONTINUE ENDLESS</span>
            </button>
          )}

          <button
            onClick={onRetry}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-fantasy font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={onReturnToMenu}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
