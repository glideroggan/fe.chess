import { BinaryBoard, bishop, getPiece, king, knight, pawn, queen, rook, white } from "./binaryBoard"
import { getTravelPath } from "./moves"
import { isKingMovingThroughCheck } from "./rules"
import { Pos } from "./utils"

type PieceMove = {
    forward?: number
    file?: number
    attackMove?: boolean
    continously?: boolean
    jump?: boolean
    startMove?: boolean
    castling?: 'kingside' | 'queenside'
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


export const getKingMoves = (state: BinaryBoard, color: number, pos: Pos): Pos[] => {
    if (getPiece(state, pos).type != king) throw new Error('Not a king')
    let moves: Pos[] = []

    for (const move of kingMoves) {
        const newPos = pos.add(move.forward, move.file)
        if (isOutsideBoard(newPos)) continue
        const otherPiece = getPiece(state, newPos)
        if (otherPiece == null || (move.attackMove && otherPiece.color != color)) {
            moves.push(newPos)
        }
    }

    const castlingMoves = getCastlingMoves(state, color)
    moves.push(...castlingMoves)

    return moves
}

// TODO: unit tests
export const getCastlingMoves = (state: BinaryBoard, color: number): Pos[] => {
    // check castling
    // TODO: no pieces are allowed between the king and the rook
    // to be able to rely on the FEN, we should update those after each move?
    // TODO: remove castling, either kingside or queenside when the rook for that side moves
    const isPathFree = (from: Pos, to: Pos): boolean => {
        const path = getTravelPath(from, to, king)
        for (let i = 1; i < path.length-1; i++) {// don't check first and last
            if (getPiece(state, path[i]) != null) {
                // path is not free
                return false
            }
        }
        return true
    }
    const moves = []
    if (color == white) {
        // first check what castling moves are available from the FEN string
        for (const cases of [{ castlingSide: 'K', pos: new Pos('a6') }, { castlingSide: 'Q', pos: new Pos('a2') }]) {
            if (state.boardData.castling.indexOf(cases.castlingSide) > -1) {
                // king is in position
                // check that path is free
                if (!isPathFree(Pos.parse('a4'), cases.pos)) continue
                // check if the king is moving through check
                if (!isKingMovingThroughCheck(state, color, cases.castlingSide)) {
                    moves.push(cases.pos)
                }
            }
        }
    } else {
        // black
        // first check what castling moves are available from the FEN string
        for (const cases of [{ castlingSide: 'k', pos: new Pos('h6') }, { castlingSide: 'q', pos: new Pos('h2') }]) {
            if (state.boardData.castling.indexOf(cases.castlingSide) > -1) {
                // king is in position
                // check that path is free
                if (!isPathFree(Pos.parse('h4'), cases.pos)) continue
                // check if the king is moving through check
                if (!isKingMovingThroughCheck(state, color, cases.castlingSide)) {
                    moves.push(cases.pos)
                }
            }
        }
    }
    return moves
}

export const getQueenMoves = (state: BinaryBoard, color: number, pos: Pos): Pos[] => {
    // guard
    if (getPiece(state, pos).type != queen) throw new Error('Not a queen')

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

export const getBishopMoves = (state: BinaryBoard, color: number, pos: Pos): Pos[] => {
    if (getPiece(state, pos).type != bishop) throw new Error('Not a bishop')
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

export const getKnightMoves = (state: BinaryBoard, color: number, pos: Pos): Pos[] => {
    if (getPiece(state, pos).type != knight) throw new Error(`Not a knight in ${pos.toString()}`)
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

export const getRookMoves = (state: BinaryBoard, color: number, pos: Pos): Pos[] => {
    if (getPiece(state, pos).type != rook) throw new Error('Not a rook')
    let moves: Pos[] = []

    for (const move of rookMoves) {
        const forward = color == white ? move.forward : -move.forward
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
                if (isOutsideBoard(newPos)) continue
                let piece = getPiece(state, newPos)
                while (piece == null) {
                    moves.push(newPos)
                    step++
                    newPos = pos.add(0, move.file * step)
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
    return moves;
}

export const isOutsideBoard = (pos: Pos): boolean => {
    return !(pos.x <= 7 && pos.x >= 0 && pos.y <= 7 && pos.y >= 0)
}


export const getPawnMoves = (state: BinaryBoard, color: number, pos: Pos): Pos[] => {
    if (getPiece(state, pos).type != pawn) throw new Error('Not a pawn')

    // PERF: maybe small perf gain by caching only the range of the board that the pawn is using
    // this way we would be able to return the cached moves if the pawn is in the same position
    let moves: Pos[] = []
    // TODO: we should look if we can make the "forward" not be specific to color
    for (const move of pawnMoves) {
        const forward = color == white ? move.forward : -move.forward
        const newPos = pos.add(forward, move.file)
        if (isOutsideBoard(newPos)) continue

        const targetPosPiece = getPiece(state, newPos)
        if (move.attackMove) {
            if (targetPosPiece != null && targetPosPiece.color != color) {
                moves.push(newPos)
            }
        } else if (targetPosPiece == null) {
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
    // console.log('moves pawn', moves.length)
    return moves
}

