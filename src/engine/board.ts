import type { Piece, Board, Side } from '../types/chess'
import { BOARD_WIDTH, BOARD_HEIGHT } from '../types/chess'

function createPiece(
  id: string,
  type: Piece['type'],
  side: Side,
  x: number,
  y: number,
): Piece {
  return { id, type, side, x, y, alive: true }
}

export function createInitialPieces(): Piece[] {
  const pieces: Piece[] = []
  let id = 0
  const next = () => String(id++)

  // Black side (top, y=0~2)
  pieces.push(createPiece(next(), 'ju', 'black', 0, 0))
  pieces.push(createPiece(next(), 'ma', 'black', 1, 0))
  pieces.push(createPiece(next(), 'xiang', 'black', 2, 0))
  pieces.push(createPiece(next(), 'shi', 'black', 3, 0))
  pieces.push(createPiece(next(), 'jiang', 'black', 4, 0))
  pieces.push(createPiece(next(), 'shi', 'black', 5, 0))
  pieces.push(createPiece(next(), 'xiang', 'black', 6, 0))
  pieces.push(createPiece(next(), 'ma', 'black', 7, 0))
  pieces.push(createPiece(next(), 'ju', 'black', 8, 0))
  pieces.push(createPiece(next(), 'pao', 'black', 1, 2))
  pieces.push(createPiece(next(), 'pao', 'black', 7, 2))
  for (let i = 0; i < 5; i++) {
    pieces.push(createPiece(next(), 'bing', 'black', i * 2, 3))
  }

  // Red side (bottom, y=7~9)
  pieces.push(createPiece(next(), 'ju', 'red', 0, 9))
  pieces.push(createPiece(next(), 'ma', 'red', 1, 9))
  pieces.push(createPiece(next(), 'xiang', 'red', 2, 9))
  pieces.push(createPiece(next(), 'shi', 'red', 3, 9))
  pieces.push(createPiece(next(), 'jiang', 'red', 4, 9))
  pieces.push(createPiece(next(), 'shi', 'red', 5, 9))
  pieces.push(createPiece(next(), 'xiang', 'red', 6, 9))
  pieces.push(createPiece(next(), 'ma', 'red', 7, 9))
  pieces.push(createPiece(next(), 'ju', 'red', 8, 9))
  pieces.push(createPiece(next(), 'pao', 'red', 1, 7))
  pieces.push(createPiece(next(), 'pao', 'red', 7, 7))
  for (let i = 0; i < 5; i++) {
    pieces.push(createPiece(next(), 'bing', 'red', i * 2, 6))
  }

  return pieces
}

export function buildBoard(pieces: Piece[]): Board {
  const board: Board = Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null),
  )
  for (const p of pieces) {
    if (p.alive) {
      board[p.y][p.x] = p
    }
  }
  return board
}

export function getPieceAt(board: Board, x: number, y: number): Piece | null {
  if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) return null
  return board[y][x]
}

export function isInBoard(x: number, y: number): boolean {
  return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT
}

export function findKing(pieces: Piece[], side: Side): Piece | undefined {
  return pieces.find((p) => p.type === 'jiang' && p.side === side && p.alive)
}

export function clonePieces(pieces: Piece[]): Piece[] {
  return pieces.map((p) => ({ ...p }))
}
