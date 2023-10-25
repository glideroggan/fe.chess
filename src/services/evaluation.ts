import { loopThroughBoard } from "./ai"
import { BinaryBoard, BinaryPiece, bishop, black, king, knight, pawn, queen, rook, white } from "./binaryBoard"
import { getPossibleMoves } from "./moves"

const promoteScore = 80
const pawnAdvancement = [
    [promoteScore, promoteScore, promoteScore, promoteScore, promoteScore, promoteScore, promoteScore, promoteScore],
    [promoteScore / 2, promoteScore / 2, promoteScore / 2, promoteScore / 2, promoteScore / 2, promoteScore / 2, promoteScore / 2, promoteScore / 2],
    [5, 5, 5, 5, 5, 5, 5, 5],
    [4, 4, 4, 4, 4, 4, 4, 4],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]
const pawnAdvancementBlack = pawnAdvancement.slice().reverse()
export type EvaluateOptions = {
    random?: boolean
    pieceValue?: boolean
    pawnAdvancement?: boolean
    mobility?: boolean
    console?: boolean
}
export enum capturePoints {
    pawn = 150,
    knight = 500,
    bishop = 500,
    rook = 500,
    queen = 900,
    king = 9000,
}
const weights: { [key: number]: number } = {
    32: capturePoints.pawn,
    8: capturePoints.knight,
    4: capturePoints.bishop,
    16: capturePoints.rook,
    2: capturePoints.queen,
    1: capturePoints.king,
}
export const evaluate = (fenState: BinaryBoard, options: EvaluateOptions): number => {
    const considerPieceValue = options?.pieceValue ?? true
    const considerPawnAdvancement = options?.pawnAdvancement ?? true
    const mobility = options?.mobility ?? true
    // PERF: we run through the board several times here, if we instead do it once, and then reuse it
    // should time the difference
    let fullScore = 0
    if (considerPieceValue) {
        const pieces: Map<number, number> = new Map()
        // initialize map
        pieces.set(king | white, 0)
        pieces.set(queen | white, 0)
        pieces.set(bishop | white, 0)
        pieces.set(knight | white, 0)
        pieces.set(rook | white, 0)
        pieces.set(pawn | white, 0)

        pieces.set(king | black, 0)
        pieces.set(queen | black, 0)
        pieces.set(bishop | black, 0)
        pieces.set(knight | black, 0)
        pieces.set(rook | black, 0)
        pieces.set(pawn | black, 0)

        // get all pieces
        loopThroughBoard(fenState, (piece: BinaryPiece) => {
            pieces.set(piece.typeAndColor, (pieces.get(piece.typeAndColor) ?? 0) + 1)
        })

        for (let pieceType = 1; pieceType <= 32; pieceType *= 2) {
            const weight = weights[pieceType]
            const score = weight * (pieces.get(pieceType | white) - pieces.get(pieceType | black))
            
            fullScore += score

            throwIfNaN(score, () => console.log(
                'score:', score, 'weight:', weight, 'pieces:',
                pieces.get(pieceType | white), pieces.get(pieceType | black)))
        }
    }
    // pawn advancement
    if (considerPawnAdvancement) {
        loopThroughBoard(fenState, (piece: BinaryPiece) => {
            if (piece.type == pawn) {
                const pawnScore = piece.color == white
                    ? pawnAdvancement[Math.abs(piece.pos.y - 7)][piece.pos.file]
                    : pawnAdvancementBlack[Math.abs(piece.pos.y - 7)][piece.pos.file] * -1
                fullScore += pawnScore
                throwIfNaN(fullScore, () => console.log('pawnScore:', pawnScore, 'piece:', piece))
            }
        })
    }

    // mobility
    if (mobility) {
        loopThroughBoard(fenState, (piece: BinaryPiece) => {
            // guard
            if (piece.typeAndColor == undefined) throw new Error('piece.typeAndColor is undefined')

            const mobilityScore = getMobilityScore(fenState, piece)
            const score = piece.color == white ? mobilityScore : mobilityScore * -1
            fullScore += score
            throwIfNaN(fullScore, () => console.log('mobilityScore:', mobilityScore, 'piece:', piece))
        })

    }


    return fullScore
}
export const getMobilityScore = (fenState: BinaryBoard, piece: BinaryPiece, kingCheck: boolean = false): number => {
    const moves = getPossibleMoves(fenState, piece, kingCheck).length
    return moves
}
const throwIfNaN = (value: number, callback: Function) => {
    if (isNaN(value)) {
        callback()
        throw new Error('NaN')
    }
}