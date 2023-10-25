import { BinaryBoard, BinaryPiece, MoveResult, black, boardState, getPiece, getSpecificPiece, isWhite, king, move, pawn, white } from "./binaryBoard"
import { getAllPossibleMoves, getMovesTowards, getPossibleMoves, getTravelPath } from "./moves"
import { isOutsideBoard } from "./pieceMoves"
import { Pos } from "./utils"


export let movingPiece: BinaryPiece
export let captured: BinaryPiece | null = null

export type PieceType =
    'p' | 'r' | 'n' | 'b' | 'q' | 'k' |
    'P' | 'R' | 'N' | 'B' | 'Q' | 'K'

export class Move {
    from: Pos
    to: Pos
    constructor(from: Pos|string, to: Pos|string) {
        if (typeof from === 'string') {
            from = Pos.parse(from)
        }
        if (typeof to === 'string') {
            to = Pos.parse(to)
        }
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

// TODO: unit tests
export const isKingMovingThroughCheck = (state: BinaryBoard, color: number, castlingSide: string): boolean => {
    const from = getSpecificPiece(state, king | color)
    let castlingStep = 0
    switch (castlingSide) {
        case 'k':
        case 'K': castlingStep = 2; break
        case 'q':
        case 'Q': castlingStep = -3; break
    }
    const to = new Pos(from.x + castlingStep, from.y)
    const path = getTravelPath(from, to, king)
    // check if king is moving through check
    for (let i = 1; i < path.length-1; i++) {
        const pos = path[i]
        if (isOutsideBoard(pos)) continue
        // check that the path between from and to is not blocked by another piece
        if (getPiece(state, pos) != null) return true

        const possibleMoves = getMovesTowards(state, pos, color, king)
        if (possibleMoves.length > 0) {
            return true
        }
    }
    return false
}

// TODO: unit tests
export const isKingInCheck = (state: BinaryBoard, color: number): boolean => {
    const kingPos = getSpecificPiece(state, king | color)
    const possibleMoves = getMovesTowards(state, kingPos, color)
    return possibleMoves.length > 0
}

export const isCheck = (state: BinaryBoard): { check: Pos[], end?: { mate: boolean, pos: Pos } } => {
    let res = []
    let kingPos = getSpecificPiece(state, white | king)
    let possibleMoves = getMovesTowards(state, kingPos, white)
    if (possibleMoves.length > 0) {
        res.push(kingPos)
    }
    kingPos = getSpecificPiece(state, king | black)
    possibleMoves = getMovesTowards(state, kingPos, black)
    if (possibleMoves.length > 0) {
        res.push(kingPos)
    }
    const mate = getAllPossibleMoves(state, state.currentPlayer)
    if (mate.length == 0) {
        kingPos = getSpecificPiece(state, state.currentPlayer | king)
        return { check: res, end: { mate: true, pos: kingPos } }
    }

    return { check: res }
}

export const gameValidMove = (state: BinaryBoard, from: Pos, to: Pos): boolean => {
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

export const gameMovePiece = (from: Pos, to: Pos): MoveResult => {
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

    const { check, end } = isCheck(boardState)
    if (end) {
        console.log(end.mate ? 'Checkmate' : 'Stalemate')
        boardState.checkmateObservers.forEach((callback) => {
            callback();
        });
    }

    movingPiece = null
    return results
}