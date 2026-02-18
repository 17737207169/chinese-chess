import type { Piece, Move, Side, PieceType } from '../types/chess'
import { buildBoard } from '../engine/board'
import { getAllLegalMoves, executeMove, undoMove } from '../engine/move'
import { isInCheck } from '../engine/rules'

const PIECE_VALUES: Record<PieceType, number> = {
  jiang: 10000,
  ju: 900,
  pao: 450,
  ma: 400,
  xiang: 200,
  shi: 200,
  bing: 100,
}

const POSITION_BONUS_BING_RED: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [90, 90, 110, 120, 120, 120, 110, 90, 90],
  [90, 90, 110, 120, 120, 120, 110, 90, 90],
  [70, 90, 110, 110, 110, 110, 110, 90, 70],
  [70, 70, 70, 70, 70, 70, 70, 70, 70],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
]

function flipBoard(table: number[][]): number[][] {
  return [...table].reverse().map((row) => [...row].reverse())
}

const POSITION_BONUS_BING_BLACK = flipBoard(POSITION_BONUS_BING_RED)

const POSITION_BONUS_MA: number[][] = [
  [40, 50, 60, 60, 60, 60, 60, 50, 40],
  [50, 60, 70, 70, 70, 70, 70, 60, 50],
  [60, 70, 80, 80, 80, 80, 80, 70, 60],
  [60, 70, 80, 90, 90, 90, 80, 70, 60],
  [60, 70, 80, 90, 90, 90, 80, 70, 60],
  [60, 70, 80, 90, 90, 90, 80, 70, 60],
  [60, 70, 80, 80, 80, 80, 80, 70, 60],
  [50, 60, 70, 70, 70, 70, 70, 60, 50],
  [40, 50, 60, 60, 60, 60, 60, 50, 40],
  [40, 40, 50, 50, 50, 50, 50, 40, 40],
]

function getPositionBonus(piece: Piece): number {
  if (piece.type === 'bing') {
    const table = piece.side === 'red' ? POSITION_BONUS_BING_RED : POSITION_BONUS_BING_BLACK
    return table[piece.y][piece.x]
  }
  if (piece.type === 'ma') {
    return POSITION_BONUS_MA[piece.y][piece.x]
  }
  return 0
}

function evaluateBoard(pieces: Piece[], side: Side): number {
  let score = 0
  for (const p of pieces) {
    if (!p.alive) continue
    const value = PIECE_VALUES[p.type] + getPositionBonus(p)
    score += p.side === side ? value : -value
  }
  return score
}

function orderMoves(moves: Move[]): Move[] {
  return moves.sort((a, b) => {
    const aScore = a.captured ? PIECE_VALUES[a.captured.type] : 0
    const bScore = b.captured ? PIECE_VALUES[b.captured.type] : 0
    return bScore - aScore
  })
}

function minimax(
  pieces: Piece[],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiSide: Side,
): number {
  if (depth === 0) {
    return evaluateBoard(pieces, aiSide)
  }

  const currentSide: Side = isMaximizing ? aiSide : (aiSide === 'red' ? 'black' : 'red')
  let moves = getAllLegalMoves(pieces, currentSide)

  if (moves.length === 0) {
    const board = buildBoard(pieces)
    if (isInCheck(board, currentSide)) {
      return isMaximizing ? -99999 + (4 - depth) : 99999 - (4 - depth)
    }
    return isMaximizing ? -50000 : 50000
  }

  moves = orderMoves(moves)

  if (isMaximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      const realPiece = pieces.find((p) => p.id === move.piece.id)!
      const realCaptured = move.captured
        ? pieces.find((p) => p.id === move.captured!.id)
        : undefined

      const actualMove: Move = {
        ...move,
        piece: realPiece,
        captured: realCaptured,
      }

      executeMove(pieces, actualMove)
      const evalScore = minimax(pieces, depth - 1, alpha, beta, false, aiSide)
      undoMove(pieces, actualMove)

      maxEval = Math.max(maxEval, evalScore)
      alpha = Math.max(alpha, evalScore)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of moves) {
      const realPiece = pieces.find((p) => p.id === move.piece.id)!
      const realCaptured = move.captured
        ? pieces.find((p) => p.id === move.captured!.id)
        : undefined

      const actualMove: Move = {
        ...move,
        piece: realPiece,
        captured: realCaptured,
      }

      executeMove(pieces, actualMove)
      const evalScore = minimax(pieces, depth - 1, alpha, beta, true, aiSide)
      undoMove(pieces, actualMove)

      minEval = Math.min(minEval, evalScore)
      beta = Math.min(beta, evalScore)
      if (beta <= alpha) break
    }
    return minEval
  }
}

export function findBestMove(pieces: Piece[], side: Side, depth: number = 3): Move | null {
  const moves = getAllLegalMoves(pieces, side)
  if (moves.length === 0) return null

  let bestMove: Move | null = null
  let bestScore = -Infinity

  const orderedMoves = orderMoves(moves)

  for (const move of orderedMoves) {
    const realPiece = pieces.find((p) => p.id === move.piece.id)!
    const realCaptured = move.captured
      ? pieces.find((p) => p.id === move.captured!.id)
      : undefined

    const actualMove: Move = {
      ...move,
      piece: realPiece,
      captured: realCaptured,
    }

    executeMove(pieces, actualMove)
    const score = minimax(pieces, depth - 1, -Infinity, Infinity, false, side)
    undoMove(pieces, actualMove)

    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}
