import { FEN } from "./FEN"
import { getPawnMoves } from "./pieceMoves"
import { FenPos } from "./utils"

export let boardState:FEN
export let movingPiece:Piece
export let lastMove:Piece

export type Color = 'white' | 'black'
export type PieceType = 'p' | 'r' | 'k' | 'b' | 'q' | 'k'

export type Piece = {
    color: Color
    type: PieceType
    pos: FenPos
}

export const startMoving = (pos: FenPos) => {
    // record the piece that is being moved
    movingPiece = boardState.getPiece(pos)
}

export const resetBoard = () => {
    boardState = FEN.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
}

export const validMove = (from: FenPos, to: FenPos): boolean => {
    // check if valid move for piece
    console.log('validMove', from.toString(),'->', to.toString())
    const piece = boardState.getPiece(from)
    // console.log(piece)
    if (piece != null) {
        const arr = getPossibleMoves(piece)
        if (arr.find((pos) => pos.equals(to))) {
            return true
        }
    }
    // check that we're not breaking chess rule (leaving king vulnerable)
    return false
}

const getPossibleMoves = (piece:Piece):FenPos[] => {
    const pMoves = []
    switch (piece.type) {
        case 'p':
            return getPawnMoves(piece.color, piece.pos)
    }
    // TODO: before leaving here, we should check that this new state doesn't
    // put the king in check
}


export const movePiece = (from: FenPos, to: FenPos): boolean => {
    // update board state
    if (!validMove(from, to)) {
        lastMove = null
        movingPiece = null
        return false
    } 

    boardState.move(from, to)
    console.log(boardState.toString())

    lastMove = movingPiece
    movingPiece = null
    return true
}