<template>
  <div class="menu-view">
    <div class="menu-card">
      <div class="title-section">
        <div class="decorative-line" />
        <h1 class="title">中国象棋</h1>
        <p class="subtitle">Chinese Chess</p>
        <div class="decorative-line" />
      </div>

      <div class="mode-section">
        <button
          class="mode-btn"
          :class="{ active: selectedMode === 'pve' }"
          @click="selectedMode = 'pve'"
        >
          <span class="mode-icon">🤖</span>
          <span class="mode-label">人机对战</span>
          <span class="mode-desc">挑战 AI 对手</span>
        </button>

        <button
          class="mode-btn"
          :class="{ active: selectedMode === 'pvp' }"
          @click="selectedMode = 'pvp'"
        >
          <span class="mode-icon">👥</span>
          <span class="mode-label">双人对战</span>
          <span class="mode-desc">本地双人对弈</span>
        </button>
      </div>

      <button class="start-btn" @click="startGame">
        开始游戏
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../store/gameStore'
import type { GameMode } from '../types/chess'

const router = useRouter()
const store = useGameStore()
const selectedMode = ref<GameMode>('pve')

function startGame() {
  store.startGame(selectedMode.value)
  router.push('/game')
}
</script>

<style lang="scss" scoped>
.menu-view {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2c1810 0%, #4a2c1a 50%, #2c1810 100%);
  padding: 16px;
}

.menu-card {
  background: linear-gradient(145deg, #f5e6c8, #e8d5a3);
  border-radius: 20px;
  padding: 40px 32px;
  max-width: 440px;
  width: 100%;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  text-align: center;
}

.title-section {
  margin-bottom: 28px;
}

.decorative-line {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #8b5e3c, transparent);
  margin: 10px auto;
}

.title {
  font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
  font-size: clamp(32px, 8vw, 48px);
  font-weight: 900;
  color: #5a3e2b;
  margin: 0;
  letter-spacing: 6px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 13px;
  color: #8b7355;
  margin: 4px 0 0;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.mode-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 2px solid #c4a882;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    border-color: #8b5e3c;
  }

  &.active {
    background: rgba(139, 94, 60, 0.12);
    border-color: #8b5e3c;
    box-shadow: 0 0 0 1px #8b5e3c;
  }

  .mode-icon {
    font-size: 28px;
    flex-shrink: 0;
  }

  .mode-label {
    font-size: 17px;
    font-weight: 700;
    color: #5a3e2b;
    display: block;
    font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
  }

  .mode-desc {
    font-size: 12px;
    color: #8b7355;
    display: block;
    margin-top: 2px;
  }
}

.start-btn {
  width: 100%;
  padding: 14px;
  font-size: 18px;
  font-weight: 700;
  font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
  color: #fff;
  background: linear-gradient(135deg, #8b5e3c, #6b4226);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  letter-spacing: 6px;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(107, 66, 38, 0.3);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:hover {
    background: linear-gradient(135deg, #a0724e, #8b5e3c);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(107, 66, 38, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>
