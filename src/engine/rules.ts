import type { Piece, Board, Side } from '../types/chess'
import { BOARD_WIDTH, BOARD_HEIGHT } from '../types/chess'
import { getPieceAt, isInBoard } from './board'

function inPalace(x: number, y: number, side: Side): boolean {
  if (x < 3 || x > 5) return false
  return side === 'red' ? y >= 7 && y <= 9 : y >= 0 && y <= 2
}

function countPiecesBetweenStraight(
  board: Board,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  let count = 0
  if (x1 === x2) {
    const minY = Math.min(y1, y2)
    const maxY = Math.max(y1, y2)
    for (let y = minY + 1; y < maxY; y++) {
      if (board[y][x1]) count++
    }
  } else if (y1 === y2) {
    const minX = Math.min(x1, x2)
    const maxX = Math.max(x1, x2)
    for (let x = minX + 1; x < maxX; x++) {
      if (board[y1][x]) count++
    }
  }
  return count
}

function isJiangValid(piece: Piece, toX: number, toY: number, board: Board): boolean {
  const dx = Math.abs(toX - piece.x)
  const dy = Math.abs(toY - piece.y)
  if (dx + dy !== 1) return false
  if (!inPalace(toX, toY, piece.side)) return false
  const target = getPieceAt(board, toX, toY)
  if (target && target.side === piece.side) return false
  return true
}

function isShiValid(piece: Piece, toX: number, toY: number, board: Board): boolean {
  const dx = Math.abs(toX - piece.x)
  const dy = Math.abs(toY - piece.y)
  if (dx !== 1 || dy !== 1) return false
  if (!inPalace(toX, toY, piece.side)) return false
  const target = getPieceAt(board, toX, toY)
  if (target && target.side === piece.side) return false
  return true
}

function isXiangValid(piece: Piece, toX: number, toY: number, board: Board): boolean {
  const dx = toX - piece.x
  const dy = toY - piece.y
  if (Math.abs(dx) !== 2 || Math.abs(dy) !== 2) return false

  // Cannot cross river
  if (piece.side === 'red' && toY < 5) return false
  if (piece.side === 'black' && toY > 4) return false

  // Check blocking piece (蹩象眼)
  const blockX = piece.x + dx / 2
  const blockY = piece.y + dy / 2
  if (getPieceAt(board, blockX, blockY)) return false

  const target = getPieceAt(board, toX, toY)
  if (target && target.side === piece.side) return false
  return true
}

function isMaValid(piece: Piece, toX: number, toY: number, board: Board): boolean {
  const dx = toX - piece.x
  const dy = toY - piece.y
  const adx = Math.abs(dx)
  const ady = Math.abs(dy)

  if (!((adx === 1 && ady === 2) || (adx === 2 && ady === 1))) return false

  // Check blocking piece (蹩马腿)
  if (adx === 2) {
    if (getPieceAt(board, piece.x + dx / 2, piece.y)) return false
  } else {
    if (getPieceAt(board, piece.x, piece.y + dy / 2)) return false
  }

  const target = getPieceAt(board, toX, toY)
  if (target && target.side === piece.side) return false
  return true
}

function isJuValid(piece: Piece, toX: number, toY: number, board: Board): boolean {
  if (piece.x !== toX && piece.y !== toY) return false
  if (piece.x === toX && piece.y === toY) return false

  if (countPiecesBetweenStraight(board, piece.x, piece.y, toX, toY) !== 0)
    return false

  const target = getPieceAt(board, toX, toY)
  if (target && target.side === piece.side) return false
  return true
}

function isPaoValid(piece: Piece, toX: number, toY: number, board: Board): boolean {
  if (piece.x !== toX && piece.y !== toY) return false
  if (piece.x === toX && piece.y === toY) return false

  const target = getPieceAt(board, toX, toY)
  const between = countPiecesBetweenStraight(board, piece.x, piece.y, toX, toY)

  if (target) {
    if (target.side === piece.side) return false
    return between === 1
  } else {
    return between === 0
  }
}

function isBingValid(piece: Piece, toX: number, toY: number, board: Board): boolean {
  const dx = toX - piece.x
  const dy = toY - piece.y
  const adx = Math.abs(dx)
  const ady = Math.abs(dy)

  if (adx + ady !== 1) return false

  if (piece.side === 'red') {
    // Red moves upward (y decreasing)
    if (piece.y > 4) {
      // Before crossing river: only forward
      if (dy !== -1 || dx !== 0) return false
    } else {
      // After crossing: forward or sideways, no backward
      if (dy > 0) return false
    }
  } else {
    // Black moves downward (y increasing)
    if (piece.y < 5) {
      if (dy !== 1 || dx !== 0) return false
    } else {
      if (dy < 0) return false
    }
  }

  const target = getPieceAt(board, toX, toY)
  if (target && target.side === piece.side) return false
  return true
}

export function isValidMove(piece: Piece, toX: number, toY: number, board: Board): boolean {
  if (!isInBoard(toX, toY)) return false
  if (piece.x === toX && piece.y === toY) return false

  switch (piece.type) {
    case 'jiang': return isJiangValid(piece, toX, toY, board)
    case 'shi': return isShiValid(piece, toX, toY, board)
    case 'xiang': return isXiangValid(piece, toX, toY, board)
    case 'ma': return isMaValid(piece, toX, toY, board)
    case 'ju': return isJuValid(piece, toX, toY, board)
    case 'pao': return isPaoValid(piece, toX, toY, board)
    case 'bing': return isBingValid(piece, toX, toY, board)
    default: return false
  }
}

/**
 * After a move, check if the two generals face each other
 * on the same column with nothing in between — this is illegal.
 */
export function kingsAreFacing(board: Board): boolean {
  let redKing: Piece | null = null
  let blackKing: Piece | null = null

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const p = board[y][x]
      if (p && p.type === 'jiang') {
        if (p.side === 'red') redKing = p
        else blackKing = p
      }
    }
  }

  if (!redKing || !blackKing) return false
  if (redKing.x !== blackKing.x) return false

  return countPiecesBetweenStraight(board, redKing.x, redKing.y, blackKing.x, blackKing.y) === 0
}

export function isInCheck(board: Board, side: Side): boolean {
  let king: Piece | null = null
  const enemies: Piece[] = []

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const p = board[y][x]
      if (!p) continue
      if (p.type === 'jiang' && p.side === side) king = p
      if (p.side !== side) enemies.push(p)
    }
  }

  if (!king) return true

  for (const enemy of enemies) {
    if (isValidMove(enemy, king.x, king.y, board)) return true
  }

  return false
}

export function getValidMovesForPiece(piece: Piece, board: Board): { x: number; y: number }[] {
  const moves: { x: number; y: number }[] = []
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (isValidMove(piece, x, y, board)) {
        moves.push({ x, y })
      }
    }
  }
  return moves
}
