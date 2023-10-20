import { FEN, getKing, getPiece, movePiece } from "./FEN"
import { getAllPossibleMoves, getMovesTowards, getPossibleMoves } from "./moves"
import { Pos } from "./utils"

export let boardState: FEN
export let movingPiece: Piece

export type Color = 'white' | 'black'
export type PieceType =
    'p' | 'r' | 'n' | 'b' | 'q' | 'k' |
    'P' | 'R' | 'N' | 'B' | 'Q' | 'K'

export class Move {
    from: Pos
    to: Pos
    constructor(from: Pos, to: Pos) {
        this.from = from
        this.to = to
    }
    toString() {
        return `${this.from.toString()}->${this.to.toString()}`
    }
    clone(): Move {
        return new Move(this.from.clone(), this.to.clone())
    }
}
export class Piece {

    type: PieceType
    pos: Pos

    constructor(char: string, rank: number, file: number) {
        this.type = char as PieceType
        this.pos = new Pos(file, rank)
    }

    static from(p: PieceType, pos: Pos) {
        return new Piece(p, pos.y, pos.x)
    }

    get color(): Color {
        return this.type == this.type.toUpperCase() ? 'white' : 'black'
    }
}

export const startMoving = (pos: Pos) => {
    // record the piece that is being moved
    movingPiece = getPiece(boardState, pos)
}

export const isCheck = (state: FEN): {check:Pos[], end?:{mate:boolean,pos:Pos}} => {
    let res = []
    let kingPos = getKing(state, 'white')
    let possibleMoves = getMovesTowards(state, kingPos)
    if (possibleMoves.length > 0) {
        res.push(kingPos)
    }
    kingPos = getKing(state, 'black')
    possibleMoves = getMovesTowards(state, kingPos)
    if (possibleMoves.length > 0) {
        res.push(kingPos)
    }
    const mate = getAllPossibleMoves(state, state.currentPlayer)
    if (mate.length == 0) {
        kingPos = getKing(state, state.currentPlayer)
        state.checkMate()
        return {check: res, end: {mate: true, pos: kingPos}}
    }
    
    return {check: res}
}

export const resetBoard = () => {
    boardState = FEN.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
}

export const gameValidMove = (state:FEN, from: Pos, to: Pos): boolean => {
    // check if valid move for piece
    // const state = boardState.clone()
    const toPiece = getPiece(state, to)
    if (toPiece != null && toPiece.color === state.currentPlayer) {
        return false
    }
    const piece = getPiece(state, from)
    if (piece != null) {
        const arr = getPossibleMoves(state, piece)
        if (arr.find((pos) => pos.equals(to))) {
            return true
        }
    }
    return false
}

export const gameMovePiece = (from: Pos, to: Pos): boolean => {
    boardState.stateChangeObservers.forEach((callback) => {
        callback();
    })
    const color = boardState.currentPlayer
    movePiece(boardState, from, to)

    boardState.playerChangeObservers.forEach((callback) => {
        callback(boardState.currentPlayer);
    });
    // TODO: maybe wrap this in a nice UI instead
    console.log(`${color} move:`, from.toString(), '->', to.toString())
    console.log(boardState.toString())

    movingPiece = null
    return true
}