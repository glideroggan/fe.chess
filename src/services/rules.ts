import { BinaryBoard, BinaryPiece, black, getPiece, getSpecificPiece, isWhite, king, move, pawn, white } from "./binaryBoard"
import { getAllPossibleMoves, getMovesTowards, getPossibleMoves } from "./moves"
import { Pos } from "./utils"

export let boardState: BinaryBoard = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
export let movingPiece: BinaryPiece
export let captured:BinaryPiece | null = null

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
        kingPos = getSpecificPiece(state, state.currentPlayer | king)
        return {check: res, end: {mate: true, pos: kingPos}}
    }
    
    return {check: res}
}

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
    let results = move(boardState, from, to)
    captured = results.captured
    
    

    boardState.boardData._halfMoveClock++
    if (captured != null || results.pieceMoved.type == pawn) {
        boardState.boardData._halfMoveClock = 0
    }

    boardState.playerChangeObservers.forEach((callback) => {
        callback(boardState.currentPlayer);
    });
    console.log(`${isWhite(color) ? 'white' : 'black'} move:`, from.toString(), '->', to.toString())
    console.log(boardState.boardData.getFullBoard.toString())

    // TODO: do check and mate checks here instead
    const {check, end} = isCheck(boardState)
    if (end) {
        console.log(end.mate ? 'Checkmate' : 'Stalemate')
        boardState.checkmateObservers.forEach((callback) => {
            callback();
        });
    }

    movingPiece = null
    return true
}