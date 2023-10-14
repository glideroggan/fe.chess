import { Color, boardState } from "./rules"
import { FenPos } from "./utils"

type Move = {
    forward?: number
    file?: number
    attackMove?: boolean
    continously?: boolean
    jump?: boolean
    startMove?: boolean
}

export const getKingMoves = (color: Color, pos: FenPos): FenPos[] => {
    let moves: FenPos[] = []
    const pieceMoves: Move[] = [
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
        const newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + move.forward),
            pos.file + move.file)
        if (isOutsideBoard(newPos)) continue
        const piece = boardState.getPiece(newPos)
        if (piece == null) {
            moves.push(newPos)
        } else if (move.attackMove && piece.color != color) {
            moves.push(newPos)
        }
    }
    return moves
}

export const getQueenMoves = (color: Color, pos: FenPos): FenPos[] => {
    let moves: FenPos[] = []
    const pieceMoves: Move[] = [
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
            let newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + move.forward), pos.file + move.file)
            if (isOutsideBoard(newPos)) continue
            let piece = boardState.getPiece(newPos)
            while (piece == null) {
                moves.push(newPos)
                step++
                newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + move.forward * step), pos.file + move.file * step)
                if (isOutsideBoard(newPos)) break
                piece = boardState.getPiece(newPos)
            }
            if (piece == null) continue
            if (move.attackMove && piece.color != color) {
                moves.push(newPos)
            }
        }
    }
    return moves
}

export const getBishopMoves = (color: Color, pos: FenPos): FenPos[] => {
    let moves: FenPos[] = []
    const pieceMoves: Move[] = [
        { forward: 1, file: 1, attackMove: true, continously: true },
        { forward: 1, file: -1, attackMove: true, continously: true },
        { forward: -1, file: 1, attackMove: true, continously: true },
        { forward: -1, file: -1, attackMove: true, continously: true },
    ]
    for (const move of pieceMoves) {
        if (move.continously) {
            let step = 1
            let newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + move.forward), pos.file + move.file)
            if (isOutsideBoard(newPos)) continue
            let piece = boardState.getPiece(newPos)
            while (piece == null) {
                moves.push(newPos)
                step++
                newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + move.forward * step), pos.file + move.file * step)
                if (isOutsideBoard(newPos)) break
                piece = boardState.getPiece(newPos)
            }
            if (piece == null) continue
            if (move.attackMove && piece.color != color) {
                moves.push(newPos)
            }
        }
    }
    return moves
}

export const getKnightMoves = (color: Color, pos: FenPos): FenPos[] => {
    /*Knight
        [ ] White
        [ ] Black

    */
    let moves: FenPos[] = []
    const pieceMoves: Move[] = [
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
        const newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + move.forward),
            pos.file + move.file)
        if (isOutsideBoard(newPos)) continue
        const piece = boardState.getPiece(newPos)
        if (piece == null) {
            moves.push(newPos)
        } else if (move.attackMove && piece.color != color) {
            moves.push(newPos)
        }
    }
    return moves
}

export const getRookMoves = (color: Color, pos: FenPos): FenPos[] => {
    /*Rook
        [X] White
        [X] Black
        [X] horizontal
        [X] vertical
    */
    let moves: FenPos[] = []
    const pieceMoves: Move[] = [
        { forward: -1, attackMove: true, continously: true },
        { forward: 1, attackMove: true, continously: true },
        { file: 1, attackMove: true, continously: true },
        { file: -1, attackMove: true, continously: true },
    ]
    for (const move of pieceMoves) {
        const forward = color == 'white' ? move.forward : -move.forward
        if (move.continously) {
            // TODO: check all the possible moves in this direction, up to another piece
            let step = 1
            if (move.forward != null) {
                let newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + forward), pos.file)
                if (isOutsideBoard(newPos)) continue
                let piece = boardState.getPiece(newPos)
                while (piece == null) {
                    moves.push(newPos)
                    step++
                    newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + forward * step), pos.file)
                    if (isOutsideBoard(newPos)) break
                    piece = boardState.getPiece(newPos)
                }
                if (piece == null) continue
                if (move.attackMove && piece.color != color) {
                    moves.push(newPos)
                }
                continue
            }
            if (move.file != null) {
                let newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0)), pos.file + move.file)
                if (isOutsideBoard(newPos)) continue
                let piece = boardState.getPiece(newPos)
                while (piece == null) {
                    moves.push(newPos)
                    step++
                    newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0)), pos.file + move.file * step)
                    if (isOutsideBoard(newPos)) break
                    piece = boardState.getPiece(newPos)
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

const isOutsideBoard = (pos: FenPos): boolean => {
    return pos.file > 7 || pos.file < 0 || pos.rank > 'h' || pos.rank < 'a'
}

export const getPawnMoves = (color: Color, pos: FenPos): FenPos[] => {
    /*Pawn
        [ ] Passant
    */
    // TODO: fix mess
    let moves: FenPos[] = []
    const pawnMoves: Move[] = [
        { forward: 1, file: 0, attackMove: false },
        { forward: 2, file: 0, attackMove: false, startMove: true },
        { forward: 1, file: -1, attackMove: true },
        { forward: 1, file: 1, attackMove: true }]
    for (const move of pawnMoves) {
        const forward = color == 'white' ? move.forward : -move.forward
        const newPos = new FenPos(
            String.fromCharCode(pos.rank.charCodeAt(0) + forward),
            pos.file + move.file)
        if (isOutsideBoard(newPos)) continue

        const piece = boardState.getPiece(newPos)
        if (move.attackMove) {
            if (piece != null && piece.color != color) {
                moves.push(newPos)
            }
        } else if (piece == null) {
            if (move.startMove) {
                if (pos.rank == 'b') {
                    // no jumps allowed
                    const p = boardState.getPiece(new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + 1), pos.file))
                    if (p == null) {
                        moves.push(newPos)
                    }
                } else if (pos.rank == 'g') {
                    const p = boardState.getPiece(new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) - 1), pos.file))
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