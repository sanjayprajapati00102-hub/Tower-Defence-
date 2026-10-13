/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine, EngineStateSnapshot } from './game/engine';
import { sound } from './game/audio';
import { loadSaveData, saveGameData, updateMapProgress, addLeaderboardRecord } from './game/storage';
import { Difficulty, GameSettings, MapId, Point, SaveData, SpellType, TowerType, TargetMode } from './game/types';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { TowerBuildMenu } from './components/TowerBuildMenu';
import { TowerInspector } from './components/TowerInspector';
import { SpellBar } from './components/SpellBar';
import { BossBar } from './components/BossBar';
import { TutorialModal } from './components/TutorialModal';
import { EncyclopediaModal } from './components/EncyclopediaModal';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';
import { MapSelectModal } from './components/MapSelectModal';
import { MainMenu } from './components/MainMenu';
import { AchievementsModal } from './components/AchievementsModal';
import { LeaderboardModal } from './components/LeaderboardModal';

type AppScreen = 'MAIN_MENU' | 'MAP_SELECT' | 'PLAYING';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('MAIN_MENU');
  const [isEndlessMode, setIsEndlessMode] = useState<boolean>(false);
  const [saveData, setSaveData] = useState<SaveData>(loadSaveData);

  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [engineState, setEngineState] = useState<EngineStateSnapshot | null>(null);
  const [announcement, setAnnouncement] = useState<{ title: string; subtitle: string } | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showEncyclopedia, setShowEncyclopedia] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  // Audio setup
  useEffect(() => {
    sound.setVolumes(
      saveData.settings.masterVolume,
      saveData.settings.sfxVolume,
      saveData.settings.musicVolume
    );
  }, [saveData.settings]);

  // Initialize or start game engine on a given map
  const startBattle = useCallback((mapId: MapId, difficulty: Difficulty, endless = false) => {
    if (engine) {
      engine.stop();
    }

    const newEngine = new GameEngine(mapId, difficulty, endless);
    newEngine.showDamageNumbers = saveData.settings.showDamageNumbers;
    newEngine.autoStartWaves = saveData.settings.autoStartWaves;
    newEngine.setCallbacks(
      (snapshot) => {
        setEngineState(snapshot);
      },
      (title, subtitle) => {
        setAnnouncement({ title, subtitle });
        setTimeout(() => setAnnouncement(null), 3800);
      },
      () => {
        if (saveData.settings.screenShake) {
          setShakeTrigger((prev) => !prev);
        }
      }
    );

    newEngine.start();
    setEngine(newEngine);
    setIsEndlessMode(endless);
    setScreen('PLAYING');
    sound.startMusic();
  }, [engine, saveData.settings.screenShake]);

  // Handle victory/defeat persistence & Endless leaderboard recording
  useEffect(() => {
    if (!engineState || !engine) return;

    if (engineState.gameStatus === 'VICTORY' || engineState.gameStatus === 'DEFEAT') {
      const isVictory = engineState.gameStatus === 'VICTORY';
      let updatedSave = updateMapProgress(
        engineState.mapId,
        engineState.waveNumber,
        engineState.stats.totalDamageDealt,
        isVictory,
        engineState.lives,
        engineState.maxLives
      );

      updatedSave.totalEnemiesSlain += engineState.stats.enemiesKilled;

      if (engineState.isEndless && engineState.waveNumber > 0) {
        updatedSave = addLeaderboardRecord({
          commanderName: saveData.commanderName,
          waveReached: engineState.waveNumber,
          score: engineState.stats.totalDamageDealt,
          enemiesKilled: engineState.stats.enemiesKilled,
          mapId: engineState.mapId,
          difficulty: engine.difficulty,
          date: new Date().toISOString().split('T')[0],
        });
      }

      saveGameData(updatedSave);
      setSaveData(updatedSave);
    }
  }, [engineState?.gameStatus]);

  // Keyboard Shortcuts (Space, 1-4, N, Esc)
  useEffect(() => {
    if (screen !== 'PLAYING' || !engine) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        engine.togglePause();
      } else if (e.code === 'Digit1') {
        engine.setTargetingSpell('METEOR');
      } else if (e.code === 'Digit2') {
        engine.setTargetingSpell('FREEZE');
      } else if (e.code === 'Digit3') {
        engine.castSpell('REINFORCEMENTS');
      } else if (e.code === 'Digit4') {
        engine.castSpell('GOLD_RUSH');
      } else if (e.code === 'KeyN') {
        engine.startNextWave();
      } else if (e.code === 'Escape') {
        engine.selectSlot(null);
        engine.selectTower(null);
        engine.setTargetingSpell(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, engine]);

  // Mute toggle
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  // Update Settings
  const handleUpdateSettings = (newSettings: GameSettings) => {
    const updated = { ...saveData, settings: newSettings };
    saveGameData(updated);
    setSaveData(updated);
    sound.setVolumes(newSettings.masterVolume, newSettings.sfxVolume, newSettings.musicVolume);
    if (engine) {
      engine.showDamageNumbers = newSettings.showDamageNumbers;
      engine.autoStartWaves = newSettings.autoStartWaves;
      engine.emitState();
    }
  };

  // Reset Data
  const handleResetData = () => {
    localStorage.clear();
    const fresh = loadSaveData();
    setSaveData(fresh);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Main Menu Screen */}
      {screen === 'MAIN_MENU' && (
        <MainMenu
          saveData={saveData}
          onStartCampaign={() => {
            setIsEndlessMode(false);
            setScreen('MAP_SELECT');
          }}
          onStartEndless={() => {
            setIsEndlessMode(true);
            setScreen('MAP_SELECT');
          }}
          onOpenEncyclopedia={() => setShowEncyclopedia(true)}
          onOpenTutorial={() => setShowTutorial(true)}
          onOpenAchievements={() => setShowAchievements(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* 2. Map Selection Screen */}
      {screen === 'MAP_SELECT' && (
        <MapSelectModal
          saveData={saveData}
          isEndlessMode={isEndlessMode}
          onSelectMap={(mapId, difficulty) => startBattle(mapId, difficulty, isEndlessMode)}
          onClose={() => setScreen('MAIN_MENU')}
        />
      )}

      {/* 3. Main Gameplay Battlefield Screen */}
      {screen === 'PLAYING' && engine && engineState && (
        <div className="relative w-full h-full flex flex-col justify-between">
          {/* Top HUD */}
          <HUD
            state={engineState}
            announcement={announcement}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            onTogglePause={() => engine.togglePause()}
            onSetSpeed={(spd) => engine.setSpeed(spd)}
            onStartNextWave={() => engine.startNextWave()}
            onToggleAutoStart={() => engine.toggleAutoStart()}
            onOpenSettings={() => setShowSettings(true)}
            onOpenEncyclopedia={() => setShowEncyclopedia(true)}
            onOpenTutorial={() => setShowTutorial(true)}
            onReturnToMenu={() => {
              engine.stop();
              sound.stopMusic();
              setScreen('MAIN_MENU');
            }}
          />

          {/* Boss Health Bar (if a boss is on screen) */}
          {engineState.bossActive && <BossBar boss={engineState.bossActive} />}

          {/* Interactive Game Canvas */}
          <div className="flex-1 w-full h-full relative">
            <GameCanvas
              engine={engine}
              screenShake={shakeTrigger}
              onSlotClick={(slotId) => engine.selectSlot(slotId)}
              onTowerClick={(towerId) => engine.selectTower(towerId)}
              onGroundClick={() => {
                engine.selectSlot(null);
                engine.selectTower(null);
                engine.setTargetingSpell(null);
              }}
              onCastSpellAt={(pt: Point) => {
                if (engine.targetingSpell) {
                  engine.castSpell(engine.targetingSpell, pt);
                }
              }}
            />
          </div>

          {/* Bottom Spell Bar */}
          <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
            <SpellBar
              spells={engineState.spells}
              targetingSpell={engineState.targetingSpell}
              onSelectSpell={(type: SpellType) => {
                if (type === 'REINFORCEMENTS' || type === 'GOLD_RUSH') {
                  engine.castSpell(type);
                } else {
                  engine.setTargetingSpell(type);
                }
              }}
              onCancelSpell={() => engine.setTargetingSpell(null)}
            />
          </div>

          {/* Tower Build Menu (when an empty build slot is selected) */}
          {engineState.selectedSlotId && !engineState.selectedTowerId && (
            <TowerBuildMenu
              currentGold={engineState.gold}
              onSelectTower={(type: TowerType) => {
                if (engineState.selectedSlotId) {
                  engine.buildTower(engineState.selectedSlotId, type);
                }
              }}
              onClose={() => engine.selectSlot(null)}
            />
          )}

          {/* Tower Inspector (when a built tower is selected) */}
          {engineState.selectedTowerId && (
            (() => {
              const selectedTower = engine.towers.find((t) => t.id === engineState.selectedTowerId);
              if (!selectedTower) return null;

              return (
                <TowerInspector
                  tower={selectedTower}
                  currentGold={engineState.gold}
                  onUpgrade={(branchChoice) => engine.upgradeTower(selectedTower.id, branchChoice)}
                  onSell={() => engine.sellTower(selectedTower.id)}
                  onChangeTargetMode={(mode: TargetMode) =>
                    engine.setTowerTargetMode(selectedTower.id, mode)
                  }
                  onClose={() => engine.selectTower(null)}
                />
              );
            })()
          )}

          {/* Game Over (Victory / Defeat) Screen */}
          {(engineState.gameStatus === 'VICTORY' || engineState.gameStatus === 'DEFEAT') && (
            <GameOverModal
              status={engineState.gameStatus}
              waveReached={engineState.waveNumber}
              totalWaves={engineState.totalWaves}
              livesRemaining={engineState.lives}
              maxLives={engineState.maxLives}
              isEndless={engineState.isEndless}
              stats={engineState.stats}
              onRetry={() => startBattle(engineState.mapId, engine.difficulty, engineState.isEndless)}
              onContinueEndless={() => {
                engine.isEndless = true;
                engine.gameStatus = 'WAVE_BREAK';
                engine.waveCountdown = 3.0;
                engine.emitState();
              }}
              onReturnToMenu={() => {
                engine.stop();
                sound.stopMusic();
                setScreen('MAIN_MENU');
              }}
            />
          )}
        </div>
      )}

      {/* Global Modals */}
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      {showEncyclopedia && <EncyclopediaModal onClose={() => setShowEncyclopedia(false)} />}
      {showAchievements && (
        <AchievementsModal
          saveData={saveData}
          onClose={() => setShowAchievements(false)}
        />
      )}
      {showLeaderboard && (
        <LeaderboardModal
          saveData={saveData}
          onUpdateSave={setSaveData}
          onClose={() => setShowLeaderboard(false)}
          onPlayEndless={() => {
            setShowLeaderboard(false);
            setIsEndlessMode(true);
            setScreen('MAP_SELECT');
          }}
        />
      )}
      {showSettings && (
        <SettingsModal
          settings={saveData.settings}
          onUpdateSettings={handleUpdateSettings}
          onResetData={handleResetData}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
