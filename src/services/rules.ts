import { FEN, getKing, getPiece, getRank, movePiece } from "./FEN"
import { getBishopMoves, getKingMoves, getKnightMoves, getPawnMoves, getQueenMoves, getRookMoves } from "./pieceMoves"
import { Pos } from "./utils"

export let boardState: FEN
export let movingPiece: Piece

export type Color = 'white' | 'black'
export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k'

export class Move {
    
    from: Pos
    to: Pos
    constructor(from: Pos, to: Pos) {
        this.from = from
        this.to = to
    }
    toString() {
        return `${this.from.toString()} -> ${this.to.toString()}`
    }
    clone(): Move {
        return new Move(this.from.clone(), this.to.clone())
    }
}
export type Piece = {
    color: Color
    type: PieceType
    pos: Pos
}

export const startMoving = (pos: Pos) => {
    // record the piece that is being moved
    movingPiece = getPiece(boardState, pos)
}

export const isCheck = (state:FEN):Pos[] => {
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
    return []
}

export const resetBoard = () => {
    boardState = FEN.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
}

export const gameValidMove = (from: Pos, to: Pos): boolean => {
    // check if valid move for piece
    const state = boardState.clone()
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

const getPossibleMoves = (state:FEN, piece: Piece, kingCheck: boolean = true): Pos[] => {
    let pMoves = []
    switch (piece.type) {
        case 'p':
            pMoves = getPawnMoves(state, piece.color, piece.pos)
            break
        case 'r':
            pMoves = getRookMoves(state, piece.color, piece.pos)
            break
        case 'n':
            pMoves = getKnightMoves(state, piece.color, piece.pos)
            break
        case 'b':
            pMoves = getBishopMoves(state, piece.color, piece.pos)
            break
        case 'q':
            pMoves = getQueenMoves(state, piece.color, piece.pos)
            break
        case 'k':
            pMoves = getKingMoves(state, piece.color, piece.pos)
            break
    }
    // check that all moves returned do not put the king in check
    if (kingCheck) {
        const results = filterKingVulnerableMoves(state, piece, pMoves)
        pMoves = results.valid
    }
    return pMoves
}

export const filterKingVulnerableMoves = (state:FEN, piece: Piece, moves: Pos[]): { valid: Pos[], danger: any } => {
    const validMoves: Pos[] = []
    const dangerMoves: { from: Pos, to: Pos }[] = []
    for (const to of moves) {
        // put the board in a place when the move is made
        // then check if the king is in check
        // if it not, then the move is valid
        movePiece(state, piece.pos, to)

        // check if king is in check
        const kingPos = getKing(state, piece.color)
        const possibleMoves = getMovesTowards(state, kingPos)
        state.undo()
        if (possibleMoves.length > 0) {
            dangerMoves.push(...possibleMoves)
            continue
        }
        validMoves.push(to)
    }
    return { valid: validMoves, danger: dangerMoves }
}

export const getMovesTowards = (state:FEN, targetPos: Pos): Move[] => {
    // go through whole board and check valid moves against this position
    const color = getPiece(state, targetPos).color
    const moves: Move[] = []
    const ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    for (const rankSymbol of ranks) {
        const rank = getRank(state, rankSymbol)
        for (let x = 0; x < 8; x++) {
            const p = rank[x]
            if (isNaN(parseInt(p))) {
                // piece
                const piece: Piece = {
                    color: p === p.toUpperCase() ? 'white' : 'black',
                    type: p.toLowerCase() as PieceType,
                    pos: Pos.from(rankSymbol, x)
                }
                if (piece.color != color) {
                    let arr = getPossibleMoves(state, piece, false)
                    arr = arr.filter((pos) => pos.equals(targetPos))
                    arr.forEach((pos) => moves.push(new Move(piece.pos, pos)))
                }
            }
        }
    }
    return moves
}

export const getAllPossibleMovesForCurrentPlayer = (state:FEN): Move[] => {
    // PERF: can benefit from caching
    const moves: Move[] = []
    const ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    for (const rankSymbol of ranks) {
        const rank = getRank(state, rankSymbol)
        for (let x = 0; x < 8; x++) {
            const p = rank[x]
            if (!isNaN(parseInt(p))) continue

            // piece
            const piece: Piece = {
                color: p === p.toUpperCase() ? 'white' : 'black',
                type: p.toLowerCase() as PieceType,
                pos: Pos.from(rankSymbol, x)
            }
            if (piece.color !== state.currentPlayer) continue
            let arr = getPossibleMoves(state, piece, false)
            const results = filterKingVulnerableMoves(state, piece, arr)
            results.valid.forEach((pos) => moves.push(new Move(piece.pos, pos )))
        }
    }

    return moves
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
    console.log(`${color} move:`, from.toString(), '->', to.toString())
    console.log(boardState.toString())

    movingPiece = null
    return true
}