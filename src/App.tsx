import { useState, useCallback, useEffect } from 'react';
import { Swords, Shield, Star, Lock, Play, HelpCircle, ChevronLeft, RotateCcw, Home, Trophy, Sword, Heart, Zap, Volume2, VolumeX } from 'lucide-react';
import type { GameScreen, GameState, SaveData } from './game/types';
import { initGameState, loadSave, saveSave, calculateStageScore } from './game/engine';
import GameCanvas from './game/GameCanvas';
import { WEAPON_UPGRADES, HP_UPGRADES, SPECIAL_UPGRADES } from './game/stages';
import './App.css';

function App() {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [save, setSave] = useState<SaveData>(loadSave());
  const [selectedStage, setSelectedStage] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Save whenever save changes
  useEffect(() => {
    saveSave(save);
  }, [save]);

  const startStage = useCallback((stageId: number, saveData: SaveData = save) => {
    const state = initGameState(stageId, saveData);
    setGameState(state);
    setSelectedStage(stageId);
    setScreen('playing');
  }, [save]);

  const handleGameStateChange = useCallback((state: GameState) => {
    setGameState(state);
    if (state.screen === 'gameover') {
      setScreen('gameover');
    } else if (state.screen === 'victory') {
      const result = calculateStageScore(state);
      const completedStage = selectedStage;
      const nextStage = completedStage < 10 ? completedStage + 1 : completedStage;

      setSave(prev => {
        const newSave = { ...prev };
        newSave.gold += state.gold;
        if (completedStage < 10) {
          newSave.stagesUnlocked[completedStage] = true;
        }
        if (result.stars > newSave.stageStars[completedStage - 1]) {
          newSave.stageStars[completedStage - 1] = result.stars;
        }
        if (result.score > newSave.stageBestScores[completedStage - 1]) {
          newSave.stageBestScores[completedStage - 1] = result.score;
        }

        window.setTimeout(() => {
          startStage(nextStage, newSave);
        }, 700);

        return newSave;
      });
    } else if (state.screen === 'paused') {
      setScreen('paused');
    } else if (state.screen === 'playing') {
      setScreen('playing');
    }
  }, [selectedStage, startStage]);

  const handleResume = useCallback(() => {
    if (gameState) {
      gameState.screen = 'playing';
      setScreen('playing');
    }
  }, [gameState]);

  const handleRetry = useCallback(() => {
    startStage(selectedStage);
  }, [startStage, selectedStage]);

  const handleLobby = useCallback(() => {
    setGameState(null);
    setScreen('lobby');
  }, []);

  const handleUpgradeWeapon = useCallback(() => {
    const upgrade = WEAPON_UPGRADES[save.weaponLevel];
    if (upgrade && save.gold >= upgrade.cost) {
      setSave(prev => ({
        ...prev,
        gold: prev.gold - upgrade.cost,
        weaponLevel: prev.weaponLevel + 1,
      }));
    }
  }, [save]);

  const handleUpgradeHP = useCallback(() => {
    const upgrade = HP_UPGRADES[save.hpLevel];
    if (upgrade && save.gold >= upgrade.cost) {
      setSave(prev => ({
        ...prev,
        gold: prev.gold - upgrade.cost,
        hpLevel: prev.hpLevel + 1,
      }));
    }
  }, [save]);

  const handleUpgradeSpecial = useCallback(() => {
    const upgrade = SPECIAL_UPGRADES[save.specialLevel];
    if (upgrade && save.gold >= upgrade.cost) {
      setSave(prev => ({
        ...prev,
        gold: prev.gold - upgrade.cost,
        specialLevel: prev.specialLevel + 1,
      }));
    }
  }, [save]);

  const resetProgress = useCallback(() => {
    const newSave: SaveData = {
      gold: 0,
      weaponLevel: 1,
      hpLevel: 1,
      specialLevel: 1,
      stagesUnlocked: [true, false, false, false, false, false, false, false, false, false],
      stageStars: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      stageBestScores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };
    setSave(newSave);
    saveSave(newSave);
  }, []);

  // ========== RENDER SCREENS ==========

  // MENU SCREEN
  if (screen === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-black flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white opacity-20 animate-pulse"
              style={{
                width: Math.random() * 6 + 2,
                height: Math.random() * 6 + 2,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Title */}
        <div className="relative z-10 text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Swords className="w-12 h-12 text-yellow-400" />
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500 drop-shadow-lg tracking-wider">
              SWORD HERO
            </h1>
            <Swords className="w-12 h-12 text-yellow-400" />
          </div>
          <p className="text-2xl text-blue-300 font-bold tracking-widest">BLADE QUEST</p>
          <div className="mt-4 w-64 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto" />
        </div>

        {/* Hero Image */}
        <div className="relative z-10 mb-10">
          <img
            src="/assets/hero_player.png"
            alt="Hero"
            className="w-48 h-64 object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-bounce"
            style={{ animationDuration: '3s' }}
          />
        </div>

        {/* Menu Buttons */}
        <div className="relative z-10 flex flex-col gap-4 w-72">
          <button
            onClick={() => setScreen('lobby')}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-xl rounded-xl shadow-lg shadow-yellow-500/30 transition-all hover:scale-105 hover:shadow-xl active:scale-95"
          >
            <Play className="w-6 h-6" />
            PLAY GAME
          </button>

          <button
            onClick={() => setScreen('upgrade')}
            className="flex items-center justify-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <Sword className="w-5 h-5" />
            UPGRADE
          </button>

          <button
            onClick={() => setScreen('howtoplay')}
            className="flex items-center justify-center gap-3 px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold text-lg rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <HelpCircle className="w-5 h-5" />
            HOW TO PLAY
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center justify-center gap-3 px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            {soundEnabled ? 'SOUND ON' : 'SOUND OFF'}
          </button>
        </div>

        {/* Footer */}
        <p className="relative z-10 mt-8 text-gray-500 text-sm">
          Press any key to start your adventure
        </p>
      </div>
    );
  }

  // LOBBY SCREEN
  if (screen === 'lobby') {
    const stageNames = [
      'Green Plains', 'Wooden Forts', 'Spiked Path', 'Moving Towers',
      'Guard Captain', 'Lava Caverns', 'Dual Blades', 'Windy Cliffs',
      'The Gauntlet', 'Sword King Throne'
    ];
    const stageThemes = [
      'bg-green-600', 'bg-yellow-700', 'bg-gray-600', 'bg-blue-500',
      'bg-gray-500', 'bg-red-700', 'bg-purple-700', 'bg-cyan-600',
      'bg-slate-700', 'bg-red-900'
    ];

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black flex flex-col items-center p-6">
        {/* Header */}
        <div className="flex items-center justify-between w-full max-w-4xl mb-8">
          <button
            onClick={handleLobby}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            STAGE SELECT
          </h2>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-black font-bold rounded-lg">
            <Star className="w-5 h-5" />
            {save.gold} Gold
          </div>
        </div>

        {/* Stage Grid */}
        <div className="grid grid-cols-5 gap-4 max-w-4xl w-full mb-8">
          {Array.from({ length: 10 }).map((_, i) => {
            const stageNum = i + 1;
            const isUnlocked = save.stagesUnlocked[i];
            const stars = save.stageStars[i];
            const bestScore = save.stageBestScores[i];

            return (
              <button
                key={stageNum}
                onClick={() => isUnlocked && startStage(stageNum)}
                disabled={!isUnlocked}
                className={`relative flex flex-col items-center justify-center p-4 rounded-xl shadow-lg transition-all ${
                  isUnlocked
                    ? `${stageThemes[i]} hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer`
                    : 'bg-gray-800 cursor-not-allowed opacity-60'
                }`}
              >
                {!isUnlocked && (
                  <Lock className="w-8 h-8 text-gray-500 mb-2" />
                )}
                {isUnlocked && (
                  <>
                    <span className="text-2xl font-black text-white mb-1">{stageNum}</span>
                    <span className="text-xs text-white/80 font-medium text-center leading-tight">
                      {stageNames[i]}
                    </span>
                    {/* Stars */}
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3].map(s => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
                        />
                      ))}
                    </div>
                    {bestScore > 0 && (
                      <span className="text-xs text-yellow-300 mt-1">{bestScore} pts</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setScreen('menu')}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Main Menu
          </button>
          <button
            onClick={() => setScreen('upgrade')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105"
          >
            <Sword className="w-5 h-5" />
            Upgrade Weapons
          </button>
        </div>
      </div>
    );
  }

  // PLAYING / PAUSED / GAMEOVER / VICTORY
  if (screen === 'playing' || screen === 'paused' || screen === 'gameover' || screen === 'victory') {
    if (!gameState) return null;

    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <GameCanvas
          gameState={gameState}
          onStateChange={handleGameStateChange}
          save={save}
        />

        {/* PAUSE OVERLAY */}
        {screen === 'paused' && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
            <div className="bg-gray-800 border-2 border-gray-600 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
              <h2 className="text-4xl font-black text-white mb-4">PAUSED</h2>
              <button
                onClick={handleResume}
                className="flex items-center justify-center gap-2 w-48 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-xl transition-all hover:scale-105"
              >
                <Play className="w-5 h-5" />
                RESUME
              </button>
              <button
                onClick={handleRetry}
                className="flex items-center justify-center gap-2 w-48 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-lg rounded-xl transition-all hover:scale-105"
              >
                <RotateCcw className="w-5 h-5" />
                RESTART
              </button>
              <button
                onClick={() => setScreen('upgrade')}
                className="flex items-center justify-center gap-2 w-48 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105"
              >
                <Sword className="w-5 h-5" />
                UPGRADE
              </button>
              <button
                onClick={handleLobby}
                className="flex items-center justify-center gap-2 w-48 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-xl transition-all hover:scale-105"
              >
                <Home className="w-5 h-5" />
                LOBBY
              </button>
            </div>
          </div>
        )}

        {/* GAME OVER OVERLAY */}
        {screen === 'gameover' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
            <div className="bg-gray-900 border-2 border-red-600 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
              <h2 className="text-5xl font-black text-red-500 mb-2">YOU DIED</h2>
              <p className="text-gray-400 mb-4">Stage {selectedStage} - Failed</p>
              <div className="flex items-center gap-2 text-yellow-400 mb-4">
                <Star className="w-5 h-5" />
                <span className="font-bold">Gold earned: {gameState.gold}</span>
              </div>
              <button
                onClick={handleRetry}
                className="flex items-center justify-center gap-2 w-48 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-lg rounded-xl transition-all hover:scale-105"
              >
                <RotateCcw className="w-5 h-5" />
                RETRY
              </button>
              <button
                onClick={handleLobby}
                className="flex items-center justify-center gap-2 w-48 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-xl transition-all hover:scale-105"
              >
                <Home className="w-5 h-5" />
                LOBBY
              </button>
            </div>
          </div>
        )}

        {/* VICTORY OVERLAY */}
        {screen === 'victory' && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
            <div className="bg-gray-900 border-2 border-yellow-500 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
              <h2 className="text-5xl font-black text-yellow-400 mb-2">VICTORY!</h2>
              <p className="text-gray-300 mb-2">Stage {selectedStage} - Cleared!</p>

              {/* Stars */}
              {(() => {
                const result = calculateStageScore(gameState);
                return (
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3].map(s => (
                      <Star
                        key={s}
                        className={`w-10 h-10 ${s <= result.stars ? 'text-yellow-400 fill-yellow-400 animate-pulse' : 'text-gray-600'}`}
                      />
                    ))}
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Score</p>
                  <p className="text-white font-bold text-xl">{calculateStageScore(gameState).score}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Gold</p>
                  <p className="text-yellow-400 font-bold text-xl">+{gameState.gold}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Max Combo</p>
                  <p className="text-orange-400 font-bold text-xl">{gameState.maxCombo}x</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Time</p>
                  <p className="text-blue-400 font-bold text-xl">{Math.floor(gameState.timeElapsed)}s</p>
                </div>
              </div>

              {selectedStage < 10 && (
                <button
                  onClick={() => startStage(selectedStage + 1)}
                  className="flex items-center justify-center gap-2 w-56 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-xl transition-all hover:scale-105"
                >
                  <Play className="w-5 h-5" />
                  NEXT STAGE
                </button>
              )}
              <button
                onClick={handleRetry}
                className="flex items-center justify-center gap-2 w-56 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl transition-all hover:scale-105"
              >
                <RotateCcw className="w-5 h-5" />
                REPLAY
              </button>
              <button
                onClick={handleLobby}
                className="flex items-center justify-center gap-2 w-56 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-xl transition-all hover:scale-105"
              >
                <Home className="w-5 h-5" />
                LOBBY
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // UPGRADE SCREEN
  if (screen === 'upgrade') {
    const currentWeapon = WEAPON_UPGRADES[save.weaponLevel - 1];
    const nextWeapon = WEAPON_UPGRADES[save.weaponLevel];
    const currentHP = HP_UPGRADES[save.hpLevel - 1];
    const nextHP = HP_UPGRADES[save.hpLevel];
    const currentSpecial = SPECIAL_UPGRADES[save.specialLevel - 1];
    const nextSpecial = SPECIAL_UPGRADES[save.specialLevel];

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-black flex flex-col items-center p-6">
        {/* Header */}
        <div className="flex items-center justify-between w-full max-w-4xl mb-8">
          <button
            onClick={() => setScreen(gameState ? 'paused' : 'lobby')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sword className="w-8 h-8 text-yellow-400" />
            WEAPON UPGRADE
          </h2>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-black font-bold rounded-lg">
            <Star className="w-5 h-5" />
            {save.gold} Gold
          </div>
        </div>

        {/* Upgrade Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-8">
          {/* Weapon Upgrade */}
          <div className="bg-gray-800 border-2 border-gray-600 rounded-2xl p-6 flex flex-col items-center">
            <Sword className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Weapon</h3>
            <p className="text-yellow-400 font-bold mb-1">{currentWeapon.name}</p>
            <p className="text-gray-400 text-sm mb-4">Damage: {currentWeapon.damage}</p>

            {nextWeapon ? (
              <>
                <div className="w-full bg-gray-700 rounded-lg p-3 mb-4">
                  <p className="text-green-400 text-sm font-bold">Next: {nextWeapon.name}</p>
                  <p className="text-green-400 text-sm">Damage: +{nextWeapon.damage - currentWeapon.damage}</p>
                </div>
                <button
                  onClick={handleUpgradeWeapon}
                  disabled={save.gold < nextWeapon.cost}
                  className={`w-full py-3 font-bold rounded-xl transition-all ${
                    save.gold >= nextWeapon.cost
                      ? 'bg-yellow-600 hover:bg-yellow-500 text-white hover:scale-105'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Upgrade ({nextWeapon.cost} Gold)
                </button>
              </>
            ) : (
              <p className="text-green-400 font-bold">MAX LEVEL!</p>
            )}
          </div>

          {/* HP Upgrade */}
          <div className="bg-gray-800 border-2 border-gray-600 rounded-2xl p-6 flex flex-col items-center">
            <Heart className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Health</h3>
            <p className="text-red-400 font-bold mb-1">Level {save.hpLevel}</p>
            <p className="text-gray-400 text-sm mb-4">HP Bonus: +{currentHP.hpBonus}</p>

            {nextHP ? (
              <>
                <div className="w-full bg-gray-700 rounded-lg p-3 mb-4">
                  <p className="text-green-400 text-sm font-bold">Next: Level {save.hpLevel + 1}</p>
                  <p className="text-green-400 text-sm">HP Bonus: +{nextHP.hpBonus}</p>
                </div>
                <button
                  onClick={handleUpgradeHP}
                  disabled={save.gold < nextHP.cost}
                  className={`w-full py-3 font-bold rounded-xl transition-all ${
                    save.gold >= nextHP.cost
                      ? 'bg-red-600 hover:bg-red-500 text-white hover:scale-105'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Upgrade ({nextHP.cost} Gold)
                </button>
              </>
            ) : (
              <p className="text-green-400 font-bold">MAX LEVEL!</p>
            )}
          </div>

          {/* Special Upgrade */}
          <div className="bg-gray-800 border-2 border-gray-600 rounded-2xl p-6 flex flex-col items-center">
            <Zap className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Special Skill</h3>
            <p className="text-blue-400 font-bold mb-1">Level {save.specialLevel}</p>
            <p className="text-gray-400 text-sm mb-4">Bonus: +{currentSpecial.specialBonus} DMG</p>

            {nextSpecial ? (
              <>
                <div className="w-full bg-gray-700 rounded-lg p-3 mb-4">
                  <p className="text-green-400 text-sm font-bold">Next: Level {save.specialLevel + 1}</p>
                  <p className="text-green-400 text-sm">Bonus: +{nextSpecial.specialBonus} DMG</p>
                </div>
                <button
                  onClick={handleUpgradeSpecial}
                  disabled={save.gold < nextSpecial.cost}
                  className={`w-full py-3 font-bold rounded-xl transition-all ${
                    save.gold >= nextSpecial.cost
                      ? 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Upgrade ({nextSpecial.cost} Gold)
                </button>
              </>
            ) : (
              <p className="text-green-400 font-bold">MAX LEVEL!</p>
            )}
          </div>
        </div>

        {/* Weapons showcase */}
        <div className="max-w-4xl w-full bg-gray-800/50 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Weapon Collection</h3>
          <img
            src="/assets/weapons.png"
            alt="Weapons"
            className="w-full max-w-2xl mx-auto rounded-lg"
          />
        </div>

        {/* Reset button */}
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all progress?')) {
              resetProgress();
            }
          }}
          className="px-6 py-2 bg-red-900/50 hover:bg-red-800/50 text-red-400 font-bold rounded-lg transition-all"
        >
          Reset All Progress
        </button>
      </div>
    );
  }

  // HOW TO PLAY SCREEN
  if (screen === 'howtoplay') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-900 to-black flex flex-col items-center p-6">
        {/* Header */}
        <div className="flex items-center justify-between w-full max-w-3xl mb-8">
          <button
            onClick={() => setScreen('menu')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-blue-400" />
            HOW TO PLAY
          </h2>
          <div className="w-20" />
        </div>

        <div className="max-w-3xl w-full space-y-6">
          {/* Controls */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <Sword className="w-5 h-5" />
              Controls
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-24 h-10 bg-gray-700 rounded flex items-center justify-center text-white font-bold text-sm">
                  Arrow Keys
                </div>
                <span className="text-gray-300">Move Left/Right & Jump</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-10 bg-gray-700 rounded flex items-center justify-center text-white font-bold text-sm">
                  D
                </div>
                <span className="text-gray-300">Attack (combo: D-D-D)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-10 bg-gray-700 rounded flex items-center justify-center text-white font-bold text-sm">
                  S (Hold)
                </div>
                <span className="text-gray-300">Block/Guard</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-10 bg-gray-700 rounded flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <span className="text-gray-300">Special Skill (full meter)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-10 bg-gray-700 rounded flex items-center justify-center text-white font-bold text-sm">
                  ESC
                </div>
                <span className="text-gray-300">Pause Game</span>
              </div>
            </div>
          </div>

          {/* Gameplay */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Gameplay Tips
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                Defeat all enemies to unlock the exit portal (green glow on the right)
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                Collect gold coins to upgrade your weapon, HP, and special skill
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                Use the 3-hit combo (press D three times) for maximum damage
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                Hold S to block enemy attacks - reduces damage by 80%
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                Fill your special meter by attacking enemies, then press A for ultimate skill
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                Double jump by pressing Up arrow twice while in the air
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                Avoid spikes and lava - they deal massive damage!
              </li>
            </ul>
          </div>

          {/* Enemies */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <Swords className="w-5 h-5" />
              Enemy Types
            </h3>
            <div className="grid grid-cols-2 gap-3 text-gray-300 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">Rookie Knight</span> - Weak, slow
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">Spearman</span> - Medium range
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">Rogue</span> - Fast, jumps
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">Archer/Mage</span> - Ranged attacks
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">Berserker</span> - High damage
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">Assassin</span> - Very fast
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">Paladin</span> - Tanky, high HP
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-bold">Sword King</span> - Final Boss!
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
