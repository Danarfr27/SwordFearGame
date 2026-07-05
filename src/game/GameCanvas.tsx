import { useRef, useEffect, useCallback } from 'react';
import type { GameState, SaveData } from './types';
import { updateGame, renderGame, createInputState } from './engine';
import type { InputState } from './engine';
import { startFightTheme, stopFightTheme } from './audio';

interface GameCanvasProps {
  gameState: GameState;
  onStateChange: (state: GameState) => void;
  save: SaveData;
}

export default function GameCanvas({ gameState, onStateChange, save }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(gameState);
  const inputRef = useRef<InputState>(createInputState());
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isPausedRef = useRef(false);

  // Keep gameState ref in sync
  useEffect(() => {
    gameStateRef.current = gameState;
    isPausedRef.current = gameState.screen === 'paused';
  }, [gameState]);

  // Load images
  useEffect(() => {
    const imageSources: Record<string, string> = {
      '/assets/hero_player.png': '/assets/hero_player.png',
      '/assets/ryu.png': '/assets/ryu.png',
      '/assets/enemy_rookie.png': '/assets/enemy_rookie.png',
      '/assets/enemy_rogue.png': '/assets/enemy_rogue.png',
      '/assets/enemy_mage.png': '/assets/enemy_mage.png',
      '/assets/enemy_paladin.png': '/assets/enemy_paladin.png',
      '/assets/enemy_berserker.png': '/assets/enemy_berserker.png',
      '/assets/enemy_boss.png': '/assets/enemy_boss.png',
      '/assets/bg_title.jpg': '/assets/bg_title.jpg',
      '/assets/bg_cave.jpg': '/assets/bg_cave.jpg',
      '/assets/bg_castle.jpg': '/assets/bg_castle.jpg',
    };

    const loadPromises = Object.entries(imageSources).map(([key, src]) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          imagesRef.current[key] = img;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = src;
      });
    });

    Promise.all(loadPromises);
  }, []);

  // Manage fight theme music
  useEffect(() => {
    if (gameState.screen === 'playing' && gameState.currentStage > 0) {
      startFightTheme();
    } else {
      stopFightTheme();
    }

    return () => {
      if (gameState.screen !== 'playing' || gameState.currentStage === 0) {
        stopFightTheme();
      }
    };
  }, [gameState.screen, gameState.currentStage]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const input = inputRef.current;
      switch (e.key) {
        case 'ArrowLeft':
          input.left = true;
          e.preventDefault();
          break;
        case 'a':
        case 'A':
          input.special = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
          if (e.key === 'd' && !e.repeat) {
            input.attack = true;
          }
          if (e.key === 'ArrowRight') {
            input.right = true;
          }
          e.preventDefault();
          break;
        case 'f':
        case 'F':
          if (!e.repeat) {
            input.toggleWeapon = true;
          }
          e.preventDefault();
          break;
        case 'ArrowUp':
        case 'w':
          if (!input.up && !e.repeat) {
            input.jumpPressed = true;
          }
          input.up = true;
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
          if (e.key === 's') {
            input.block = true;
          }
          e.preventDefault();
          break;
        case 'Escape':
          input.pause = true;
          e.preventDefault();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const input = inputRef.current;
      switch (e.key) {
        case 'ArrowLeft':
          input.left = false;
          break;
        case 'a':
        case 'A':
          input.special = false;
          break;
        case 'ArrowRight':
        case 'd':
          if (e.key === 'ArrowRight') input.right = false;
          break;
        case 'f':
        case 'F':
          input.toggleWeapon = false;
          break;
        case 'ArrowUp':
        case 'w':
          input.up = false;
          break;
        case 'ArrowDown':
        case 's':
          if (e.key === 's') input.block = false;
          break;
        case 'Escape':
          input.pause = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  const prevScreenRef = useRef<GameState['screen']>(gameState.screen);

  const gameLoop = useCallback((timestamp: number) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }

    const dt = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    const state = gameStateRef.current;
    const input = inputRef.current;

    if (!isPausedRef.current && state.screen === 'playing') {
      // Handle pause
      if (input.pause) {
        isPausedRef.current = true;
        state.screen = 'paused';
        onStateChange({ ...state });
        input.pause = false;
      } else {
        updateGame(state, input, dt, save);
      }
    } else if (state.screen === 'paused') {
      if (input.pause) {
        isPausedRef.current = false;
        state.screen = 'playing';
        onStateChange({ ...state });
        input.pause = false;
      }
    }

    if (state.screen !== prevScreenRef.current) {
      prevScreenRef.current = state.screen;
      onStateChange({ ...state });
    }

    // Reset one-shot inputs
    input.attack = false;
    input.special = false;
    input.jumpPressed = false;
    input.toggleWeapon = false;

    // Render
    renderGame(ctx, state, imagesRef.current, 800, 600);

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [onStateChange, save]);

  useEffect(() => {
    lastTimeRef.current = 0;
    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <div className="relative inline-block w-full max-w-[800px] touch-none">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="block w-full max-w-[800px] h-auto border-2 border-gray-600 rounded-lg shadow-2xl"
        style={{ imageRendering: 'auto', touchAction: 'none' }}
      />
    </div>
  );
}
