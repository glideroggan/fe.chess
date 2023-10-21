import { getSpecificPiece, getPiece } from "./FEN"
import { BinaryBoard, BinaryPiece, black, isWhite, king, move, white } from "./binaryBoard"
import { getAllPossibleMoves, getMovesTowards, getPossibleMoves } from "./moves"
import { Pos } from "./utils"

export let boardState: BinaryBoard = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
export let movingPiece: BinaryPiece
export let captured:BinaryPiece | null = null

// export type Color = 'white' | 'black'
// export class Color {
//     static black:Color = new Color(-1)
//     static white:Color = new Color(1)
//     binary: number
    
//     static from(type: string): Color {
//         return new Color(type == type.toUpperCase() ? 1 : -1)
//     }
//     private constructor(num: number) {
//         this.num = num
//         this.binary = num == 1 ? 0b0001000000 : 0b0010000000
//     }
    
//     num: number
//     toString() {
//         return this.num == 1 ? 'white' : 'black'
//     }
//     equals(other: Color) {
//         return this.num == other.num
//     }
// }
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
// export class Piece {
//     color: Color
//     type: PieceType
//     num: number
//     pos: Pos

//     constructor(char: string, rank: number, file: number, color:Color) {
//         this.type = char as PieceType
//         this.num = translateToNumber(this.type)
//         this.pos = new Pos(file, rank)
//         this.color = color
//     }

//     static fromBinary(p:number, pos: Pos):Piece {
//         const color = p & white ? Color.white : Color.black
//         const type = translateToPiece(p, color)
//         return new Piece(type, pos.y, pos.x, color)
//     }
//     static from(p: PieceType | string, pos: Pos) {
//         return new Piece(p, pos.y, pos.x, Color.from(p))
//     }
// }

export const startMoving = (pos: Pos) => {
    // record the piece that is being moved
    movingPiece = getPiece(boardState, pos)
}

export const isCheck = (state: BinaryBoard): {check:Pos[], end?:{mate:boolean,pos:Pos}} => {
    let res = []
    let kingPos = getSpecificPiece(state, white | king)
    let possibleMoves = getMovesTowards(state, kingPos)
    if (possibleMoves.length > 0) {
        res.push(kingPos)
    }
    kingPos = getSpecificPiece(state, king | black)
    possibleMoves = getMovesTowards(state, kingPos)
    if (possibleMoves.length > 0) {
        res.push(kingPos)
    }
    const mate = getAllPossibleMoves(state, state.currentPlayer)
    if (mate.length == 0) {
        kingPos = getSpecificPiece(state, state.currentPlayer)
        return {check: res, end: {mate: true, pos: kingPos}}
    }
    
    return {check: res}
}

// export const resetBoard = () => {
//     boardState = FEN.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
// }

export const gameValidMove = (state:BinaryBoard, from: Pos, to: Pos): boolean => {
    // check if valid move for piece
    // const copy = state.clone()
    const copy = state
    const toPiece = getPiece(copy, to)
    if (toPiece != null && toPiece.color == copy.currentPlayer) {
        return false
    }
    const piece = getPiece(copy, from)
    if (piece != null) {
        const arr = getPossibleMoves(copy, piece)
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
    captured = move(boardState, from, to)

    boardState.playerChangeObservers.forEach((callback) => {
        callback(boardState.currentPlayer);
    });
    // TODO: maybe wrap this in a nice UI instead
    console.log(`${isWhite(color) ? 'white' : 'black'} move:`, from.toString(), '->', to.toString())
    console.log(boardState.boardData.getFullBoard.toString())

    movingPiece = null
    return true
}