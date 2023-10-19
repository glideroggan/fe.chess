import { FEN, getPiece, getRank } from "./FEN"
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

export const getKingMoves = (state: FEN, color: Color, pos: Pos): Pos[] => {
    if (getPiece(state, pos).type != 'k') throw new Error('Not a king')
    let moves: Pos[] = []
    const pieceMoves: PieceMove[] = [
        { forward: 1, file: 0, attackMove: true },
        { forward: 1, file: 1, attackMove: true },
        { forward: 0, file: 1, attackMove: true },
        { forward: -1, file: 1, attackMove: true },
        { forward: -1, file: 0, attackMove: true },
        { forward: -1, file: -1, attackMove: true },
        { forward: 0, file: -1, attackMove: true },
        { forward: 1, file: -1, attackMove: true },
    ]
    for (const move of pieceMoves) {
        const newPos = pos.add(move.forward, move.file)
        if (isOutsideBoard(newPos)) continue
        const piece = getPiece(state, newPos)
        if (piece == null) {
            moves.push(newPos)
        } else if (move.attackMove && piece.color != color) {
            moves.push(newPos)
        }
    }
    return moves
}

export const getQueenMoves = (state: FEN, color: Color, pos: Pos): Pos[] => {
    if (getPiece(state, pos).type != 'q') throw new Error('Not a queen')
    let moves: Pos[] = []
    const pieceMoves: PieceMove[] = [
        { forward: 1, file: 1, attackMove: true, continously: true },
        { forward: 1, file: -1, attackMove: true, continously: true },
        { forward: -1, file: 1, attackMove: true, continously: true },
        { forward: -1, file: -1, attackMove: true, continously: true },
        { forward: -1, file: 0, attackMove: true, continously: true },
        { forward: 1, file: 0, attackMove: true, continously: true },
        { forward: 0, file: 1, attackMove: true, continously: true },
        { forward: 0, file: -1, attackMove: true, continously: true },
    ]
    for (const move of pieceMoves) {
        // TODO: we don't need continously in the move type, just use it in the piece move
        if (move.continously) {
            let step = 1
            let newPos = pos.add(move.forward, move.file)
            // let newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + move.forward), pos.file + move.file)
            if (isOutsideBoard(newPos)) continue
            let piece = getPiece(state, newPos)
            while (piece == null) {
                moves.push(newPos)
                step++
                newPos = pos.add(move.forward * step, move.file * step)
                // newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + move.forward * step), pos.file + move.file * step)
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
    if (getPiece(state, pos).type != 'b') throw new Error('Not a bishop')
    let moves: Pos[] = []
    const pieceMoves: PieceMove[] = [
        { forward: 1, file: 1, attackMove: true, continously: true },
        { forward: 1, file: -1, attackMove: true, continously: true },
        { forward: -1, file: 1, attackMove: true, continously: true },
        { forward: -1, file: -1, attackMove: true, continously: true },
    ]
    for (const move of pieceMoves) {
        if (move.continously) {
            let step = 1
            let newPos = pos.add(move.forward, move.file)
            // let newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + move.forward), pos.file + move.file)
            if (isOutsideBoard(newPos)) continue
            let piece = getPiece(state, newPos)
            while (piece == null) {
                moves.push(newPos)
                step++
                newPos = pos.add(move.forward * step, move.file * step)
                // newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + move.forward * step), pos.file + move.file * step)
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
    if (getPiece(state, pos).type != 'n') throw new Error(`Not a knight in ${pos.toString()}`)
    let moves: Pos[] = []
    const pieceMoves: PieceMove[] = [
        { forward: 2, file: -1, attackMove: true, jump: true },
        { forward: 2, file: 1, attackMove: true, jump: true },
        { forward: -2, file: -1, attackMove: true, jump: true },
        { forward: -2, file: 1, attackMove: true, jump: true },
        { forward: 1, file: -2, attackMove: true, jump: true },
        { forward: -1, file: -2, attackMove: true, jump: true },
        { forward: 1, file: 2, attackMove: true, jump: true },
        { forward: -1, file: 2, attackMove: true, jump: true },
    ]
    for (const move of pieceMoves) {
        const newPos = pos.add(move.forward, move.file)
        // const newPos = new Pos(pos.toPos().y + move.forward, pos.file + move.file)
        // const newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + move.forward),
        //     pos.file + move.file)
        if (isOutsideBoard(newPos)) continue
        const piece = getPiece(state, newPos)
        if (piece == null) {
            moves.push(newPos)
        } else if (move.attackMove && piece.color != color) {
            moves.push(newPos)
        }
    }
    return moves
}

export const getRookMoves = (state: FEN, color: Color, pos: Pos): Pos[] => {
    if (getPiece(state, pos).type != 'r') throw new Error('Not a rook')
    let moves: Pos[] = []
    const pieceMoves: PieceMove[] = [
        { forward: -1, attackMove: true, continously: true },
        { forward: 1, attackMove: true, continously: true },
        { file: 1, attackMove: true, continously: true },
        { file: -1, attackMove: true, continously: true },
    ]
    for (const move of pieceMoves) {
        const forward = color == 'white' ? move.forward : -move.forward
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
    return moves;
}

export const isOutsideBoard = (pos: Pos): boolean => {
    return !(pos.x <= 7 && pos.x >= 0 && pos.y <= 7 && pos.y >= 0)
}

export const getPawnMoves = (state: FEN, color: Color, pos: Pos): Pos[] => {
    // guard: no need really, and should only be used for debugging
    const p = getPiece(state, pos)
    if (p == null) {
        
        throw new Error(`No pawn at position: ${pos.toString()}, rank '${getRank(state, pos.rank)}'`)
    }
    if (getPiece(state, pos).type != 'p') throw new Error('Not a pawn')
    let moves: Pos[] = []
    const pawnMoves: PieceMove[] = [
        { forward: 1, file: 0, attackMove: false },
        { forward: 2, file: 0, attackMove: false, startMove: true },
        { forward: 1, file: -1, attackMove: true },
        { forward: 1, file: 1, attackMove: true }]
    for (const move of pawnMoves) {
        const forward = color == 'white' ? move.forward : -move.forward
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