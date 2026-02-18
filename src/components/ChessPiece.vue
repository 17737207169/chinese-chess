<template>
  <div
    class="chess-piece"
    :class="[
      piece.side,
      { selected: isSelected, 'last-moved': isLastMoved },
    ]"
    :style="sizeStyle"
    @click.stop="$emit('select', piece)"
  >
    <span class="piece-text" :style="{ fontSize: fontSize + 'px' }">{{ displayName }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Piece } from '../types/chess'
import { PIECE_NAMES } from '../types/chess'

const props = defineProps<{
  piece: Piece
  isSelected: boolean
  isLastMoved: boolean
  pieceSize: number
}>()

defineEmits<{
  select: [piece: Piece]
}>()

const displayName = computed(() => PIECE_NAMES[props.piece.type][props.piece.side])

const sizeStyle = computed(() => ({
  width: props.pieceSize + 'px',
  height: props.pieceSize + 'px',
  borderWidth: Math.max(1.5, props.pieceSize * 0.04) + 'px',
}))

const fontSize = computed(() => Math.round(props.pieceSize * 0.5))
</script>

<style lang="scss" scoped>
.chess-piece {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 10;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: box-shadow 0.2s ease;
  border-style: solid;
  border-color: #5a3e2b;
  background: radial-gradient(circle at 35% 35%, #fff8e7, #e8d5a3);
  box-shadow:
    1px 1px 3px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.5);

  &.red .piece-text {
    color: #c41e1e;
  }

  &.black .piece-text {
    color: #1a1a2e;
  }

  &.selected {
    box-shadow:
      0 0 0 2px #ffd700,
      0 0 8px rgba(255, 215, 0, 0.6),
      1px 1px 3px rgba(0, 0, 0, 0.3);
    transform: translate(-50%, -50%) scale(1.06);
  }

  &.last-moved {
    box-shadow:
      0 0 0 2px #4caf50,
      1px 1px 3px rgba(0, 0, 0, 0.3);
  }

  .piece-text {
    font-weight: 700;
    font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
    line-height: 1;
  }
}
</style>
