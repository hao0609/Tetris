// ============================================================
// input.js — 鍵盤事件綁定
// ============================================================

function bindInput(game) {
  window.addEventListener('keydown', (e) => {
    // 避免方向鍵/空白鍵捲動頁面
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    switch (e.code) {
      case 'ArrowLeft':
        game.moveLeft();
        break;
      case 'ArrowRight':
        game.moveRight();
        break;
      case 'ArrowDown':
        game.softDrop();
        break;
      case 'ArrowUp':
        game.rotate();
        break;
      case 'Space':
        game.hardDrop();
        break;
      case 'KeyP':
        game.togglePause();
        break;
      case 'KeyR':
        game.restart();
        break;
      default:
        break;
    }
  });
}
