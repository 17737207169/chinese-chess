import type { Piece, Move, Side } from '../types/chess'
import { buildBoard } from './board'
import { isValidMove, isInCheck, kingsAreFacing, getValidMovesForPiece } from './rules'

export function executeMove(pieces: Piece[], move: Move): void {
  const piece = pieces.find((p) => p.id === move.piece.id)
  if (!piece) return

  if (move.captured) {
    const captured = pieces.find((p) => p.id === move.captured!.id)
    if (captured) captured.alive = false
  }

  piece.x = move.toX
  piece.y = move.toY
}

export function undoMove(pieces: Piece[], move: Move): void {
  const piece = pieces.find((p) => p.id === move.piece.id)
  if (!piece) return

  piece.x = move.fromX
  piece.y = move.fromY

  if (move.captured) {
    const captured = pieces.find((p) => p.id === move.captured!.id)
    if (captured) {
      captured.alive = true
      captured.x = move.toX
      captured.y = move.toY
    }
  }
}

/**
 * Check legality by mutating in-place then reverting (no clone).
 * Assumes isValidMove already passed.
 */
function isLegalAfterValid(
  pieces: Piece[],
  piece: Piece,
  toX: number,
  toY: number,
): boolean {
  const fromX = piece.x
  const fromY = piece.y
  const captured = pieces.find(
    (p) => p.alive && p.x === toX && p.y === toY && p.side !== piece.side,
  )

  if (captured) captured.alive = false
  piece.x = toX
  piece.y = toY

  const board = buildBoard(pieces)
  const legal = !isInCheck(board, piece.side) && !kingsAreFacing(board)

  piece.x = fromX
  piece.y = fromY
  if (captured) {
    captured.alive = true
    captured.x = toX
    captured.y = toY
  }

  return legal
}

export function isLegalMove(
  pieces: Piece[],
  piece: Piece,
  toX: number,
  toY: number,
): boolean {
  const board = buildBoard(pieces)
  if (!isValidMove(piece, toX, toY, board)) return false
  return isLegalAfterValid(pieces, piece, toX, toY)
}

export function getAllLegalMoves(pieces: Piece[], side: Side): Move[] {
  const board = buildBoard(pieces)
  const moves: Move[] = []
  const sidePieces = pieces.filter((p) => p.side === side && p.alive)

  for (const piece of sidePieces) {
    const validTargets = getValidMovesForPiece(piece, board)
    for (const { x, y } of validTargets) {
      if (!isLegalAfterValid(pieces, piece, x, y)) continue

      const captured = board[y][x]
      moves.push({
        piece: { ...piece },
        fromX: piece.x,
        fromY: piece.y,
        toX: x,
        toY: y,
        captured: captured && captured.side !== side ? { ...captured } : undefined,
      })
    }
  }

  return moves
}

export function getLegalMovesForPiece(pieces: Piece[], piece: Piece): { x: number; y: number }[] {
  const board = buildBoard(pieces)
  const validTargets = getValidMovesForPiece(piece, board)
  const result: { x: number; y: number }[] = []
  for (const { x, y } of validTargets) {
    if (isLegalAfterValid(pieces, piece, x, y)) {
      result.push({ x, y })
    }
  }
  return result
}

export function isCheckmate(pieces: Piece[], side: Side): boolean {
  return getAllLegalMoves(pieces, side).length === 0
}
