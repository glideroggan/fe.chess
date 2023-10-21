import { FEN, getPiece, getRank } from "./FEN"
import { bishop, king, knight, pawn, queen, rook } from "./ai"
import { Color } from "./rules"
import { Pos } from "./utils"

type PieceMove = {
    forward?: number
    file?: number
    attackMove?: boolean
    continously?: boolean
    jump?: boolean
    startMove?: boolean
}

const kingMoves: PieceMove[] = [
    { forward: 1, file: 0, attackMove: true },
    { forward: 1, file: 1, attackMove: true },
    { forward: 0, file: 1, attackMove: true },
    { forward: -1, file: 1, attackMove: true },
    { forward: -1, file: 0, attackMove: true },
    { forward: -1, file: -1, attackMove: true },
    { forward: 0, file: -1, attackMove: true },
    { forward: 1, file: -1, attackMove: true },
]
const queenMoves: PieceMove[] = [
    { forward: 1, file: 1, attackMove: true, continously: true },
    { forward: 1, file: -1, attackMove: true, continously: true },
    { forward: -1, file: 1, attackMove: true, continously: true },
    { forward: -1, file: -1, attackMove: true, continously: true },
    { forward: -1, file: 0, attackMove: true, continously: true },
    { forward: 1, file: 0, attackMove: true, continously: true },
    { forward: 0, file: 1, attackMove: true, continously: true },
    { forward: 0, file: -1, attackMove: true, continously: true },
]
const bishopMoves: PieceMove[] = [
    { forward: 1, file: 1, attackMove: true, continously: true },
    { forward: 1, file: -1, attackMove: true, continously: true },
    { forward: -1, file: 1, attackMove: true, continously: true },
    { forward: -1, file: -1, attackMove: true, continously: true },
]
const knightMoves: PieceMove[] = [
    { forward: 2, file: -1, attackMove: true, jump: true },
    { forward: 2, file: 1, attackMove: true, jump: true },
    { forward: -2, file: -1, attackMove: true, jump: true },
    { forward: -2, file: 1, attackMove: true, jump: true },
    { forward: 1, file: -2, attackMove: true, jump: true },
    { forward: -1, file: -2, attackMove: true, jump: true },
    { forward: 1, file: 2, attackMove: true, jump: true },
    { forward: -1, file: 2, attackMove: true, jump: true },
]
const rookMoves: PieceMove[] = [
    { forward: -1, attackMove: true, continously: true },
    { forward: 1, attackMove: true, continously: true },
    { file: 1, attackMove: true, continously: true },
    { file: -1, attackMove: true, continously: true },
]
const pawnMoves: PieceMove[] = [
    { forward: 1, file: 0, attackMove: false },
    { forward: 2, file: 0, attackMove: false, startMove: true },
    { forward: 1, file: -1, attackMove: true },
    { forward: 1, file: 1, attackMove: true }]
export const getKingMoves = (state: FEN, color: Color, pos: Pos): Pos[] => {
    if (getPiece(state, pos).num != king) throw new Error('Not a king')
    let moves: Pos[] = []
    
    for (const move of kingMoves) {
        const newPos = pos.add(move.forward, move.file)
        if (isOutsideBoard(newPos)) continue
        const piece = getPiece(state, newPos)
        if (piece == null || (move.attackMove && piece.color != color)) {
            moves.push(newPos)
        }
    }
    return moves
}

export const getQueenMoves = (state: FEN, color: Color, pos: Pos): Pos[] => {
    if (getPiece(state, pos).num != queen) throw new Error('Not a queen')
    let moves: Pos[] = []
    for (const move of queenMoves) {
        if (move.continously) {
            let step = 1
            let newPos = pos.add(move.forward, move.file)
            if (isOutsideBoard(newPos)) continue
            let piece = getPiece(state, newPos)
            while (piece == null) {
                moves.push(newPos)
                step++
                newPos = pos.add(move.forward * step, move.file * step)
                if (isOutsideBoard(newPos)) break
                piece = getPiece(state, newPos)
            }
            if (piece == null) continue
            if (move.attackMove && piece.color != color) {
                moves.push(newPos)
            }
        }
    }
    return moves
}

