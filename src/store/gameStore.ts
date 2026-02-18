import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Piece, Side, GameMode, GameStatus, Move } from '../types/chess'
import { createInitialPieces, buildBoard } from '../engine/board'
import { isLegalMove, getLegalMovesForPiece, isCheckmate } from '../engine/move'
import { isInCheck } from '../engine/rules'
import { findBestMove } from '../ai/minimax'

export const useGameStore = defineStore('game', () => {
  const pieces = ref<Piece[]>([])
  const currentTurn = ref<Side>('red')
  const gameMode = ref<GameMode>('pvp')
  const gameStatus = ref<GameStatus>('menu')
  const selectedPiece = ref<Piece | null>(null)
  const legalMoves = ref<{ x: number; y: number }[]>([])
  const moveHistory = ref<Move[]>([])
  const winner = ref<Side | null>(null)
  const aiThinking = ref(false)
  const lastMove = ref<Move | null>(null)

  const board = computed(() => buildBoard(pieces.value))

  function startGame(mode: GameMode) {
    gameMode.value = mode
    pieces.value = createInitialPieces()
    currentTurn.value = 'red'
    gameStatus.value = 'playing'
    selectedPiece.value = null
    legalMoves.value = []
    moveHistory.value = []
    winner.value = null
    aiThinking.value = false
    lastMove.value = null
  }

  function selectPiece(piece: Piece) {
    if (aiThinking.value) return
    if (piece.side !== currentTurn.value) return

    selectedPiece.value = piece
    legalMoves.value = getLegalMovesForPiece(pieces.value, piece)
  }

  function clearSelection() {
    selectedPiece.value = null
    legalMoves.value = []
  }

  function movePiece(toX: number, toY: number) {
    if (!selectedPiece.value) return
    if (aiThinking.value) return

    const piece = selectedPiece.value
    if (!isLegalMove(pieces.value, piece, toX, toY)) return

    const realPiece = pieces.value.find((p) => p.id === piece.id)
    if (!realPiece) return

    const captured = pieces.value.find(
      (p) => p.alive && p.x === toX && p.y === toY && p.side !== piece.side,
    )

    const move: Move = {
      piece: { ...realPiece },
      fromX: realPiece.x,
      fromY: realPiece.y,
      toX,
      toY,
      captured: captured ? { ...captured } : undefined,
    }

    if (captured) captured.alive = false
    realPiece.x = toX
    realPiece.y = toY

    moveHistory.value.push(move)
    lastMove.value = move
    clearSelection()

    const opponentSide: Side = currentTurn.value === 'red' ? 'black' : 'red'

    if (isCheckmate(pieces.value, opponentSide)) {
      gameStatus.value = 'checkmate'
      winner.value = currentTurn.value
      return
    }

    const newBoard = buildBoard(pieces.value)
    if (isInCheck(newBoard, opponentSide)) {
      gameStatus.value = 'check'
    } else {
      gameStatus.value = 'playing'
    }

    currentTurn.value = opponentSide

    if (gameMode.value === 'pve' && currentTurn.value === 'black') {
      triggerAI()
    }
  }

  function triggerAI() {
    aiThinking.value = true

    setTimeout(() => {
      const bestMove = findBestMove(pieces.value, 'black', 3)

      if (!bestMove) {
        gameStatus.value = 'checkmate'
        winner.value = 'red'
        aiThinking.value = false
        return
      }

      const realPiece = pieces.value.find((p) => p.id === bestMove.piece.id)
      if (!realPiece) {
        aiThinking.value = false
        return
      }

      const captured = pieces.value.find(
        (p) => p.alive && p.x === bestMove.toX && p.y === bestMove.toY && p.side !== 'black',
      )

      const move: Move = {
        piece: { ...realPiece },
        fromX: realPiece.x,
        fromY: realPiece.y,
        toX: bestMove.toX,
        toY: bestMove.toY,
        captured: captured ? { ...captured } : undefined,
      }

      if (captured) captured.alive = false
      realPiece.x = bestMove.toX
      realPiece.y = bestMove.toY

      moveHistory.value.push(move)
      lastMove.value = move

      if (isCheckmate(pieces.value, 'red')) {
        gameStatus.value = 'checkmate'
        winner.value = 'black'
        aiThinking.value = false
        return
      }

      const newBoard = buildBoard(pieces.value)
      if (isInCheck(newBoard, 'red')) {
        gameStatus.value = 'check'
      } else {
        gameStatus.value = 'playing'
      }

      currentTurn.value = 'red'
      aiThinking.value = false
    }, 100)
  }

  function undoLastMove() {
    if (moveHistory.value.length === 0) return
    if (aiThinking.value) return

    const stepsToUndo = gameMode.value === 'pve' && currentTurn.value === 'red' ? 2 : 1

    for (let i = 0; i < stepsToUndo; i++) {
      const move = moveHistory.value.pop()
      if (!move) break

      const piece = pieces.value.find((p) => p.id === move.piece.id)
      if (piece) {
        piece.x = move.fromX
        piece.y = move.fromY
      }

      if (move.captured) {
        const captured = pieces.value.find((p) => p.id === move.captured!.id)
        if (captured) {
          captured.alive = true
          captured.x = move.toX
          captured.y = move.toY
        }
      }
    }

    currentTurn.value = gameMode.value === 'pve' ? 'red' : (currentTurn.value === 'red' ? 'black' : 'red')
    lastMove.value = moveHistory.value.length > 0 ? moveHistory.value[moveHistory.value.length - 1] : null
    gameStatus.value = 'playing'
    winner.value = null
    clearSelection()
  }

  function resetGame() {
    startGame(gameMode.value)
  }

  function returnToMenu() {
    gameStatus.value = 'menu'
    pieces.value = []
    clearSelection()
    moveHistory.value = []
    winner.value = null
    lastMove.value = null
  }

  return {
    pieces,
    currentTurn,
    gameMode,
    gameStatus,
    selectedPiece,
    legalMoves,
    moveHistory,
    winner,
    aiThinking,
    lastMove,
    board,
    startGame,
    selectPiece,
    clearSelection,
    movePiece,
    undoLastMove,
    resetGame,
    returnToMenu,
  }
})
