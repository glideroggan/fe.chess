import { loopThroughBoard } from "./ai";
import { BinaryBoard, BinaryPiece, getSpecificPiece, king, knight, move, undo, whatType } from "./binaryBoard";
import { getKey } from "./perf";
import { getBishopMoves, getKingMoves, getKnightMoves, getPawnMoves, getQueenMoves, getRookMoves } from "./pieceMoves";
import { Move } from "./rules";
import { Pos } from "./utils";

class HashTable<T> {
    entry: Map<string, T> = new Map<string, T>()
    hit: number = 0
}
export const getPossibleMovesCache: HashTable<Pos[]> = new HashTable<Pos[]>()
export const getMovesTowardsCache: HashTable<Move[]> = new HashTable<Move[]>()
export const allPossibleMoveCache: HashTable<Move[]> = new HashTable<Move[]>()

export const getAllPossibleMoves = (state: BinaryBoard, color: number): Move[] => {
    // PERF: can benefit from caching, need to test
    // we don't need to cache the whole thing, just the board, whose turn it is
    // and what kind of special moves are available
    // this way we should be able to get more cache hits
    const cacheKey = getKey(state.boardData.getBoard, color.toString())
    const cached = allPossibleMoveCache.entry.get(cacheKey)
    if (cached !== undefined) {
        // console.log('getAllPossibleMoves-cache hit: ', cached.hit)
        allPossibleMoveCache.hit++
        return cached
    }

    const moves: Move[] = []
    loopThroughBoard(state, (piece: BinaryPiece) => {
        if (piece.color != color) return

        let arr = getPossibleMoves(state, piece, false)
        const results = filterKingVulnerableMoves(state, piece, arr)
        results.valid.forEach((pos) => moves.push(new Move(piece.pos, pos)))
    })

    allPossibleMoveCache.entry.set(cacheKey, moves)
    return moves
}

const getMovesMap: { [key: number]: (state: BinaryBoard, color: number, pos: Pos) => Pos[] } = {
    1: getKingMoves,
    2: getQueenMoves,
    4: getBishopMoves,
    8: getKnightMoves,
    16: getRookMoves,
    32: getPawnMoves,
}

export const getPossibleMoves = (state: BinaryBoard, piece: BinaryPiece, kingCheck: boolean = true): Pos[] => {
    const cacheKey = getKey(state.boardData.getBoard, 
        piece.typeAndColor.toString(), piece.pos.toString(), kingCheck ? 'check' : 'nocheck')
    const cached = getPossibleMovesCache.entry.get(cacheKey)
    if (cached !== undefined) {
        getPossibleMovesCache.hit++
        return cached
    }

    // guard
    if (piece.type === 0) throw new Error('Cant get moves for empty piece')
    
    const f = getMovesMap[piece.type]
    let pMoves: Pos[] = f(state, piece.color, piece.pos)
    
    // check that all moves returned do not put the king in check
    if (kingCheck) {
        const results = filterKingVulnerableMoves(state, piece, pMoves)
        pMoves = results.valid
    }
    getPossibleMovesCache.entry.set(cacheKey, pMoves)
    return pMoves
}

export const getMovesTowards = (state: BinaryBoard, targetPos: Pos, sameColor: number, filter?:number): Move[] => {
    // PERF: getBoard is expensive, so maybe not worth it, unless we get that part less expensive
    const cacheKey = getKey(state.boardData.getBoard, targetPos.toString(), sameColor.toString(), filter?.toString())
    const cached = getMovesTowardsCache.entry.get(cacheKey)
    if (cached !== undefined) {
        getMovesTowardsCache.hit++
        return cached
    }
    // go through whole board and check valid moves against this position
    const moves: Move[] = []
    // PERF: a fast way here could be to first get remaining pieces of the color
    // then loop through those
    loopThroughBoard(state, (piece: BinaryPiece) => {
        if (piece.color === sameColor) return
        // use the filter to filter out pieces of type and color
        if (filter !== undefined && piece.type == filter) return

        let arr = getPossibleMoves(state, piece, false)
        arr.filter((pos) => pos.equals(targetPos))
            .forEach((pos) => moves.push(new Move(piece.pos, pos)))
    })
    
    getMovesTowardsCache.entry.set(cacheKey, moves)
    return moves
}

export const filterKingVulnerableMoves = (state: BinaryBoard, piece: BinaryPiece, moves: Pos[]): { valid: Pos[], danger: any } => {
    const validMoves: Pos[] = []
    const dangerMoves: { from: Pos, to: Pos }[] = []
    for (const to of moves) {
        // put the board in a place when the move is made
        // then check if the king is in check
        // if it not, then the move is valid
        move(state, piece.pos, to)

        // check if king is in check
        const kingPos = getSpecificPiece(state, king | piece.color)
        const possibleMoves = getMovesTowards(state, kingPos, piece.color)
        undo(state)
        if (possibleMoves.length > 0) {
            dangerMoves.push(...possibleMoves)
            continue
        }
        validMoves.push(to)
    }
    return { valid: validMoves, danger: dangerMoves }
}

export const getMoves = (fenState: BinaryBoard, piece: BinaryPiece, kingCheck: boolean = true): Pos[] => {
    return getMovesMap[whatType(piece.type)](fenState, piece.color, piece.pos)
}

export const getTravelPath = (from: Pos, to: Pos, type:number): Pos[] => {
    if (type === knight) return [from, to]

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