export const getBishopMoves = (state: FEN, color: Color, pos: Pos): Pos[] => {
    if (getPiece(state, pos).num != bishop) throw new Error('Not a bishop')
    let moves: Pos[] = []
    
    for (const move of bishopMoves) {
        if (move.continously) {
            let step = 1
            let newPos = pos.add(move.forward, move.file)
            if (isOutsideBoard(newPos)) continue
            let piece = getPiece(state, newPos)
            while (piece == null) {
                moves.push(newPos)
                step++
                newPos = pos.add(move.forward * step, move.file * step)
                if (isOutsideBoard(newPos)) break
                piece = getPiece(state, newPos)
            }
            if (piece == null) continue

            if (move.attackMove && piece.color != color) {
                moves.push(newPos)
            }
        }
    }
    return moves
}

export const getKnightMoves = (state: FEN, color: Color, pos: Pos): Pos[] => {
    if (getPiece(state, pos).num != knight) throw new Error(`Not a knight in ${pos.toString()}`)
    let moves: Pos[] = []
    
    for (const move of knightMoves) {
        const newPos = pos.add(move.forward, move.file)
        if (isOutsideBoard(newPos)) continue
        const piece = getPiece(state, newPos)
        if (piece == null || (move.attackMove && piece.color != color)) {
            moves.push(newPos)
        }
    }
    return moves
}

export const getRookMoves = (state: FEN, color: Color, pos: Pos): Pos[] => {
    if (getPiece(state, pos).num != rook) throw new Error('Not a rook')
    let moves: Pos[] = []
    
    for (const move of rookMoves) {
        const forward = color == Color.white ? move.forward : -move.forward
        if (move.continously) {
            let step = 1
            if (move.forward != null) {
                let newPos = pos.add(forward * step, 0)
                if (isOutsideBoard(newPos)) continue
                let piece = getPiece(state, newPos)
                while (piece == null) {
                    moves.push(newPos)
                    step++
                    newPos = pos.add(forward * step, 0)
                    // newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + forward * step), pos.file)
                    if (isOutsideBoard(newPos)) break
                    piece = getPiece(state, newPos)
                }
                if (piece == null) continue
                if (move.attackMove && piece.color != color) {
                    moves.push(newPos)
                }
                continue
            }
            if (move.file != null) {
                let newPos = pos.add(0, move.file * step)
                // let newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0)), pos.file + move.file)
                if (isOutsideBoard(newPos)) continue
                let piece = getPiece(state, newPos)
                while (piece == null) {
                    moves.push(newPos)
                    step++
                    newPos = pos.add(0, move.file * step)
                    // newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0)), pos.file + move.file * step)
                    if (isOutsideBoard(newPos)) break
                    piece = getPiece(state, newPos)
                }
                if (piece == null) continue
                if (move.attackMove && piece.color != color) {
                    moves.push(newPos)
                }
                continue
            }
        }
    }
    // console.log('moves rook', moves.length)
    return moves;
}

export const isOutsideBoard = (pos: Pos): boolean => {
    return !(pos.x <= 7 && pos.x >= 0 && pos.y <= 7 && pos.y >= 0)
}


export const getPawnMoves = (state: FEN, color: Color, pos: Pos): Pos[] => {
    // guard: no need really, and should only be used for debugging
    // const p = getPiece(state, pos)
    // if (p == null) {
    //     throw new Error(`No pawn at position: ${pos.toString()}, rank '${getRank(state, pos.rank)}'`)
    // }
    if (getPiece(state, pos).num != pawn) throw new Error('Not a pawn')

    // PERF: maybe small perf gain by caching only the range of the board that the pawn is using
    // this way we would be able to return the cached moves if the pawn is in the same position
    let moves: Pos[] = []
    // TODO: we should look if we can make the "forward" not be specific to color
    for (const move of pawnMoves) {
        const forward = color == Color.white ? move.forward : -move.forward
        const newPos = pos.add(forward, move.file)
        if (isOutsideBoard(newPos)) continue

        const piece = getPiece(state, newPos)
        if (move.attackMove) {
            if (piece != null && piece.color != color) {
                moves.push(newPos)
            }
        } else if (piece == null) {
            if (move.startMove) {
                if (pos.rank == 'b') {
                    // no jumps allowed
                    const p = getPiece(state, pos.add(1, 0))
                    if (p == null) {
                        moves.push(newPos)
                    }
                } else if (pos.rank == 'g') {
                    const p = getPiece(state, pos.add(-1, 0))
                    if (p == null) {
                        moves.push(newPos)
                    }
                }
            } else {
                moves.push(newPos)
            }
        }
    }
    return moves
}