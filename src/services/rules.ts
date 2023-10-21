import { FEN, getKing, getPiece, movePiece } from "./FEN"
import { translateToNumber } from "./ai"
import { getAllPossibleMoves, getMovesTowards, getPossibleMoves } from "./moves"
import { Pos } from "./utils"

export let boardState: FEN
export let movingPiece: Piece

// export type Color = 'white' | 'black'
export class Color {
    static black:Color = new Color(-1)
    static white:Color = new Color(1)
    
    static from(type: string): Color {
        return new Color(type == type.toUpperCase() ? 1 : -1)
    }
    constructor(num: number) {
        this.num = num
    }
    
    num: number
    toString() {
        return this.num == 1 ? 'white' : 'black'
    }
    equals(other: Color) {
        return this.num == other.num
    }
}
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
    color: Color
    type: PieceType
    num: number
    pos: Pos

    constructor(char: string, rank: number, file: number, color:Color) {
        this.type = char as PieceType
        this.num = translateToNumber(this.type)
        this.pos = new Pos(file, rank)
        this.color = color
    }

    static from(p: PieceType | string, pos: Pos) {
        return new Piece(p, pos.y, pos.x, Color.from(p))
    }
    // static fromChar(p:string, pos:Pos):Piece {
    //     return new Piece(p, pos.y, pos.x, Color.from(p))
    // }
}

export const startMoving = (pos: Pos) => {
    // record the piece that is being moved
    movingPiece = getPiece(boardState, pos)
}

export const isCheck = (state: FEN): {check:Pos[], end?:{mate:boolean,pos:Pos}} => {
    let res = []
    let kingPos = getKing(state, Color.white)
    let possibleMoves = getMovesTowards(state, kingPos)
    if (possibleMoves.length > 0) {
        res.push(kingPos)
    }
    kingPos = getKing(state, Color.black)
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
    if (toPiece != null && toPiece.color.equals(state.currentPlayer)) {
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