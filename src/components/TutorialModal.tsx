import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2, Shield, Crosshair, Sparkles, Zap, Flame, Award } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Defend the Kingdom Gate',
      subtitle: 'Hold the line against incoming monster invasions',
      icon: <Shield className="w-8 h-8 text-amber-400" />,
      content: (
        <div className="space-y-3 text-slate-300 text-sm">
          <p>
            Monsters spawn from the <span className="text-red-400 font-bold">SPAWN</span> fortress and march along the winding path toward the <span className="text-blue-400 font-bold">BASE</span> gate.
          </p>
          <p>
            Each enemy that breaches your kingdom walls inflicts direct damage to your castle health. If your base lives drop to zero, the kingdom falls!
          </p>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            💡 <strong className="text-amber-300">Strategy Tip:</strong> Complete waves without taking any base damage to earn the <span className="text-amber-300 font-semibold">Flawless Defense Gold Bonus</span>!
          </div>
        </div>
      ),
    },
    {
      title: 'Constructing Towers',
      subtitle: 'Deploy 8 specialized defensive fortresses',
      icon: <Crosshair className="w-8 h-8 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-slate-300 text-sm">
          <p>
            Click on any <span className="text-amber-300 font-semibold">Runed Platform (+)</span> to open the construction menu. You can spend starting gold to deploy from 8 unique tower classes:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-bold text-emerald-400">🏹 Archer:</span> Rapid single-target physical arrows.
            </div>
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-bold text-orange-400">💣 Cannon:</span> Slow, devastating area splash damage.
            </div>
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-bold text-purple-400">🔮 Mage:</span> Arcane bolts bypassing enemy armor.
            </div>
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-bold text-sky-400">❄️ Frost:</span> Slows enemy advance by up to 65%.
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Advanced Arsenals',
      subtitle: 'Tesla, Snipers, Poison, and Flamethrowers',
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      content: (
        <div className="space-y-3 text-slate-300 text-sm">
          <p>
            Diversify your kingdom defense against specialized threats:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-bold text-yellow-400">⚡ Tesla:</span> Chains lightning between clustered enemies.
            </div>
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-bold text-red-400">🎯 Sniper:</span> Huge range, prioritizing dangerous targets.
            </div>
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-bold text-lime-400">🧪 Poison:</span> Lingering damage-over-time (DoT).
            </div>
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-bold text-amber-500">🔥 Flame:</span> Continuous close-range sweeping fire cone.
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Upgrades & Specializations',
      subtitle: 'Enhance towers up to 4 Tiers',
      icon: <Award className="w-8 h-8 text-amber-300" />,
      content: (
        <div className="space-y-3 text-slate-300 text-sm">
          <p>
            Click any placed tower to open its inspector panel. You can:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
            <li><strong className="text-amber-300">Upgrade:</strong> Increase damage, range, and unlock Tier 4 skills like <em className="text-slate-200">Cluster Shells</em> and <em className="text-slate-200">Triple Volley</em>.</li>
            <li><strong className="text-amber-300">Target Priority:</strong> Choose between <span className="font-mono">First, Last, Strongest,</span> or <span className="font-mono">Nearest</span>.</li>
            <li><strong className="text-amber-300">Sell:</strong> Reclaim 70% of total gold invested at any time.</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Spells & Tactical Controls',
      subtitle: 'Active abilities for dire emergencies',
      icon: <Flame className="w-8 h-8 text-orange-400" />,
      content: (
        <div className="space-y-3 text-slate-300 text-sm">
          <p>
            Use active spells at the bottom of the screen or with number hotkeys:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-mono font-bold text-amber-400">[1] Meteor Strike:</span> Massive area devastation.
            </div>
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-mono font-bold text-sky-400">[2] Freeze Blast:</span> Freezes enemies in place for 4s.
            </div>
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-mono font-bold text-amber-300">[3] Battle Cry:</span> +50% fire rate to all towers.
            </div>
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-mono font-bold text-yellow-300">[4] Royal Treasury:</span> Immediate bonus gold grant.
            </div>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
            ⌨️ <strong>Hotkeys:</strong> <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded font-mono">Space</kbd> to Pause/Play, <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded font-mono">Esc</kbd> to Deselect.
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
            {steps[currentStep].icon}
          </div>
          <div>
            <h3 className="font-fantasy font-bold text-slate-100 text-lg">
              {steps[currentStep].title}
            </h3>
            <p className="text-xs text-amber-400/90 font-medium">
              {steps[currentStep].subtitle}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[190px] mb-6">
          {steps[currentStep].content}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-amber-400' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-md shadow-amber-500/20"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Got it! Start Playing</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
