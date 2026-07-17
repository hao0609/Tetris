// ============================================================
// constants.js — 棋盤尺寸、方塊定義、霓虹配色、計分/速度表
// ============================================================

const COLS = 10;
const ROWS = 20;
const CELL = 30; // px，畫布上每格大小

// 每種方塊的形狀矩陣（4x4 內定義，0 = 空、1 = 實心）
// 使用單一「基準」旋轉狀態，旋轉時以矩陣轉置 + 反轉方式計算（見 piece.js）
const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

// 霓虹配色：每個方塊一個高飽和螢光色，並附上對應的發光色（用於陰影）
const COLORS = {
  I: { fill: '#00f0ff', glow: 'rgba(0, 240, 255, 0.85)' },
  O: { fill: '#ffe600', glow: 'rgba(255, 230, 0, 0.85)' },
  T: { fill: '#b026ff', glow: 'rgba(176, 38, 255, 0.85)' },
  S: { fill: '#39ff14', glow: 'rgba(57, 255, 20, 0.85)' },
  Z: { fill: '#ff2b6d', glow: 'rgba(255, 43, 109, 0.85)' },
  J: { fill: '#2b6dff', glow: 'rgba(43, 109, 255, 0.85)' },
  L: { fill: '#ff9500', glow: 'rgba(255, 149, 0, 0.85)' },
};

const PIECE_TYPES = Object.keys(SHAPES);

// 每消除行數對應的基礎分數（乘上當前等級）
const LINE_SCORES = { 1: 100, 2: 300, 3: 500, 4: 800 };

// 每等級的下落間隔（毫秒）。等級越高下落越快，最低不小於 100ms。
function levelDropInterval(level) {
  const base = 1000;
  const interval = base - (level - 1) * 75;
  return Math.max(interval, 100);
}

// 每消除幾行升一級
const LINES_PER_LEVEL = 10;

const HIGH_SCORE_KEY = 'tetris_neon_high_score';
