(function () {
  'use strict';

  if (window.__touchControllerInjected) return;
  window.__touchControllerInjected = true;

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) return;

  const styles = `
    * { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
    body { touch-action: none; }
    .touch-controller-overlay {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 99999;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .tc-btn {
      position: absolute;
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.08s, background 0.08s, box-shadow 0.08s;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .tc-btn:active, .tc-btn.pressed { transform: scale(0.88); }
    .tc-action {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      border: 3px solid rgba(255,255,255,0.45);
      background: rgba(10, 10, 20, 0.55);
      color: #fff;
      font-size: 26px;
      font-weight: 900;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      box-shadow: 0 6px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 0 1px rgba(255,255,255,0.05);
      text-shadow: 0 0 12px currentColor;
    }
    .tc-action .tc-label {
      position: absolute;
      bottom: -22px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 10px;
      font-weight: 600;
      color: rgba(255,255,255,0.8);
      white-space: nowrap;
      text-shadow: 0 1px 4px rgba(0,0,0,0.9);
      letter-spacing: 0.5px;
    }
    .tc-btn-d { border-color: rgba(255, 200, 50, 0.7); color: #ffd232; box-shadow: 0 6px 20px rgba(0,0,0,0.5), 0 0 15px rgba(255,200,50,0.15), inset 0 1px 0 rgba(255,255,255,0.15); }
    .tc-btn-d:active, .tc-btn-d.pressed { background: rgba(255, 200, 50, 0.25); box-shadow: 0 0 30px rgba(255,200,50,0.4), inset 0 1px 0 rgba(255,255,255,0.2); }
    .tc-btn-a { border-color: rgba(255, 80, 80, 0.7); color: #ff5050; box-shadow: 0 6px 20px rgba(0,0,0,0.5), 0 0 15px rgba(255,80,80,0.15), inset 0 1px 0 rgba(255,255,255,0.15); }
    .tc-btn-a:active, .tc-btn-a.pressed { background: rgba(255, 80, 80, 0.25); box-shadow: 0 0 30px rgba(255,80,80,0.4), inset 0 1px 0 rgba(255,255,255,0.2); }
    .tc-btn-s { border-color: rgba(80, 150, 255, 0.7); color: #5096ff; box-shadow: 0 6px 20px rgba(0,0,0,0.5), 0 0 15px rgba(80,150,255,0.15), inset 0 1px 0 rgba(255,255,255,0.15); }
    .tc-btn-s:active, .tc-btn-s.pressed { background: rgba(80, 150, 255, 0.25); box-shadow: 0 0 30px rgba(80,150,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2); }
    .tc-dpad {
      width: 68px; height: 68px; border-radius: 18px; border: 3px solid rgba(255,255,255,0.45); background: rgba(10, 10, 20, 0.55); color: #fff; font-size: 28px; box-shadow: 0 6px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 0 1px rgba(255,255,255,0.05); text-shadow: 0 0 12px rgba(100,255,150,0.5);
    }
    .tc-dpad:active, .tc-dpad.pressed { background: rgba(100, 255, 150, 0.2); border-color: rgba(100, 255, 150, 0.8); box-shadow: 0 0 25px rgba(100,255,150,0.3), inset 0 1px 0 rgba(255,255,255,0.2); color: #64ff96; }
    .tc-pause {
      width: 50px; height: 50px; border-radius: 14px; border: 2px solid rgba(255,255,255,0.4); background: rgba(10, 10, 20, 0.55); color: #fff; font-size: 22px; top: 16px; left: 50%; transform: translateX(-50%); box-shadow: 0 4px 15px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
    }
    .tc-pause:active { background: rgba(255,255,255,0.2); }
    @media (max-height: 500px) { .tc-action, .tc-dpad { width: 58px; height: 58px; font-size: 22px; } .tc-action .tc-label { font-size: 9px; bottom: -18px; } }
    @media (min-width: 768px) { .tc-action, .tc-dpad { width: 80px; height: 80px; font-size: 28px; } }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  const overlay = document.createElement('div');
  overlay.className = 'touch-controller-overlay';

  const buttons = [
    { key: 'd', label: 'ATTACK', class: 'tc-btn-d', left: 85, bottom: 110, type: 'action' },
    { key: 'a', label: 'SPECIAL', class: 'tc-btn-a', left: 22, bottom: 190, type: 'action' },
    { key: 's', label: 'BLOCK', class: 'tc-btn-s', left: 85, bottom: 190, type: 'action' },
    { key: 'ArrowUp', label: '', class: 'tc-dpad', right: 90, bottom: 190, type: 'dpad' },
    { key: 'ArrowLeft', label: '', class: 'tc-dpad', right: 160, bottom: 110, type: 'dpad' },
    { key: 'ArrowDown', label: '', class: 'tc-dpad', right: 90, bottom: 110, type: 'dpad' },
    { key: 'ArrowRight', label: '', class: 'tc-dpad', right: 20, bottom: 110, type: 'dpad' },
    { key: 'Escape', label: '', class: 'tc-pause', type: 'pause' },
  ];

  const buttonElements = {};
  buttons.forEach((btn) => {
    const el = document.createElement('div');
    el.className = `tc-btn ${btn.type === 'action' ? 'tc-action' : btn.type === 'dpad' ? 'tc-dpad' : 'tc-pause'} ${btn.class}`;
    el.setAttribute('data-key', btn.key);
    el.textContent = btn.key === 'Escape' ? '⏸' : btn.key === 'ArrowUp' ? '▲' : btn.key === 'ArrowDown' ? '▼' : btn.key === 'ArrowLeft' ? '◀' : btn.key === 'ArrowRight' ? '▶' : btn.key.toUpperCase();

    if (btn.left !== undefined) el.style.left = `${btn.left}px`;
    if (btn.right !== undefined) el.style.right = `${btn.right}px`;
    if (btn.bottom !== undefined) el.style.bottom = `${btn.bottom}px`;

    if (btn.type === 'action' && btn.label) {
      const label = document.createElement('span');
      label.className = 'tc-label';
      label.textContent = btn.label;
      el.appendChild(label);
    }

    overlay.appendChild(el);
    buttonElements[btn.key] = el;
  });

  document.body.appendChild(overlay);

  const keyMap = {
    ArrowUp: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, which: 38 },
    ArrowDown: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40 },
    ArrowLeft: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37, which: 37 },
    ArrowRight: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, which: 39 },
    a: { key: 'a', code: 'KeyA', keyCode: 65, which: 65 },
    s: { key: 's', code: 'KeyS', keyCode: 83, which: 83 },
    d: { key: 'd', code: 'KeyD', keyCode: 68, which: 68 },
    Escape: { key: 'Escape', code: 'Escape', keyCode: 27, which: 27 },
  };

  function createKeyboardEvent(key, type) {
    const map = keyMap[key];
    if (!map) return null;
    return new KeyboardEvent(type, {
      key: map.key,
      code: map.code,
      keyCode: map.keyCode,
      which: map.which,
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
    });
  }

  function sendKey(key, type) {
    const evt = createKeyboardEvent(key, type);
    if (!evt) return;

    document.dispatchEvent(evt);
    window.dispatchEvent(evt);

    const canvas = document.querySelector('canvas');
    if (canvas) canvas.dispatchEvent(evt);
  }

  Object.keys(buttonElements).forEach((key) => {
    const btn = buttonElements[key];

    const onPress = (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.add('pressed');
      sendKey(key, 'keydown');
    };

    const onRelease = (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.remove('pressed');
      sendKey(key, 'keyup');
    };

    btn.addEventListener('touchstart', onPress, { passive: false });
    btn.addEventListener('touchend', onRelease, { passive: false });
    btn.addEventListener('touchcancel', onRelease, { passive: false });
    btn.addEventListener('mousedown', onPress);
    btn.addEventListener('mouseup', onRelease);
    btn.addEventListener('mouseleave', () => {
      if (btn.classList.contains('pressed')) {
        btn.classList.remove('pressed');
        sendKey(key, 'keyup');
      }
    });
  });

  overlay.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  overlay.addEventListener('gesturestart', (e) => e.preventDefault());
  overlay.addEventListener('gesturechange', (e) => e.preventDefault());
})();
