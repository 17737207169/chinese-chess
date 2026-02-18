import type { Piece, Move, Side } from '../types/chess'
import { BOARD_WIDTH, BOARD_HEIGHT } from '../types/chess'
import { buildBoard, clonePieces } from './board'
import { isValidMove, isInCheck, kingsAreFacing } from './rules'

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
 * Try a move and check if it leaves the current player in check
 * or creates a facing-kings situation.
 */
export function isLegalMove(
  pieces: Piece[],
  piece: Piece,
  toX: number,
  toY: number,
): boolean {
  const board = buildBoard(pieces)
  if (!isValidMove(piece, toX, toY, board)) return false

  const testPieces = clonePieces(pieces)
  const testPiece = testPieces.find((p) => p.id === piece.id)!
  const captured = testPieces.find(
    (p) => p.alive && p.x === toX && p.y === toY && p.side !== piece.side,
  )

  if (captured) captured.alive = false
  testPiece.x = toX
  testPiece.y = toY

  const testBoard = buildBoard(testPieces)

  if (isInCheck(testBoard, piece.side)) return false
  if (kingsAreFacing(testBoard)) return false

  return true
}

export function getAllLegalMoves(pieces: Piece[], side: Side): Move[] {
  const board = buildBoard(pieces)
  const moves: Move[] = []
  const sidePieces = pieces.filter((p) => p.side === side && p.alive)

  for (const piece of sidePieces) {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (!isValidMove(piece, x, y, board)) continue
        if (!isLegalMove(pieces, piece, x, y)) continue

        const captured = pieces.find(
          (p) => p.alive && p.x === x && p.y === y && p.side !== side,
        )

        moves.push({
          piece: { ...piece },
          fromX: piece.x,
          fromY: piece.y,
          toX: x,
          toY: y,
          captured: captured ? { ...captured } : undefined,
        })
      }
    }
  }

  return moves
}

export function getLegalMovesForPiece(pieces: Piece[], piece: Piece): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = []
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (isLegalMove(pieces, piece, x, y)) {
        result.push({ x, y })
      }
    }
  }
  return result
}

export function isCheckmate(pieces: Piece[], side: Side): boolean {
  return getAllLegalMoves(pieces, side).length === 0
}
