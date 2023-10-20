import { FEN, movePiece } from "./FEN";
import { getAllPossibleMoves, getPossibleMoves } from "./moves";
import { Move, Piece } from "./rules";
import { negaMax } from "./zeroSum";

export const scoreObservers: ((score: number) => void)[] = []
export const onScoreUpdate = (score: number) => {
    scoreObservers.forEach((callback) => {
        callback(score);
    })
}

export type AiState = {
    workDone: boolean
    abortState: AbortState
    board: FEN
}
export type AbortState = { abort: boolean, reason: string }
export type AiMoveResult = {
    chain?: { [key: number]: string }
    bestMove?: Move
    bestScore?: number
    path?: string[]
    checkmate: boolean
    root?: MoveNode
}

export type MoveNode = {
    moves: MoveNode[]
    score?: number
    color: number
    state: string
    parentMoveDisplay?: string
    parentMove: Move
}
export const constructNodeChain = (state: FEN, depth: number, player: number, move?: Move): MoveNode | null => {
    const node: MoveNode = { moves: [], color: player, state: state.current.slice(), parentMove: move, parentMoveDisplay: `${-player}:${move?.from.toString()}->${move?.to.toString()}` }
    if (depth == 0) return node

    const moves = getAllPossibleMoves(state, player == 1 ? 'white' : 'black')
    for (const move of moves) {
        movePiece(state, move.from, move.to)
        node.moves.push(constructNodeChain(state, depth - 1, -player, move))
        state.undo()
    }
    return node
}

export const rootNegaMax = (state: FEN, depth: number, options: EvaluateOptions): AiMoveResult => {
    const rootNode = constructNodeChain(state, depth, 
            (state.currentPlayer == 'white' ? 1 : -1))
    const score = negaMax(rootNode, options)

    // find the node with the best score
    const max = rootNode.moves.length > 0
        ? options.scoreComparer != null 
            ? rootNode.moves.filter(s => s != null).sort(options.scoreComparer)[0] 
            : rootNode.moves.reduce((acc, cur) => acc.score > cur.score ? acc : cur)
        : null
    onScoreUpdate(max?.score ?? 0)
    return {
        bestMove: max?.parentMove,
        bestScore: max?.score,
        checkmate: max == null,
        root: rootNode,
    };
}

const promoteScore = 80
const pawnAdvancement = [
    [promoteScore, promoteScore, promoteScore, promoteScore, promoteScore, promoteScore, promoteScore, promoteScore],
    [promoteScore / 2, promoteScore / 2, promoteScore / 2, promoteScore / 2, promoteScore / 2, promoteScore / 2, promoteScore / 2, promoteScore / 2],
    [5, 5, 5, 5, 5, 5, 5, 5],
    [4, 4, 4, 4, 4, 4, 4, 4],
    [3, 3, 3, 3, 3, 3, 3, 3],
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
    scoreComparer?: (a: MoveNode, b: MoveNode) => number
}
const throwIfNaN = (value: number, callback: Function) => {
    if (isNaN(value)) {
        callback()
        throw new Error('NaN')
    }
}
export enum capturePoints {
    pawn = 150,
    knight = 500,
    bishop = 500,
    rook = 500,
    queen = 900,
    king = 9000,
}
export const loopThroughBoard = (fenState: FEN, callback: (piece: Piece) => void) => {
    // 8/8/8/8/8/8/PPPPPPPP/8
    const str = fenState.current.split(' ')[0]
    let rankIndex = 7
    let file = 0
    for (let i = 0; i < str.length; i++) {
        if (str[i] == '/') {
            rankIndex--
            file = 0
            continue
        }
        if (!isNaN(parseInt(str[i]))) {
            file += parseInt(str[i])
            continue
        }
        const piece = new Piece(str[i], rankIndex, file)
        callback(piece)
        file++
    }
}
export const evaluate = (fenState: FEN, options: EvaluateOptions): number => {
    const considerPieceValue = options?.pieceValue ?? true
    const considerPawnAdvancement = options?.pawnAdvancement ?? true
    const mobility = options?.mobility ?? true
    // PERF: we run through the board several times here, if we instead do it once, and then reuse it
    // should time the difference
    let fullScore = 0
    if (considerPieceValue) {
        const pieces: { [key: string]: number } = {
            'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0, 'k': 0,
            'P': 0, 'N': 0, 'B': 0, 'R': 0, 'Q': 0, 'K': 0,
        }

        // get all pieces
        loopThroughBoard(fenState, (piece: Piece) => {
            pieces[piece.type]++
        })

        const weights: { [key: string]: number } = {
            'p': capturePoints.pawn,
            'n': capturePoints.knight,
            'b': capturePoints.bishop,
            'r': capturePoints.rook,
            'q': capturePoints.queen,
            'k': capturePoints.king,
        }
        const pieceTypes = ['p', 'n', 'b', 'r', 'q', 'k']

        for (const pieceType of pieceTypes) {
            const weight = weights[pieceType.toLowerCase()]
            const score = weight
                * (pieces[pieceType.toUpperCase()] - pieces[pieceType])
            fullScore += score
            throwIfNaN(fullScore, () => console.log('score:', score, 'weight:', weight, 'pieces:', pieces[pieceType.toUpperCase()], pieces[pieceType]))
        }
    }

    // pawn advancement
    if (considerPawnAdvancement) {
        loopThroughBoard(fenState, (piece: Piece) => {
            if (piece.type == 'p' || piece.type == 'P') {
                const pawnScore = piece.color == 'white'
                    ? pawnAdvancement[Math.abs(piece.pos.y-7)][piece.pos.file]
                    : pawnAdvancementBlack[Math.abs(piece.pos.y-7)][piece.pos.file] * -1
                fullScore += pawnScore
                throwIfNaN(fullScore, () => console.log('pawnScore:', pawnScore, 'piece:', piece))
            }
        })
    }

    // mobility
    if (mobility) {
        loopThroughBoard(fenState, (piece: Piece) => {
            const mobilityScore = getMobilityScore(fenState, piece)
            const score = piece.color == 'white' ? mobilityScore : mobilityScore * -1
            fullScore += score
            throwIfNaN(fullScore, () => console.log('mobilityScore:', mobilityScore, 'piece:', piece))
        })

    }

    return fullScore
}

const getMobilityScore = (fenState: FEN, piece: Piece, kingCheck:boolean=false): number => {
    const moves = getPossibleMoves(fenState, piece, kingCheck).length
    return moves
}

