import React from 'react';
import {
  Shield,
  Swords,
  BookOpen,
  HelpCircle,
  Settings,
  Trophy,
  Skull,
  Coins,
  Crown,
  Sparkles,
  Award,
} from 'lucide-react';
import { SaveData } from '../game/types';

interface MainMenuProps {
  saveData: SaveData;
  onStartCampaign: () => void;
  onStartEndless: () => void;
  onOpenEncyclopedia: () => void;
  onOpenTutorial: () => void;
  onOpenAchievements: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  saveData,
  onStartCampaign,
  onStartEndless,
  onOpenEncyclopedia,
  onOpenTutorial,
  onOpenAchievements,
  onOpenLeaderboard,
  onOpenSettings,
}) => {
  const totalStars = Object.values(saveData.campaignProgress).reduce((acc, p) => acc + p.stars, 0);
  const achievementsUnlocked = Object.values(saveData.achievements || {}).filter((a) => a.unlocked).length;

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-between p-6 overflow-hidden bg-slate-950">
      {/* Fantasy Atmospheric Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/30 via-slate-950/80 to-slate-950 pointer-events-none" />

      {/* Decorative Golden Corner Accents */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-500/40 pointer-events-none" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-500/40 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-500/40 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-500/40 pointer-events-none" />

      {/* Top Header / Progress Badge */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>{totalStars} / 9 Stars</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{achievementsUnlocked} / 12 Perks Unlocked</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800">
          <Skull className="w-3.5 h-3.5 text-red-400" />
          <span>{saveData.totalEnemiesSlain} Slain</span>
        </div>
      </div>

      {/* Main Title Hero */}
      <div className="relative z-10 text-center max-w-xl animate-fade-in my-auto">
        <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-slate-900 border border-amber-500/40 mb-4 shadow-2xl shadow-amber-500/10">
          <Shield className="w-12 h-12 text-amber-400" />
        </div>

        <h1 className="font-fantasy font-black text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 tracking-wider drop-shadow-md">
          KINGDOM GUARDIANS
        </h1>
        <h2 className="font-fantasy font-bold text-sm sm:text-base text-amber-500/90 tracking-[0.25em] uppercase mt-1">
          Ultimate Defense
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-3 leading-relaxed font-sans">
          Construct lethal towers with branching specializations, trigger destructive elemental synergies, and withstand elite boss onslaughts.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 max-w-xs mx-auto mt-6">
          {/* Campaign Mode */}
          <button
            onClick={onStartCampaign}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-fantasy font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 border border-amber-300 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Shield className="w-4 h-4 fill-slate-950" />
            <span>PLAY CAMPAIGN</span>
          </button>

          {/* Endless Mode */}
          <button
            onClick={onStartEndless}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/40 hover:border-purple-400 font-fantasy font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <Swords className="w-4 h-4 text-purple-400" />
            <span>ENDLESS HORDE</span>
          </button>

          {/* Tactical Features Row: Achievements & Leaderboard */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenAchievements}
              title="View Achievements & Passive Perks"
              className="py-2.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 text-amber-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Achievements</span>
            </button>

            <button
              onClick={onOpenLeaderboard}
              title="View Endless Survival Leaderboard"
              className="py-2.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-purple-500/30 text-purple-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>Leaderboard</span>
            </button>
          </div>

          {/* Secondary Buttons Row */}
          <div className="grid grid-cols-3 gap-2 mt-0.5">
            <button
              onClick={onOpenTutorial}
              title="How to Play"
              className="py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-xs flex flex-col items-center gap-1 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Guide</span>
            </button>

            <button
              onClick={onOpenEncyclopedia}
              title="Codex of Towers, Enemies & Synergies"
              className="py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-xs flex flex-col items-center gap-1 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Codex</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Game Settings"
              className="py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-xs flex flex-col items-center gap-1 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-300" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 text-center text-[11px] font-mono text-slate-500">
        <span>Kingdom Guardians v1.1 • Branching Specs • Elemental Synergies • Elite Modifiers • Endless Leaderboard</span>
      </div>
    </div>
  );
};
