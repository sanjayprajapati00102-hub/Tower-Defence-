import React, { useState } from 'react';
import { X, Play, Lock, Star, Shield, Flame, Snowflake, Award } from 'lucide-react';
import { Difficulty, MapId, SaveData } from '../game/types';
import { MAP_DEFINITIONS } from '../game/maps';

interface MapSelectModalProps {
  saveData: SaveData;
  isEndlessMode: boolean;
  onSelectMap: (mapId: MapId, difficulty: Difficulty) => void;
  onClose: () => void;
}

export const MapSelectModal: React.FC<MapSelectModalProps> = ({
  saveData,
  isEndlessMode,
  onSelectMap,
  onClose,
}) => {
  const [selectedMapId, setSelectedMapId] = useState<MapId>('greenwood');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');

  const maps = Object.values(MAP_DEFINITIONS);
  const curMap = MAP_DEFINITIONS[selectedMapId];
  const mapProgress = saveData.campaignProgress[selectedMapId];

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'GRASSLAND':
        return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'FROZEN':
        return <Snowflake className="w-5 h-5 text-sky-400" />;
      case 'VOLCANIC':
        return <Flame className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-fantasy font-bold text-slate-100 text-xl mb-1">
          {isEndlessMode ? 'Choose Battlefield (Endless Horde)' : 'Select Campaign Battlefield'}
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          Deploy your royal defenses across distinct kingdoms
        </p>

        {/* Maps Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {maps.map((m) => {
            const progress = saveData.campaignProgress[m.id];
            const isUnlocked = progress?.unlocked ?? (m.id === 'greenwood');
            const isSelected = selectedMapId === m.id;

            return (
              <button
                key={m.id}
                disabled={!isUnlocked}
                onClick={() => setSelectedMapId(m.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer disabled:cursor-not-allowed flex flex-col justify-between min-h-[140px] ${
                  !isUnlocked
                    ? 'bg-slate-950/60 border-slate-800 opacity-60'
                    : isSelected
                    ? 'bg-amber-500/20 border-amber-500/90 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-700">
                    {getThemeIcon(m.theme)}
                  </div>
                  {!isUnlocked ? (
                    <Lock className="w-4 h-4 text-slate-500" />
                  ) : (
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3 h-3 ${
                            starIdx <= (progress?.stars || 0)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-fantasy font-bold text-sm text-slate-100">
                    {m.name}
                  </h4>
                  <span className="text-[10px] text-amber-400/90 font-medium">
                    {m.subtitle}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-700/40 flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>{m.buildSlots.length} Spots</span>
                  <span
                    className={
                      m.difficulty === 'EASY'
                        ? 'text-emerald-400'
                        : m.difficulty === 'NORMAL'
                        ? 'text-sky-400'
                        : 'text-red-400'
                    }
                  >
                    {m.difficulty}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Map Description & Details */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 mb-5">
          <p className="text-xs text-slate-300 leading-relaxed">
            {curMap.description}
          </p>
          <div className="flex items-center gap-4 mt-2 text-[11px] font-mono text-slate-400">
            <span>Starting Gold: <strong className="text-amber-300">{curMap.startingGold}g</strong></span>
            <span>Castle Lives: <strong className="text-rose-400">{curMap.startingLives}</strong></span>
            <span>Slots: <strong className="text-slate-200">{curMap.buildSlots.length}</strong></span>
          </div>
        </div>

        {/* Difficulty Selector */}
        {!isEndlessMode && (
          <div className="mb-5">
            <span className="text-xs font-semibold text-slate-400 block mb-1.5">
              Select Difficulty:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 rounded-xl border text-xs font-fantasy font-semibold transition-all cursor-pointer ${
                    difficulty === diff
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Play Button */}
        <button
          onClick={() => onSelectMap(selectedMapId, difficulty)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-fantasy font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 border border-amber-300 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>DEPLOY TO BATTLE</span>
        </button>
      </div>
    </div>
  );
};
