import { FEN } from "./FEN";
import { getBishopMoves, getKingMoves, getKnightMoves, getPawnMoves, getQueenMoves, getRookMoves } from "./pieceMoves";
import { Piece } from "./rules";
import { Pos } from "./utils";

export const getMoves = (fenState: FEN, piece:Piece, kingCheck: boolean = true): Pos[] => {
    switch (piece.type) {
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