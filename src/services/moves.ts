import { FEN, getKing, getPiece, getRank, movePiece } from "./FEN";
import { loopThroughBoard } from "./ai";
import { getKey } from "./perf";
import { getBishopMoves, getKingMoves, getKnightMoves, getPawnMoves, getQueenMoves, getRookMoves } from "./pieceMoves";
import { Move, Piece, PieceType } from "./rules";
import { Pos } from "./utils";

class HashTable<T> {
    entry: Map<string, T> = new Map<string, T>()
    hit: number = 0
}
export const getPossibleMovesCache: HashTable<Pos[]> = new HashTable<Pos[]>()
export const getMovesTowardsCache: HashTable<Move[]> = new HashTable<Move[]>()
export const allPossibleMoveCache: HashTable<Move[]> = new HashTable<Move[]>()

export const getAllPossibleMoves = (state: FEN, color: string): Move[] => {
    // PERF: can benefit from caching, need to test
    // we don't need to cache the whole thing, just the board, whose turn it is
    // and what kind of special moves are available
    // this way we should be able to get more cache hits
    const cacheKey = getKey(state.current.split(' ')[0].toString(), color)
    const cached = allPossibleMoveCache.entry.get(cacheKey)
    if (cached !== undefined) {
        // console.log('getAllPossibleMoves-cache hit: ', cached.hit)
        allPossibleMoveCache.hit++
        return cached
    }

    const moves: Move[] = []
    loopThroughBoard(state, (piece: Piece) => {
        if (piece.color != color) return

        let arr = getPossibleMoves(state, piece, false)
        const results = filterKingVulnerableMoves(state, piece, arr)
        results.valid.forEach((pos) => moves.push(new Move(piece.pos, pos)))
    })

    allPossibleMoveCache.entry.set(cacheKey, moves)
    return moves
}

export const getPossibleMoves = (state: FEN, piece: Piece, kingCheck: boolean = true): Pos[] => {
    const cacheKey = getKey(state.current.split(' ')[0].toString(), 
        piece.color, piece.type, piece.pos.toString(), kingCheck ? 'check' : 'nocheck')
    const cached = getPossibleMovesCache.entry.get(cacheKey)
    if (cached !== undefined) {
        getPossibleMovesCache.hit++
        return cached
    }
    let pMoves: Pos[] = []
    switch (piece.type.toLowerCase()) {
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
        default:
            throw new Error(`Unknown piece type '${piece.type}'`)
    }
    // check that all moves returned do not put the king in check
    if (kingCheck) {
        const results = filterKingVulnerableMoves(state, piece, pMoves)
        pMoves = results.valid
    }
    getPossibleMovesCache.entry.set(cacheKey, pMoves)
    return pMoves
}

export const getMovesTowards = (state: FEN, targetPos: Pos): Move[] => {
    const cacheKey = getKey(state.current.split(' ')[0].toString(), targetPos.toString())
    const cached = getMovesTowardsCache.entry.get(cacheKey)
    if (cached !== undefined) {
        getMovesTowardsCache.hit++
        return cached
    }
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
    getMovesTowardsCache.entry.set(cacheKey, moves)
    return moves
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

export const getMoves = (fenState: FEN, piece: Piece, kingCheck: boolean = true): Pos[] => {
    switch (piece.type.toLowerCase()) {
        case "p":
            return getPawnMoves(fenState, piece.color, piece.pos)
        case "n":
            return getKnightMoves(fenState, piece.color, piece.pos)
        case "r":
            return getRookMoves(fenState, piece.color, piece.pos)
        case "b":
            return getBishopMoves(fenState, piece.color, piece.pos)
        case "q":
            return getQueenMoves(fenState, piece.color, piece.pos)
        case "k":
            return getKingMoves(fenState, piece.color, piece.pos)
    }
    throw new Error(`Unknown piece type '${piece.type}'`)
}

export const getTravelPath = (state:FEN, from: Pos, to: Pos): Pos[] => {
    if (getPiece(state, to).type === 'n') {
        return [from, to]
    }
    const dx = Math.sign(to.x - from.x)
    const dy = Math.sign(to.y - from.y)
    const path: Pos[] = [from]

    let x = from.x + dx
    let y = from.y + dy

    while (x != to.x || y != to.y) {
        path.push(new Pos(x, y))
        x += dx
        y += dy
    }
    path.push(to)

    return path
}