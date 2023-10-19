import { FEN, getKing, getPiece, getRank, movePiece } from "./FEN"
import { loopThroughBoard } from "./ai"
import { getBishopMoves, getKingMoves, getKnightMoves, getPawnMoves, getQueenMoves, getRookMoves } from "./pieceMoves"
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

const getPossibleMoves = (state: FEN, piece: Piece, kingCheck: boolean = true): Pos[] => {
    let pMoves: Pos[] = []
    switch (piece.type) {
        case 'p':
        case 'P':
            pMoves = getPawnMoves(state, piece.color, piece.pos)
            break
        case 'r':
        case 'R':
            pMoves = getRookMoves(state, piece.color, piece.pos)
            break
        case 'n':
        case 'N':
            pMoves = getKnightMoves(state, piece.color, piece.pos)
            break
        case 'b':
        case 'B':
            pMoves = getBishopMoves(state, piece.color, piece.pos)
            break
        case 'q':
        case 'Q':
            pMoves = getQueenMoves(state, piece.color, piece.pos)
            break
        case 'k':
        case 'K':
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

export const filterKingVulnerableMoves = (state: FEN, piece: Piece, moves: Pos[]): { valid: Pos[], danger: any } => {
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

export const getMovesTowards = (state: FEN, targetPos: Pos): Move[] => {
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
interface HashTable<T> {
    [key: string]: T
}
const getKey = (state: FEN, color: string) => {
    return `${state.current.split(' ')[0].toString()}${color}`
}
const cache: HashTable<Move[]> = {}
export const getAllPossibleMoves = (state: FEN, color: string): Move[] => {
    // PERF: can benefit from caching, need to test
    // we don't need to cache the whole thing, just the board, whose turn it is
    // and what kind of special moves are available
    // this way we should be able to get more cache hits
    const cached = cache[getKey(state, color)]
    if (cached != null) {
        console.log(`cache hit: ${cached.length}`)
        return cached
    }

    const moves: Move[] = []
    loopThroughBoard(state, (piece: Piece) => {
        if (piece.color != color) return

        let arr = getPossibleMoves(state, piece, false)
        const results = filterKingVulnerableMoves(state, piece, arr)
        results.valid.forEach((pos) => moves.push(new Move(piece.pos, pos)))
    })

    cache[getKey(state, color)] = moves
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