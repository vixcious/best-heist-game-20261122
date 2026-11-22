// Midnight Vault — keyboard and mouse input.
// One file, one job: raw DOM events in, a clean snapshot out. Nothing else reads the DOM.
export function createInput(canvas) {
  const keys = new Set();
  const mouse = { x: 0, y: 0, clicked: null, rightClicked: false };

  const KEYMAP = {
    KeyW: 'up', ArrowUp: 'up',
    KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left',
    KeyD: 'right', ArrowRight: 'right',
    ShiftLeft: 'sneak', ShiftRight: 'sneak',
    Space: 'crack',
    KeyE: 'emp',
    KeyR: 'restart',
    Enter: 'confirm',
  };

  function onKeyDown(e) {
    const action = KEYMAP[e.code];
    if (action) {
      keys.add(action);
      if (action === 'up' || action === 'down' || action === 'crack') e.preventDefault();
    }
  }
  function onKeyUp(e) {
    const action = KEYMAP[e.code];
    if (action) keys.delete(action);
  }
  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  }
  function onMouseDown(e) {
    onMouseMove(e);
    if (e.button === 0) mouse.clicked = { x: mouse.x, y: mouse.y };
    if (e.button === 2) mouse.rightClicked = true;
    e.preventDefault();
  }
  function onContextMenu(e) {
    e.preventDefault();
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('contextmenu', onContextMenu);

  return {
    keys,
    mouse,
    // True while the action key is held this frame.
    held(action) {
      return keys.has(action);
    },
    // True once, on the frame the key was pressed. Callers clear it by reading.
    pressed(action) {
      return keys.has(action);
    },
    // Consume a mouse click so one click throws one smoke bomb, never two.
    takeClick() {
      const c = mouse.clicked;
      mouse.clicked = null;
      return c;
    },
    takeRightClick() {
      const r = mouse.rightClicked;
      mouse.rightClicked = false;
      return r;
    },
    // Edge-triggered keys (start game, restart): track them outside the held set.
    clear(action) {
      keys.delete(action);
    },
  };
}
