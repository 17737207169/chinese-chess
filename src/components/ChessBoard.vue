<template>
  <div ref="wrapperRef" class="chess-board-wrapper">
    <div
      class="chess-board"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      @click="handleBoardClick"
    >
      <canvas
        ref="canvasRef"
        :width="canvasWidth"
        :height="canvasHeight"
        class="board-canvas"
      />

      <div
        v-for="(move, idx) in store.legalMoves"
        :key="'move-' + idx"
        class="legal-move-dot"
        :class="{ capture: hasPieceAt(move.x, move.y) }"
        :style="getDotStyle(move.x, move.y)"
        @click.stop="store.movePiece(move.x, move.y)"
      />

      <ChessPiece
        v-for="piece in alivePieces"
        :key="piece.id"
        :piece="piece"
        :is-selected="store.selectedPiece?.id === piece.id"
        :is-last-moved="isLastMovedPiece(piece)"
        :piece-size="pieceSize"
        :style="getPieceStyle(piece)"
        @select="handlePieceClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import ChessPiece from './ChessPiece.vue'
import { useGameStore } from '../store/gameStore'
import type { Piece } from '../types/chess'

const store = useGameStore()
const canvasRef = ref<HTMLCanvasElement>()
const wrapperRef = ref<HTMLElement>()

const cellSize = ref(60)
const padding = ref(40)

const canvasWidth = computed(() => padding.value * 2 + cellSize.value * 8)
const canvasHeight = computed(() => padding.value * 2 + cellSize.value * 9)
const pieceSize = computed(() => Math.round(cellSize.value * 0.82))
const dotSize = computed(() => Math.max(8, Math.round(cellSize.value * 0.25)))
const captureDotSize = computed(() => pieceSize.value)

const alivePieces = computed(() => store.pieces.filter((p) => p.alive))

