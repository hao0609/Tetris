// ============================================================
// main.js — 遊戲主體：初始化、遊戲迴圈、計分/等級、UI 更新
// ============================================================

class Game {
  constructor() {
    this.canvas = document.getElementById('board');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = COLS * CELL;
    this.canvas.height = ROWS * CELL;

    this.nextCanvas = document.getElementById('next');
    this.nextCtx = this.nextCanvas.getContext('2d');

    this.scoreEl = document.getElementById('score');
    this.levelEl = document.getElementById('level');
    this.linesEl = document.getElementById('lines');
    this.highScoreEl = document.getElementById('highscore');
    this.overlay = document.getElementById('overlay');
    this.overlayTitle = document.getElementById('overlay-title');
    this.overlayMsg = document.getElementById('overlay-msg');

    this.highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
    this.highScoreEl.textContent = this.highScore;

    bindInput(this);
    this.restart();
    requestAnimationFrame((t) => this.loop(t));
  }

  restart() {
    this.board = new Board();
    this.bag = new PieceBag();
    this.current = this.bag.next();
    this.score = 0;
    this.level = 1;
    this.linesCleared = 0;
    this.dropCounter = 0;
    this.lastTime = 0;
    this.paused = false;
    this.gameOver = false;
    this.hideOverlay();
    this.updateUI();
  }

  // -------------------- 移動 / 旋轉 --------------------

  moveLeft() {
    if (!this.canAct()) return;
    if (!this.board.collides(this.current.shape, this.current.x - 1, this.current.y)) {
      this.current.x -= 1;
    }
  }

  moveRight() {
    if (!this.canAct()) return;
    if (!this.board.collides(this.current.shape, this.current.x + 1, this.current.y)) {
      this.current.x += 1;
    }
  }

  softDrop() {
    if (!this.canAct()) return;
    if (!this.board.collides(this.current.shape, this.current.x, this.current.y + 1)) {
      this.current.y += 1;
      this.score += 1; // 軟降小獎勵
      this.updateUI();
    } else {
      this.lockPiece();
    }
    this.dropCounter = 0;
  }

  hardDrop() {
    if (!this.canAct()) return;
    let dist = 0;
    while (!this.board.collides(this.current.shape, this.current.x, this.current.y + 1)) {
      this.current.y += 1;
      dist++;
    }
    this.score += dist * 2; // 硬降獎勵較高
    this.updateUI();
    this.lockPiece();
    this.dropCounter = 0;
  }

  rotate() {
    if (!this.canAct()) return;
    const rotated = this.current.rotatedShape();
    // 基本 wall-kick：先試原位置，不行再試左右偏移 1~2 格
    const kicks = [0, -1, 1, -2, 2];
    for (const dx of kicks) {
      if (!this.board.collides(rotated, this.current.x + dx, this.current.y)) {
        this.current.applyRotation(rotated);
        this.current.x += dx;
        return;
      }
    }
    // 都不行就放棄旋轉
  }

  canAct() {
    return !this.paused && !this.gameOver;
  }

  // -------------------- 鎖定 / 消行 --------------------

  lockPiece() {
    this.board.merge(this.current);
    const cleared = this.board.clearLines();
    if (cleared > 0) {
      this.score += (LINE_SCORES[cleared] || 0) * this.level;
      this.linesCleared += cleared;
      const newLevel = Math.floor(this.linesCleared / LINES_PER_LEVEL) + 1;
      if (newLevel !== this.level) this.level = newLevel;
    }

    this.current = this.bag.next();
    if (this.board.isTopBlocked(this.current)) {
      this.endGame();
    }
    this.updateUI();
  }

  endGame() {
    this.gameOver = true;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem(HIGH_SCORE_KEY, String(this.highScore));
    }
    this.showOverlay('GAME OVER', `分數 ${this.score}　按 R 重新開始`);
    this.updateUI();
  }

  togglePause() {
    if (this.gameOver) return;
    this.paused = !this.paused;
    if (this.paused) {
      this.showOverlay('PAUSED', '按 P 繼續遊戲');
    } else {
      this.hideOverlay();
    }
  }

  showOverlay(title, msg) {
    this.overlayTitle.textContent = title;
    this.overlayMsg.textContent = msg;
    this.overlay.classList.remove('hidden');
  }

  hideOverlay() {
    this.overlay.classList.add('hidden');
  }

  // -------------------- 遊戲迴圈 --------------------

  loop(time = 0) {
    const delta = time - this.lastTime;
    this.lastTime = time;

    if (!this.paused && !this.gameOver) {
      this.dropCounter += delta;
      const interval = levelDropInterval(this.level);
      if (this.dropCounter > interval) {
        this.dropCounter = 0;
        if (!this.board.collides(this.current.shape, this.current.x, this.current.y + 1)) {
          this.current.y += 1;
        } else {
          this.lockPiece();
        }
      }
    }

    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }

  draw() {
    this.board.draw(this.ctx);

    // 繪製目前下落中的方塊
    const { shape, color, x, y } = this.current;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] && y + r >= 0) {
          drawCell(this.ctx, x + c, y + r, color);
        }
      }
    }

    this.drawNext();
  }

  drawNext() {
    const ctx = this.nextCtx;
    const size = this.nextCanvas.width;
    ctx.clearRect(0, 0, size, size);

    const type = this.bag.peek();
    const previewPiece = new Piece(type);
    const shape = previewPiece.shape;
    const n = shape.length;
    const cell = Math.floor(size / (n + 1));

    // 置中繪製（用小 cell 尺寸，獨立於主棋盤 CELL）
    let minC = n, maxC = -1, minR = n, maxR = -1;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (shape[r][c]) {
          minC = Math.min(minC, c);
          maxC = Math.max(maxC, c);
          minR = Math.min(minR, r);
          maxR = Math.max(maxR, r);
        }
      }
    }
    const w = (maxC - minC + 1) * cell;
    const h = (maxR - minR + 1) * cell;
    const offsetX = (size - w) / 2 - minC * cell;
    const offsetY = (size - h) / 2 - minR * cell;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!shape[r][c]) continue;
        ctx.save();
        ctx.shadowColor = previewPiece.color.glow;
        ctx.shadowBlur = 10;
        ctx.fillStyle = previewPiece.color.fill;
        ctx.fillRect(c * cell + 1, r * cell + 1, cell - 2, cell - 2);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  updateUI() {
    this.scoreEl.textContent = this.score;
    this.levelEl.textContent = this.level;
    this.linesEl.textContent = this.linesCleared;
    this.highScoreEl.textContent = Math.max(this.highScore, this.score);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
