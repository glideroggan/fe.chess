import { FEN, getPiece } from "./FEN";
import { getBishopMoves, getKingMoves, getKnightMoves, getPawnMoves, getQueenMoves, getRookMoves } from "./pieceMoves";
import { Piece } from "./rules";
import { Pos } from "./utils";

export const getMoves = (fenState: FEN, piece: Piece, kingCheck: boolean = true): Pos[] => {
    switch (piece.type) {
        case "p":
        case "P":
            return getPawnMoves(fenState, piece.color, piece.pos)
        case "n":
        case "N":
            return getKnightMoves(fenState, piece.color, piece.pos)
        case "r":
        case "R":
            return getRookMoves(fenState, piece.color, piece.pos)
        case "b":
        case "B":
            return getBishopMoves(fenState, piece.color, piece.pos)
        case "q":
        case "Q":
            return getQueenMoves(fenState, piece.color, piece.pos)
        case "k":
        case "K":
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