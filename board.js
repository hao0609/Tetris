// ============================================================
// board.js — 棋盤資料結構、碰撞檢測、消行邏輯、繪製
// ============================================================

class Board {
  constructor() {
    this.grid = Board.emptyGrid();
  }

  static emptyGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  reset() {
    this.grid = Board.emptyGrid();
  }

  // 檢查給定的方塊形狀在 (offsetX, offsetY) 是否會發生碰撞
  collides(shape, offsetX, offsetY) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const x = offsetX + c;
        const y = offsetY + r;
        if (x < 0 || x >= COLS || y >= ROWS) return true; // 撞牆或撞底
        if (y >= 0 && this.grid[y][x]) return true; // 撞到已鎖定的方塊
      }
    }
    return false;
  }

  // 將方塊鎖定進棋盤格
  merge(piece) {
    const { shape, color } = piece;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const x = piece.x + c;
        const y = piece.y + r;
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
          this.grid[y][x] = color;
        }
      }
    }
  }

  // 找出並清除滿行，回傳清除的行數
  clearLines() {
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (this.grid[r].every((cell) => cell !== null)) {
        this.grid.splice(r, 1);
        this.grid.unshift(Array(COLS).fill(null));
        cleared++;
        r++; // 同一列位置重新檢查（因為上面的行已下移）
      }
    }
    return cleared;
  }

  // 判斷遊戲是否結束：新方塊一產生就與現有格子碰撞
  isTopBlocked(piece) {
    return this.collides(piece.shape, piece.x, Math.max(piece.y, 0));
  }

  // 繪製棋盤格線與已鎖定的方塊
  draw(ctx) {
    ctx.clearRect(0, 0, COLS * CELL, ROWS * CELL);

    // 背景格線（細微、營造科技網格感）
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, ROWS * CELL);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(COLS * CELL, y * CELL);
      ctx.stroke();
    }

    // 已鎖定的方塊
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const color = this.grid[r][c];
        if (color) drawCell(ctx, c, r, color);
      }
    }
  }
}

// 繪製單一格子，含霓虹發光效果
function drawCell(ctx, col, row, color, alpha = 1) {
  const x = col * CELL;
  const y = row * CELL;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = color.glow;
  ctx.shadowBlur = 12;
  ctx.fillStyle = color.fill;
  ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 1.5, y + 1.5, CELL - 3, CELL - 3);
  ctx.restore();
}
