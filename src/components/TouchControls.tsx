import { useRef } from 'react';
import './TouchControls.css';

interface TouchBtnConfig {
  key: string;
  code: string;
  keyCode: number;
  label: string;
  subLabel?: string;
  className: string;
  style: React.CSSProperties;
}

const ACTION_BUTTONS: TouchBtnConfig[] = [
  {
    key: 'd', code: 'KeyD', keyCode: 68,
    label: 'D', subLabel: 'ATTACK',
    className: 'tc-btn tc-action tc-btn-d',
    style: { left: '85px', bottom: '110px' },
  },
  {
    key: 'a', code: 'KeyA', keyCode: 65,
    label: 'A', subLabel: 'SPECIAL',
    className: 'tc-btn tc-action tc-btn-a',
    style: { left: '22px', bottom: '190px' },
  },
  {
    key: 's', code: 'KeyS', keyCode: 83,
    label: 'S', subLabel: 'BLOCK',
    className: 'tc-btn tc-action tc-btn-s',
    style: { left: '85px', bottom: '190px' },
  },
];

const DPAD_BUTTONS: TouchBtnConfig[] = [
  {
    key: 'ArrowUp', code: 'ArrowUp', keyCode: 38,
    label: '▲', className: 'tc-btn tc-dpad',
    style: { right: '90px', bottom: '190px' },
  },
  {
    key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37,
    label: '◀', className: 'tc-btn tc-dpad',
    style: { right: '160px', bottom: '110px' },
  },
  {
    key: 'ArrowDown', code: 'ArrowDown', keyCode: 40,
    label: '▼', className: 'tc-btn tc-dpad',
    style: { right: '90px', bottom: '110px' },
  },
  {
    key: 'ArrowRight', code: 'ArrowRight', keyCode: 39,
    label: '▶', className: 'tc-btn tc-dpad',
    style: { right: '20px', bottom: '110px' },
  },
];

function dispatchKeyEvent(key: string, code: string, keyCode: number, type: 'keydown' | 'keyup') {
  const event = new KeyboardEvent(type, {
    key,
    code,
    keyCode,
    which: keyCode,
    bubbles: true,
    cancelable: true,
    composed: true,
  });
  window.dispatchEvent(event);
  document.dispatchEvent(event);
}

export default function TouchControls() {
  const pressedRef = useRef<Set<string>>(new Set());

  const handlePress = (btn: TouchBtnConfig) => {
    if (pressedRef.current.has(btn.key)) return;
    pressedRef.current.add(btn.key);
    dispatchKeyEvent(btn.key, btn.code, btn.keyCode, 'keydown');
  };

  const handleRelease = (btn: TouchBtnConfig) => {
    if (!pressedRef.current.has(btn.key)) return;
    pressedRef.current.delete(btn.key);
    dispatchKeyEvent(btn.key, btn.code, btn.keyCode, 'keyup');
  };

  const bindBtn = (btn: TouchBtnConfig) => {
    const onTouchStart = (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = e.currentTarget as HTMLElement;
      el.classList.add('pressed');
      handlePress(btn);
    };
    const onTouchEnd = (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = e.currentTarget as HTMLElement;
      el.classList.remove('pressed');
      handleRelease(btn);
    };
    const onMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      const el = e.currentTarget as HTMLElement;
      el.classList.add('pressed');
      handlePress(btn);
    };
    const onMouseUp = (e: React.MouseEvent) => {
      e.preventDefault();
      const el = e.currentTarget as HTMLElement;
      el.classList.remove('pressed');
      handleRelease(btn);
    };
    const onMouseLeave = (e: React.MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      if (el.classList.contains('pressed')) {
        el.classList.remove('pressed');
        handleRelease(btn);
      }
    };

    return (
      <div
        key={btn.key}
        className={btn.className}
        style={btn.style}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {btn.label}
        {btn.subLabel && <span className="tc-label">{btn.subLabel}</span>}
      </div>
    );
  };

  return (
    <div className="touch-controls-overlay">
      {ACTION_BUTTONS.map(bindBtn)}
      {DPAD_BUTTONS.map(bindBtn)}
    </div>
  );
}
