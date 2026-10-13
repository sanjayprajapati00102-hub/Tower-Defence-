import React from 'react';
import { X, Volume2, Sparkles, RefreshCcw } from 'lucide-react';
import { GameSettings } from '../game/types';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-fantasy font-bold text-slate-100 text-lg mb-1">
          Game Settings
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          Configure audio levels and visual preferences
        </p>

        <div className="space-y-4">
          {/* Audio Sliders */}
          <div className="space-y-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Master Volume</span>
                <span className="font-mono">{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, masterVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Sound FX Volume</span>
                <span className="font-mono">{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, sfxVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Ambient Music</span>
                <span className="font-mono">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, musicVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Gameplay Toggles */}
          <div className="space-y-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Display Damage Numbers</span>
              <input
                type="checkbox"
                checked={settings.showDamageNumbers}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, showDamageNumbers: e.target.checked })
                }
                className="accent-amber-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Screen Shake on Explosions</span>
              <input
                type="checkbox"
                checked={settings.screenShake}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, screenShake: e.target.checked })
                }
                className="accent-amber-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Auto-Start Subsequent Waves</span>
              <input
                type="checkbox"
                checked={settings.autoStartWaves}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, autoStartWaves: e.target.checked })
                }
                className="accent-amber-500 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>

          {/* Reset Save Data */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (window.confirm('Reset all campaign unlocks and high score progress?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Reset Campaign Progress</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