function computeSize() {
  const el = wrapperRef.value
  if (!el) return

  const availW = el.clientWidth
  const availH = el.clientHeight

  if (availW <= 0 || availH <= 0) return

  const pad = Math.max(12, Math.min(40, Math.round(availW * 0.04)))
  const cs = Math.min(
    (availW - pad * 2) / 8,
    (availH - pad * 2) / 9,
  )
  const finalCs = Math.max(28, Math.floor(cs))
  cellSize.value = finalCs
  padding.value = pad
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  computeSize()
  nextTick(drawBoard)

  resizeObserver = new ResizeObserver(() => {
    computeSize()
    nextTick(drawBoard)
  })
  if (wrapperRef.value) {
    resizeObserver.observe(wrapperRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

function hasPieceAt(x: number, y: number): boolean {
  return alivePieces.value.some((p) => p.x === x && p.y === y)
}

function isLastMovedPiece(piece: Piece): boolean {
  if (!store.lastMove) return false
  return store.lastMove.piece.id === piece.id
}

function getPieceStyle(piece: Piece) {
  return {
    left: `${padding.value + piece.x * cellSize.value}px`,
    top: `${padding.value + piece.y * cellSize.value}px`,
  }
}

function getDotStyle(x: number, y: number) {
  const isCapture = hasPieceAt(x, y)
  const size = isCapture ? captureDotSize.value : dotSize.value
  return {
    left: `${padding.value + x * cellSize.value}px`,
    top: `${padding.value + y * cellSize.value}px`,
    width: size + 'px',
    height: size + 'px',
  }
}

function handlePieceClick(piece: Piece) {
  if (store.selectedPiece && store.selectedPiece.side !== piece.side) {
    store.movePiece(piece.x, piece.y)
  } else {
    store.selectPiece(piece)
  }
}

function handleBoardClick(e: MouseEvent) {
  if (!store.selectedPiece) return

  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const clickY = e.clientY - rect.top

  const x = Math.round((clickX - padding.value) / cellSize.value)
  const y = Math.round((clickY - padding.value) / cellSize.value)

  if (x >= 0 && x <= 8 && y >= 0 && y <= 9) {
    store.movePiece(x, y)
  }
}

function drawBoard() {
  const cs = cellSize.value
  const pad = padding.value
  const cw = canvasWidth.value
  const ch = canvasHeight.value

  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, cw, ch)

  ctx.fillStyle = '#f0d9a0'
  ctx.fillRect(0, 0, cw, ch)

  const lineW = Math.max(1, cs * 0.025)
  ctx.strokeStyle = '#5a3e2b'
  ctx.lineWidth = lineW

  for (let y = 0; y <= 9; y++) {
    ctx.beginPath()
    ctx.moveTo(pad, pad + y * cs)
    ctx.lineTo(pad + 8 * cs, pad + y * cs)
    ctx.stroke()
  }

  for (let x = 0; x <= 8; x++) {
    if (x === 0 || x === 8) {
      ctx.beginPath()
      ctx.moveTo(pad + x * cs, pad)
      ctx.lineTo(pad + x * cs, pad + 9 * cs)
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.moveTo(pad + x * cs, pad)
      ctx.lineTo(pad + x * cs, pad + 4 * cs)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pad + x * cs, pad + 5 * cs)
      ctx.lineTo(pad + x * cs, pad + 9 * cs)
      ctx.stroke()
    }
  }

  // Palace diagonals
  ctx.beginPath()
  ctx.moveTo(pad + 3 * cs, pad)
  ctx.lineTo(pad + 5 * cs, pad + 2 * cs)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(pad + 5 * cs, pad)
  ctx.lineTo(pad + 3 * cs, pad + 2 * cs)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(pad + 3 * cs, pad + 7 * cs)
  ctx.lineTo(pad + 5 * cs, pad + 9 * cs)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(pad + 5 * cs, pad + 7 * cs)
  ctx.lineTo(pad + 3 * cs, pad + 9 * cs)
  ctx.stroke()

  // River text
  const riverFontSize = Math.round(cs * 0.45)
  ctx.fillStyle = '#5a3e2b'
  ctx.font = `bold ${riverFontSize}px KaiTi, STKaiti, SimSun, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const riverY = pad + 4.5 * cs
  ctx.fillText('楚 河', pad + 2 * cs, riverY)
  ctx.fillText('汉 界', pad + 6 * cs, riverY)

  // Star points
  const starPoints = [
    [1, 2], [7, 2],
    [0, 3], [2, 3], [4, 3], [6, 3], [8, 3],
    [0, 6], [2, 6], [4, 6], [6, 6], [8, 6],
    [1, 7], [7, 7],
  ]
  for (const [sx, sy] of starPoints) {
    drawStar(ctx, pad + sx * cs, pad + sy * cs, sx, cs)
  }

  // Outer border
  const borderW = Math.max(2, cs * 0.05)
  const borderGap = Math.max(4, cs * 0.12)
  ctx.strokeStyle = '#5a3e2b'
  ctx.lineWidth = borderW
  ctx.strokeRect(
    pad - borderGap,
    pad - borderGap,
    8 * cs + borderGap * 2,
    9 * cs + borderGap * 2,
  )
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  gx: number,
  cs: number,
) {
  const len = Math.max(4, cs * 0.13)
  const gap = Math.max(2, cs * 0.06)
  const parts: [number, number, number, number][] = []

  if (gx > 0) {
    parts.push([-gap, -gap - len, -gap, -gap])
    parts.push([-gap - len, -gap, -gap, -gap])
    parts.push([-gap, gap, -gap, gap + len])
    parts.push([-gap - len, gap, -gap, gap])
  }
  if (gx < 8) {
    parts.push([gap, -gap - len, gap, -gap])
    parts.push([gap, -gap, gap + len, -gap])
    parts.push([gap, gap, gap, gap + len])
    parts.push([gap, gap, gap + len, gap])
  }

  ctx.strokeStyle = '#5a3e2b'
  ctx.lineWidth = Math.max(0.8, cs * 0.02)
  for (const [x1, y1, x2, y2] of parts) {
    ctx.beginPath()
    ctx.moveTo(cx + x1, cy + y1)
    ctx.lineTo(cx + x2, cy + y2)
    ctx.stroke()
  }
}

watch(() => store.gameStatus, () => nextTick(drawBoard))
watch(() => store.pieces.map((p) => `${p.id}-${p.x}-${p.y}-${p.alive}`).join(','), () => nextTick(drawBoard))
</script>

<style lang="scss" scoped>
.chess-board-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.chess-board {
  position: relative;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.25),
    0 2px 6px rgba(0, 0, 0, 0.15);
}

.board-canvas {
  display: block;
}

.legal-move-dot {
  position: absolute;
  border-radius: 50%;
  background: rgba(76, 175, 80, 0.6);
  transform: translate(-50%, -50%);
  z-index: 5;
  cursor: pointer;
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;

  &.capture {
    background: transparent;
    border: 2.5px solid rgba(244, 67, 54, 0.7);
    box-sizing: border-box;
  }
}
</style>
