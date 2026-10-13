import React, { useState } from 'react';
import {
  X,
  Trophy,
  Medal,
  Swords,
  Skull,
  Calendar,
  Flame,
  Shield,
  Snowflake,
  UserCheck,
} from 'lucide-react';
import { updateCommanderName } from '../game/storage';
import { LeaderboardEntry, SaveData } from '../game/types';

interface LeaderboardModalProps {
  saveData: SaveData;
  onUpdateSave: (updater: (prev: SaveData) => SaveData) => void;
  onClose: () => void;
  onPlayEndless?: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  saveData,
  onUpdateSave,
  onClose,
  onPlayEndless,
}) => {
  const [commanderInput, setCommanderInput] = useState(saveData.commanderName);
  const [isEditingName, setIsEditingName] = useState(false);

  const entries: LeaderboardEntry[] = (saveData.endlessLeaderboard || []).sort(
    (a, b) => b.score - a.score
  );

  const handleSaveCommanderName = () => {
    const trimmed = commanderInput.trim() || 'Guardian Commander';
    updateCommanderName(trimmed);
    onUpdateSave((prev) => ({ ...prev, commanderName: trimmed }));
    setIsEditingName(false);
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Trophy className="w-4 h-4 fill-amber-400" />
            <span>#1</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center gap-1 text-slate-300 font-bold">
            <Medal className="w-4 h-4 fill-slate-300" />
            <span>#2</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center gap-1 text-amber-600 font-bold">
            <Medal className="w-4 h-4 fill-amber-600" />
            <span>#3</span>
          </div>
        );
      default:
        return <span className="font-mono text-slate-500 font-bold">#{rank}</span>;
    }
  };

  const getMapThemeIcon = (mapId: string) => {
    switch (mapId) {
      case 'volcanic':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'frozen':
        return <Snowflake className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
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

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-slate-800 pb-4 pr-10">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-purple-400" />
              <h2 className="font-fantasy font-bold text-slate-100 text-xl tracking-wide">
                Endless Survival Hall of Valor
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Top commander records, highest wave survivals, and recorded endless trials
            </p>
          </div>

          {/* Commander Profile Config */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={24}
                  value={commanderInput}
                  onChange={(e) => setCommanderInput(e.target.value)}
                  className="bg-slate-900 border border-amber-500/50 rounded-lg px-2.5 py-1 text-xs text-amber-200 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <button
                  onClick={handleSaveCommanderName}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Active Commander</span>
                  <span className="text-xs font-fantasy font-bold text-amber-300">
                    {saveData.commanderName}
                  </span>
                </div>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                  title="Edit Commander Name"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Endless Leaderboard Table */}
        <div className="flex-1 overflow-y-auto pr-1">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Commander</th>
                <th className="py-2.5 px-3">Wave Survived</th>
                <th className="py-2.5 px-3">Total Score</th>
                <th className="py-2.5 px-3">Enemies Slain</th>
                <th className="py-2.5 px-3">Battlefield</th>
                <th className="py-2.5 px-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {entries.map((entry, index) => {
                const isCurrentPlayer = entry.commanderName === saveData.commanderName;

                return (
                  <tr
                    key={entry.id || index}
                    className={`transition-colors ${
                      isCurrentPlayer
                        ? 'bg-amber-500/10 hover:bg-amber-500/15 text-amber-200'
                        : 'hover:bg-slate-800/40 text-slate-200'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold">
                      {getRankBadge(index + 1)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-fantasy font-semibold text-slate-100">
                          {entry.commanderName}
                        </span>
                        {isCurrentPlayer && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                        <Swords className="w-3.5 h-3.5 text-purple-400" />
                        <span>Wave {entry.waveReached}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-300">
                      {entry.score.toLocaleString()} pts
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      <div className="flex items-center gap-1">
                        <Skull className="w-3 h-3 text-red-400" />
                        <span>{entry.enemiesKilled}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 capitalize font-mono text-[11px] text-slate-300">
                        {getMapThemeIcon(entry.mapId)}
                        <span>{entry.mapId}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400 text-[11px]">
                      {entry.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Personal Endless Record:{' '}
            <strong className="text-amber-300 font-bold">
              {saveData.endlessHighScore.toLocaleString()} pts
            </strong>
          </div>

          <div className="flex items-center gap-2">
            {onPlayEndless && (
              <button
                onClick={() => {
                  onClose();
                  onPlayEndless();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-fantasy font-bold text-xs tracking-wider flex items-center gap-1.5 shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                <span>LAUNCH ENDLESS RUN</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
