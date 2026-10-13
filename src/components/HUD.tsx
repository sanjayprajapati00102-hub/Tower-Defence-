import React from 'react';
import {
  Heart,
  Coins,
  Play,
  Pause,
  FastForward,
  RotateCw,
  Volume2,
  VolumeX,
  Settings,
  BookOpen,
  HelpCircle,
  Home,
  Swords,
} from 'lucide-react';
import { EngineStateSnapshot } from '../game/engine';

interface HUDProps {
  state: EngineStateSnapshot;
  announcement: { title: string; subtitle: string } | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onSetSpeed: (speed: number) => void;
  onStartNextWave: () => void;
  onToggleAutoStart: () => void;
  onOpenSettings: () => void;
  onOpenEncyclopedia: () => void;
  onOpenTutorial: () => void;
  onReturnToMenu: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  state,
  announcement,
  isMuted,
  onToggleMute,
  onTogglePause,
  onSetSpeed,
  onStartNextWave,
  onToggleAutoStart,
  onOpenSettings,
  onOpenEncyclopedia,
  onOpenTutorial,
  onReturnToMenu,
}) => {
  const isWaveActive = state.gameStatus === 'WAVE_ACTIVE';
  const isPaused = state.gameStatus === 'PAUSED';

  return (
    <>
      {/* Top Header Bar */}
      <header className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between pointer-events-auto z-20 bg-gradient-to-b from-slate-950/90 via-slate-900/60 to-transparent backdrop-blur-[2px]">
        {/* Left: Player Stats (Base HP, Gold) */}
        <div className="flex items-center gap-3">
          {/* Base Lives */}
          <div
            title="Kingdom Gate Health"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-lg transition-all ${
              state.lives <= 5
                ? 'bg-red-950/80 border-red-500/80 text-red-300 animate-pulse'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-100'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                state.lives <= 5 ? 'text-red-400 fill-red-400' : 'text-rose-500 fill-rose-500'
              }`}
            />
            <span className="font-mono font-bold text-sm tracking-wide">
              {state.lives} / {state.maxLives}
            </span>
          </div>

          {/* Gold */}
          <div
            title="Kingdom Gold"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/50 text-amber-300 backdrop-blur-md shadow-lg"
          >
            <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-mono font-bold text-sm tracking-wide">
              {state.gold}
            </span>
          </div>
        </div>

        {/* Center: Wave Indicator & Start Next Wave */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg flex items-center gap-2.5">
            <Swords className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col">
              <span className="font-fantasy font-bold text-xs text-amber-200 tracking-wider">
                {state.isEndless
                  ? `ENDLESS WAVE ${state.waveNumber}`
                  : `WAVE ${state.waveNumber} / ${state.totalWaves}`}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {state.enemiesRemaining > 0
                  ? `${state.enemiesRemaining} enemies remaining`
                  : 'Defenses ready'}
              </span>
            </div>
          </div>

          {/* Elite Wave Modifier Badge (if active for this wave) */}
          {state.currentEliteModifier && (
            <div
              title={state.currentEliteModifier.description}
              className="px-3 py-1.5 rounded-xl border flex items-center gap-1.5 backdrop-blur-md shadow-md animate-pulse"
              style={{
                backgroundColor: state.currentEliteModifier.accentBg || 'rgba(239, 68, 68, 0.2)',
                borderColor: state.currentEliteModifier.badgeColor || '#ef4444',
              }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: state.currentEliteModifier.badgeColor || '#ef4444' }}
              />
              <div className="flex flex-col">
                <span className="text-[10px] font-fantasy font-bold tracking-wide text-white leading-none">
                  ELITE: {state.currentEliteModifier.name}
                </span>
                <span className="text-[9px] font-mono text-slate-300 leading-tight">
                  {state.currentEliteModifier.description}
                </span>
              </div>
            </div>
          )}

          {/* Start Wave Button */}
          {!isWaveActive && (
            <button
              onClick={onStartNextWave}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-fantasy font-bold text-xs tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/20 border border-amber-300 transition-all cursor-pointer animate-pulse"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>
                {state.waveNumber === 0
                  ? 'START WAVE 1'
                  : state.waveCountdown > 0
                  ? `NEXT (${Math.ceil(state.waveCountdown)}s)`
                  : 'NEXT WAVE'}
              </span>
            </button>
          )}

          {/* Auto Start Toggle */}
          <button
            onClick={onToggleAutoStart}
            title="Auto-start subsequent waves immediately"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
              state.autoStartWaves
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            AUTO: {state.autoStartWaves ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Right: Controls (Speed, Pause, Sound, Settings, Menu) */}
        <div className="flex items-center gap-1.5">
          {/* Speed Controls (1x, 2x, 3x) */}
          <div className="flex bg-slate-900/90 border border-slate-700/80 rounded-xl p-0.5 shadow-lg">
            {[1, 2, 3].map((spd) => (
              <button
                key={spd}
                onClick={() => onSetSpeed(spd)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  state.speedMultiplier === spd
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Pause / Resume */}
          <button
            onClick={onTogglePause}
            title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isPaused
                ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/40'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4 fill-slate-950" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Encyclopedia */}
          <button
            onClick={onOpenEncyclopedia}
            title="Armory & Bestiary Encyclopedia"
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
          </button>

          {/* Tutorial / Help */}
          <button
            onClick={onOpenTutorial}
            title="How to Play / Tutorial"
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Game Settings"
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Return to Menu */}
          <button
            onClick={onReturnToMenu}
            title="Return to Main Menu"
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:bg-red-950/80 hover:border-red-500/50 hover:text-red-300 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Announcement Banner */}
      {announcement && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-2xl bg-slate-950/90 border border-amber-500/60 shadow-2xl backdrop-blur-md pointer-events-none z-30 animate-fade-in text-center">
          <h2 className="font-fantasy font-bold text-base text-amber-300 tracking-wider">
            {announcement.title}
          </h2>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            {announcement.subtitle}
          </p>
        </div>
      )}
    </>
  );
};
