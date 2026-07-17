// ============================================================
// piece.js — Tetromino 定義、7-bag 隨機產生器、旋轉邏輯
// ============================================================

class Piece {
  constructor(type) {
    this.type = type;
    // deep copy 形狀矩陣，避免旋轉時改到 SHAPES 原始資料
    this.shape = SHAPES[type].map((row) => [...row]);
    this.color = COLORS[type];
    const size = this.shape.length;
    this.x = Math.floor((COLS - size) / 2);
    this.y = -this.getTopOffset(); // 從棋盤上方一點點開始，讓玩家看到方塊出現
  }

  // 計算方塊矩陣中，最上面有內容的列數（用於決定初始 y）
  getTopOffset() {
    for (let r = 0; r < this.shape.length; r++) {
      if (this.shape[r].some((v) => v)) return this.shape.length - r - 1;
    }
    return 0;
  }

  // 回傳順時針旋轉後的新矩陣（不修改自身，供碰撞測試用）
  rotatedShape() {
    const n = this.shape.length;
    const result = Array.from({ length: n }, () => Array(n).fill(0));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        result[c][n - 1 - r] = this.shape[r][c];
      }
    }
    return result;
  }

  applyRotation(newShape) {
    this.shape = newShape;
  }
}

// 7-bag 隨機袋：每 7 個方塊為一組，組內不重複，避免長時間拿不到某個方塊
class PieceBag {
  constructor() {
    this.queue = [];
  }

  refill() {
    const bag = [...PIECE_TYPES];
    // Fisher-Yates 洗牌
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    this.queue.push(...bag);
  }

  next() {
    if (this.queue.length < 1) this.refill();
    return new Piece(this.queue.shift());
  }

  peek() {
    if (this.queue.length < 1) this.refill();
    return this.queue[0];
  }
}
