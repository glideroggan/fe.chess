import { FEN, getPiece, movePiece } from "./FEN";
import { getMoves } from "./moves";
import { Move, Piece, getAllPossibleMoves } from "./rules";
import { negaMax } from "./zeroSum";

export const scoreObservers: ((score: number) => void)[] = []
export const onScoreUpdate = (score: number) => {
    scoreObservers.forEach((callback) => {
        callback(score);
    })
}

export let cache: { [key: string]: number } = {}
const getCacheKey = (fen: FEN, maximizingPlayer: boolean): string => {
    return `${fen.current}&${maximizingPlayer}`
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
    const node:MoveNode = { moves: [], color: player, state: state.current.slice(), parentMove: move, parentMoveDisplay: `${-player}:${move?.from.toString()}->${move?.to.toString()}` }
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
    const isWhite = state.currentPlayer == 'white'
    const moves = getAllPossibleMoves(state, isWhite ? 'white' : 'black')
    // let max: number = -Infinity
    // let bestMove: Move = moves[0]
    const random = options?.random ?? true;
    // const updateScore = (score: number, move: Move) => {
    //     max = score
    //     bestMove = move.clone()
    //     onScoreUpdate(max)
    // }

    // TODO: continue here
    // to understand WHY, record each time negaMax is choosing the max value
    // recording this into a variable will show a history of the path
    // const chain: { [key: number]: string } = {};
    // construct the node chain, so that we can send in the root node into negmax
    // and have all the moves ready
    const rootNode = constructNodeChain(state, depth + 1, isWhite ? 1 : -1)
    // console.log('after construct', rootNode)
    // do we just follow the tree now?
    // chain[depth - 1] = move.toString()
    // console.log('chain:', chain)
    const score = negaMax(rootNode, options)
    // console.log('main score', score)
    // console.log('after scoring', rootNode)

    // find the node with the best score
    const max = rootNode.moves.length > 0 
        ? rootNode.moves.reduce((acc, cur) => acc.score > cur.score ? acc : cur)
        : null
    // console.log(bestNodes)
    // let bestNode = bestNodes[0]
    // if (bestNodes.length > 1 && random) {
    //     bestNode = bestNodes[Math.floor(Math.random() * bestNodes.length)]
    // }
    // console.log('bestNode', bestNode)



    // console.log(`move(${isWhite}):`, move.from.toString(), '->', move.to.toString(), 'score:', score)
    // if (random && score == max && Math.random() > 0.5) {
    //     chain[depth] = move.toString()
    //     updateScore(score, move)
    // } else if (score > max) {
    //     chain[depth] = move.toString()
    // Add this function to get the max score node
    const getMaxScoreNode = (nodes: MoveNode[]): MoveNode => {
        let maxScore = -Infinity;
        let maxScoreNode: MoveNode | undefined;
        for (const node of nodes) {
            if (!node) {
                continue;
            }
            if (node.score > maxScore) {
                maxScore = node.score;
                maxScoreNode = node;
            }
        }
        if (!maxScoreNode) {
            throw new Error("No max score node found");
        }
        return maxScoreNode;
    };

    // Update the code to use the getMaxScoreNode function
    // let n = bestNode;
    // let p = [];
    // while (n != null) {
    //     p.push(n.parentMove.toString());
    //     n = getMaxScoreNode(n.moves);
    // }
    return {
        bestMove: max?.parentMove,
        bestScore: max?.score,
        checkmate: max == null,
    };
}


export const compareScoreAndMove =
    (maximizingPlayer: boolean, latestScore: number, results: { bestScore: number, bestMove: Move }, latestMove: Move, options?: EvaluateOptions): void => {
        const random = options?.random ?? true;
        if (maximizingPlayer) {
            if (latestScore == results.bestScore) {
                if (random && Math.random() > 0.5) {
                    results.bestScore = latestScore;
                    results.bestMove = latestMove;
                    onScoreUpdate(results.bestScore)
                    return
                }
            }
            if (latestScore > results.bestScore) {
                results.bestScore = latestScore;
                results.bestMove = latestMove;
                console.log(`better score found - 
                score:${results.bestScore}, move: ${results.bestMove.from.toString()} -> ${results.bestMove.to.toString()}`)
                onScoreUpdate(results.bestScore)
            }
        } else {
            if (latestScore == results.bestScore) {
                if (random && Math.random() > 0.5) {
                    results.bestScore = latestScore;
                    results.bestMove = latestMove;
                    onScoreUpdate(results.bestScore)
                    return
                }
            }
            if (latestScore < results.bestScore) {
                results.bestScore = latestScore;
                results.bestMove = latestMove;
                console.log(`worst score found - 
                score:${results.bestScore}, move: ${results.bestMove.from.toString()} -> ${results.bestMove.to.toString()}`)
                onScoreUpdate(results.bestScore)
            }
        }
    }



export const compareScores = (maximizingPlayer: boolean, score: number, bestScore: number): number => {
    if (maximizingPlayer) {
        return Math.max(bestScore, score);
    }
    return Math.min(bestScore, score);
}
const promoteScore = 80
const pawnAdvancement = [
    [promoteScore, promoteScore, promoteScore, promoteScore, promoteScore, promoteScore, promoteScore, promoteScore],
    [promoteScore / 2, promoteScore / 2, promoteScore / 2, promoteScore / 2, promoteScore / 2, promoteScore / 2, promoteScore / 2, promoteScore / 2],
    [5, 5, 5, 5, 5, 5, 5, 5],
    [4, 4, 4, 4, 4, 4, 4, 4],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
]
const pawnAdvancementBlack = pawnAdvancement.slice().reverse()

export type EvaluateOptions = {
    random?: boolean
    pieceValue?: boolean
    pawnAdvancement?: boolean
    mobility?: boolean
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
export const evaluate = (fenState: FEN, options: EvaluateOptions): number => {
    const considerPieceValue = options?.pieceValue ?? true
    const considerPawnAdvancement = options?.pawnAdvancement ?? true
    const isWhite = (c: string) => c == c.toUpperCase()
    let fullScore = 0
    if (considerPieceValue) {
        const pieces: { [key: string]: number } = {
            'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0, 'k': 0,
            'P': 0, 'N': 0, 'B': 0, 'R': 0, 'Q': 0, 'K': 0,
        }

        // get all pieces
        let rankIndex = 7
        let file = 0
        const str = fenState.current.split(' ')[0]
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
            pieces[str[i]] = pieces[str[i]] ?? 0
            pieces[str[i]]++
        }

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
            const weight = weights[pieceType]
            const score = weight
                * (pieces[pieceType.toUpperCase()] - pieces[pieceType])
            fullScore += score
            throwIfNaN(fullScore, () => console.log('score:', score, 'weight:', weight, 'pieces:', pieces[pieceType.toUpperCase()], pieces[pieceType]))
        }
    }

    // pawn advancement
    if (considerPawnAdvancement) {
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
            if (str[i].toLowerCase() === 'p') {
                const pawnScore = isWhite(str[i])
                    ? pawnAdvancement[Math.abs(rankIndex - 7)][file]
                    : pawnAdvancementBlack[Math.abs(rankIndex - 7)][file] * -1
                fullScore += pawnScore
                throwIfNaN(fullScore, () => console.log('pawnScore:', pawnScore, 'rankIndex:', rankIndex, 'file:', file))
            }
            file++
        }
    }

    return fullScore
}

const getMobilityScore = (fenState: FEN, piece: Piece): number => {
    const moves = getMoves(fenState, piece, false).length
    return moves == 0 ? 1 : moves
}

