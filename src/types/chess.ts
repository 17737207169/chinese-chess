export type PieceType = 'jiang' | 'shi' | 'xiang' | 'ma' | 'ju' | 'pao' | 'bing'

export type Side = 'red' | 'black'

export interface Position {
  x: number
  y: number
}

export interface Piece {
  id: string
  type: PieceType
  side: Side
  x: number
  y: number
  alive: boolean
}

export interface Move {
  piece: Piece
  fromX: number
  fromY: number
  toX: number
  toY: number
  captured?: Piece
}

export type GameMode = 'pvp' | 'pve'

export type GameStatus = 'menu' | 'playing' | 'check' | 'checkmate' | 'stalemate'

export type Board = (Piece | null)[][]

export const BOARD_WIDTH = 9
export const BOARD_HEIGHT = 10

export const PIECE_NAMES: Record<PieceType, Record<Side, string>> = {
  jiang: { red: '帅', black: '将' },
  shi: { red: '仕', black: '士' },
  xiang: { red: '相', black: '象' },
  ma: { red: '马', black: '马' },
  ju: { red: '车', black: '車' },
  pao: { red: '炮', black: '砲' },
  bing: { red: '兵', black: '卒' },
}
