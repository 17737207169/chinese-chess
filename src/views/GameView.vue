<template>
  <div class="game-view">
    <!-- Desktop layout -->
    <div class="desktop-layout">
      <div class="side-panel">
        <div class="panel-card">
          <h2 class="panel-title">游戏信息</h2>
          <div class="info-row">
            <span class="info-label">模式</span>
            <span class="info-value">{{ store.gameMode === 'pve' ? '人机对战' : '双人对战' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">回合</span>
            <span class="info-value turn-indicator" :class="store.currentTurn">
              {{ store.currentTurn === 'red' ? '红方' : '黑方' }}
            </span>
          </div>
          <div v-if="store.aiThinking" class="ai-thinking">
            <div class="spinner" />
            <span>AI 思考中...</span>
          </div>
          <div v-if="statusText" class="status-bar" :class="statusClass">
            {{ statusText }}
          </div>
        </div>

        <div class="panel-card actions">
          <button class="action-btn" @click="store.undoLastMove" :disabled="store.moveHistory.length === 0 || store.aiThinking">
            ↩ 悔棋
          </button>
          <button class="action-btn" @click="store.resetGame" :disabled="store.aiThinking">
            🔄 重新开始
          </button>
          <button class="action-btn secondary" @click="backToMenu">
            ◁ 返回菜单
          </button>
        </div>

        <div class="panel-card history" v-if="store.moveHistory.length > 0">
          <h3 class="history-title">走棋记录</h3>
          <div class="history-list">
            <div
              v-for="(move, idx) in recentMoves"
              :key="idx"
              class="history-item"
              :class="move.piece.side"
            >
              <span class="move-num">{{ store.moveHistory.length - recentMoves.length + idx + 1 }}.</span>
              <span class="move-side">{{ move.piece.side === 'red' ? '红' : '黑' }}</span>
              <span class="move-detail">
                {{ getPieceName(move.piece) }}
                ({{ move.fromX }},{{ move.fromY }}) → ({{ move.toX }},{{ move.toY }})
              </span>
              <span v-if="move.captured" class="move-capture">
                吃{{ getPieceName(move.captured) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="board-area-desktop">
        <ChessBoard />
      </div>
    </div>

    <!-- Mobile layout -->
    <div class="mobile-layout">
      <div class="mobile-top-bar">
        <button class="mobile-icon-btn" @click="backToMenu">◁</button>

        <div class="mobile-status">
          <span class="turn-badge" :class="store.currentTurn">
            {{ store.currentTurn === 'red' ? '红方' : '黑方' }}
          </span>
          <span v-if="store.aiThinking" class="thinking-text">
            <span class="mini-spinner" /> AI思考中
          </span>
          <span v-else-if="statusText" class="status-text" :class="statusClass">
            {{ statusText }}
          </span>
        </div>

        <span class="mobile-mode-label">{{ store.gameMode === 'pve' ? '人机' : '双人' }}</span>
      </div>

      <div class="mobile-board-area">
        <ChessBoard />
      </div>

      <div class="mobile-bottom-bar">
        <button
          class="mobile-action-btn"
          @click="store.undoLastMove"
          :disabled="store.moveHistory.length === 0 || store.aiThinking"
        >
          悔棋
        </button>
        <button
          class="mobile-action-btn primary"
          @click="store.resetGame"
          :disabled="store.aiThinking"
        >
          重新开始
        </button>
      </div>
    </div>

    <!-- Result modal -->
    <Teleport to="body">
      <div v-if="store.gameStatus === 'checkmate'" class="modal-overlay" @click="store.resetGame">
        <div class="modal-card" @click.stop>
          <div class="result-icon">🏆</div>
          <h2 class="result-title" :class="store.winner || ''">
            {{ store.winner === 'red' ? '红方胜！' : '黑方胜！' }}
          </h2>
          <p class="result-desc">将军！游戏结束</p>
          <div class="modal-actions">
            <button class="modal-btn primary" @click="store.resetGame">再来一局</button>
            <button class="modal-btn" @click="backToMenu">返回菜单</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import ChessBoard from '../components/ChessBoard.vue'
import { useGameStore } from '../store/gameStore'
import { PIECE_NAMES } from '../types/chess'
import type { Piece } from '../types/chess'

const router = useRouter()
const store = useGameStore()

const statusText = computed(() => {
  if (store.gameStatus === 'check') return '将军！'
  if (store.gameStatus === 'checkmate') {
    return store.winner === 'red' ? '红方获胜！' : '黑方获胜！'
  }
  return ''
})

const statusClass = computed(() => {
  if (store.gameStatus === 'check') return 'warning'
  if (store.gameStatus === 'checkmate') return 'danger'
  return ''
})

const recentMoves = computed(() => store.moveHistory.slice(-8))

function getPieceName(piece: Piece) {
  return PIECE_NAMES[piece.type][piece.side]
}

function backToMenu() {
  store.returnToMenu()
  router.push('/')
}
</script>

<style lang="scss" scoped>
/* ========== Desktop layout ========== */
.game-view {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(135deg, #2c1810 0%, #4a2c1a 50%, #2c1810 100%);
  overflow: hidden;
}

.desktop-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: center;
  padding: 24px;
  min-height: 100vh;
  align-items: center;
}

.mobile-layout {
  display: none;
}

.side-panel {
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
}

.panel-card {
  background: linear-gradient(145deg, #f5e6c8, #e8d5a3);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.panel-title {
  font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
  font-size: 20px;
  color: #5a3e2b;
  margin: 0 0 16px;
  text-align: center;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(139, 94, 60, 0.15);
  &:last-child { border-bottom: none; }
}

.info-label { font-size: 14px; color: #8b7355; }
.info-value { font-size: 14px; font-weight: 600; color: #5a3e2b; }

.turn-indicator {
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 13px;
  &.red { background: rgba(196, 30, 30, 0.12); color: #c41e1e; }
  &.black { background: rgba(26, 26, 46, 0.12); color: #1a1a2e; }
}

.ai-thinking {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin-top: 12px;
  background: rgba(255, 193, 7, 0.12);
  border-radius: 8px;
  font-size: 14px;
  color: #8b6914;
}

.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(139, 105, 20, 0.3);
  border-top-color: #8b6914;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.status-bar {
  margin-top: 12px; padding: 10px; border-radius: 8px;
  text-align: center; font-weight: 700;
  font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
  font-size: 16px;
  &.warning { background: rgba(255, 152, 0, 0.15); color: #e65100; }
  &.danger { background: rgba(244, 67, 54, 0.15); color: #c62828; }
}

.actions {
  display: flex; flex-direction: column; gap: 8px;
}

.action-btn {
  width: 100%; padding: 10px;
  font-size: 14px; font-weight: 600;
  font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
  color: #5a3e2b;
  background: rgba(255, 255, 255, 0.6);
  border: 1.5px solid #c4a882; border-radius: 8px;
  cursor: pointer; transition: all 0.2s ease;
  &:hover:not(:disabled) { background: rgba(255, 255, 255, 0.9); border-color: #8b5e3c; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &.secondary {
    background: transparent;
    border-color: rgba(196, 168, 130, 0.5);
    color: #8b7355; font-size: 13px;
  }
}

.history {
  max-height: 260px; overflow: hidden;
  display: flex; flex-direction: column;
}

.history-title {
  font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
  font-size: 16px; color: #5a3e2b;
  margin: 0 0 10px; text-align: center;
}

.history-list {
  overflow-y: auto; flex: 1;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(139, 94, 60, 0.3); border-radius: 2px; }
}

.history-item {
  padding: 4px 0; font-size: 12px; color: #5a3e2b;
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
  .move-num { color: #8b7355; min-width: 22px; }
  .move-side { font-weight: 700; font-size: 11px; padding: 1px 4px; border-radius: 3px; }
  &.red .move-side { color: #c41e1e; background: rgba(196, 30, 30, 0.08); }
  &.black .move-side { color: #1a1a2e; background: rgba(26, 26, 46, 0.08); }
  .move-capture { color: #c62828; font-weight: 600; }
}

.board-area-desktop {
  flex-shrink: 0;
  height: 640px;
  display: flex;
  align-items: center;
}

/* ========== Mobile layout ========== */
@media (max-width: 700px) {
  .desktop-layout { display: none; }
  .mobile-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
  }

  .mobile-top-bar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    background: linear-gradient(145deg, #f5e6c8, #e8d5a3);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 20;
    min-height: 40px;
  }

  .mobile-icon-btn {
    width: 32px; height: 32px;
    border: 1.5px solid #c4a882;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.5);
    color: #5a3e2b;
    font-size: 16px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    -webkit-tap-highlight-color: transparent;
  }

  .mobile-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
  }

  .turn-badge {
    padding: 2px 12px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 700;
    &.red { background: rgba(196, 30, 30, 0.15); color: #c41e1e; }
    &.black { background: rgba(26, 26, 46, 0.15); color: #1a1a2e; }
  }

  .thinking-text {
    font-size: 12px;
    color: #8b6914;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .mini-spinner {
    display: inline-block;
    width: 12px; height: 12px;
    border: 1.5px solid rgba(139, 105, 20, 0.3);
    border-top-color: #8b6914;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .status-text {
    font-size: 13px; font-weight: 700;
    &.warning { color: #e65100; }
    &.danger { color: #c62828; }
  }

  .mobile-mode-label {
    font-size: 12px;
    color: #8b7355;
    padding: 2px 8px;
    border: 1px solid rgba(139, 94, 60, 0.2);
    border-radius: 4px;
  }

  .mobile-board-area {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
  }

  .mobile-bottom-bar {
    flex-shrink: 0;
    display: flex;
    gap: 10px;
    padding: 8px 12px;
    padding-bottom: max(8px, env(safe-area-inset-bottom));
    background: linear-gradient(145deg, #f5e6c8, #e8d5a3);
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
    z-index: 20;
  }

  .mobile-action-btn {
    flex: 1;
    padding: 10px 0;
    font-size: 14px;
    font-weight: 600;
    font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
    color: #5a3e2b;
    background: rgba(255, 255, 255, 0.6);
    border: 1.5px solid #c4a882;
    border-radius: 8px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;

    &:disabled { opacity: 0.5; }

    &.primary {
      background: linear-gradient(135deg, #8b5e3c, #6b4226);
      color: #fff;
      border-color: #6b4226;
    }
  }
}

/* ========== Modal ========== */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-card {
  background: linear-gradient(145deg, #f5e6c8, #e8d5a3);
  border-radius: 20px;
  padding: 32px 36px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  max-width: 340px;
  width: 88%;
}

.result-icon { font-size: 48px; margin-bottom: 8px; }

.result-title {
  font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
  font-size: 28px; margin: 0 0 6px;
  &.red { color: #c41e1e; }
  &.black { color: #1a1a2e; }
}

.result-desc { color: #8b7355; margin: 0 0 24px; font-size: 14px; }

.modal-actions { display: flex; gap: 10px; justify-content: center; }

.modal-btn {
  padding: 10px 20px; font-size: 14px; font-weight: 600;
  font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
  border: 1.5px solid #c4a882; border-radius: 10px;
  background: rgba(255, 255, 255, 0.6); color: #5a3e2b;
  cursor: pointer; transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;

  &.primary {
    background: linear-gradient(135deg, #8b5e3c, #6b4226);
    color: #fff; border-color: #6b4226;
  }
}
</style>
