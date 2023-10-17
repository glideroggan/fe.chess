import { FEN, getPiece, movePiece } from "./FEN";
import { getMoves } from "./moves";
import { Move, Piece, getAllPossibleMovesForCurrentPlayer } from "./rules";
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
    bestMove: Move
    bestScore: number
}

export const rootNegaMax = (state: FEN, depth: number, options: EvaluateOptions): AiMoveResult => {
    const moves = getAllPossibleMovesForCurrentPlayer(state)
    let bestScore: number = -Infinity
    let bestMove: Move = moves[0]
    const random = options?.random ?? true;
    const updateScore = (score: number, move: Move) => {
        bestScore = score
        bestMove = move.clone()
        onScoreUpdate(bestScore)
    }

    for (const move of moves) {
        movePiece(state, move.from, move.to)
        const score = -negaMax(state, depth, options)
        // console.log(`move(${playingFor}):`, move.from.toString(), '->', move.to.toString(), 'score:', score)
        if (random && score == bestScore && Math.random() > 0.5) {
            updateScore(score, move)
        } else if (score > bestScore) {
            updateScore(score, move)
        }
        state.undo()
    }
    return {
        bestMove,
        bestScore
    }
}

// export const newAiMove = (state: FEN, depth: number, options: EvaluateOptions): AiMoveResult => {
//     const moves = getAllPossibleMovesForCurrentPlayer(state)
//     let results: AiMoveResult = {
//         bestMove: moves[0],
//         bestScore: -Infinity
//     }
//     for (const move of moves) {
//         movePiece(state, move.from, move.to)
//         const score = maxi(state, depth - 1, options)
//         if (score > results.bestScore) {
//             results.bestScore = score
//             results.bestMove = move
//             onScoreUpdate(results.bestScore)
//         }
//         state.undo()
//     }
//     return results
// }

// export const aiMove =
//     (state: FEN, prefix: string, abortState: AbortState, depth: number, maximizingPlayer: boolean, options: EvaluateOptions, sleep?: number): Promise<AiMoveResult> => {
//         const fenState = state
//         const p = new Promise<AiMoveResult>(async (resolve, reject) => {
//             const moves = getAllPossibleMovesForCurrentPlayer(fenState);
//             if (moves.length === 0) {
//                 resolve(null)
//             }
//             const r = Math.floor(Math.random() * moves.length)
//             const random = options?.random ?? true;
//             let results: AiMoveResult = {
//                 bestMove: moves[random ? r : 0],
//                 bestScore: maximizingPlayer ? -Infinity : Infinity
//             }

//             if (depth === 0 || moves.length === 0) {
//                 console.log(prefix + ' depth 0', 'bestMove:', results.bestMove, 'bestScore:', results.bestScore)
//                 resolve(results);
//                 return
//             }

//             for (const move of moves) {
//                 if (abortState.abort) {
//                     reject(results.bestMove)
//                 }
//                 const { from, to } = move;
//                 movePiece(fenState, from, to);

//                 const cached = cache[getCacheKey(fenState, maximizingPlayer)]
//                 let score = 0
//                 if (cached == undefined) {
//                     // score = maxi(fenState, depth - 1, options)
//                     score = await minimax(fenState, abortState, depth - 1, !maximizingPlayer, options, sleep);
//                     if (abortState.abort) {
//                         console.log(prefix + ':interrupted', 'move:', move, 'score:', score, 'depth:', depth)
//                         compareScoreAndMove(maximizingPlayer, score, results, move, options)
//                         console.log(prefix, 'bestMove:', results.bestMove, 'bestScore:', results.bestScore, 'depth:', depth)
//                         reject(results.bestMove)
//                         return
//                     }
//                     cache[getCacheKey(fenState, maximizingPlayer)] = score
//                     // console.log('cached', cache[cache.length-1])
//                 } else {
//                     score = cached
//                 }

//                 compareScoreAndMove(maximizingPlayer, score, results, move, options)
//                 fenState.undo()
//             }

//             console.log(prefix, 'bestMove:', results.bestMove, 'bestScore:', results.bestScore, 'depth:', depth)
//             resolve(results)
//             return
//         })
//         return p
//     }

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

// export const minimax =
//     async (fenState: FEN, abortState: AbortState, depth: number, maximizingPlayer: boolean,
//         options: EvaluateOptions, sleep?: number): Promise<number> => {
//         if (depth === 0) {
//             return evaluate(fenState, options);
//         }

//         const moves = getAllPossibleMovesForCurrentPlayer(fenState);
//         let bestScore = maximizingPlayer ? -Infinity : Infinity;

//         for (const move of moves) {
//             if (abortState.abort) {
//                 return bestScore
//             }
//             const { from, to } = move;
//             if (sleep != undefined)
//                 await new Promise(r => setTimeout(r, sleep))
//             movePiece(fenState, from, to);

//             const cached = cache[fenState.current]
//             let score
//             if (cached == undefined) {
//                 score = await minimax(fenState, abortState, depth - 1, !maximizingPlayer, options, sleep);
//                 if (abortState.abort) {
//                     bestScore = compareScores(maximizingPlayer, score, bestScore);
//                     return bestScore
//                 }
//                 cache[fenState.current] = score
//             } else {
//                 score = cached
//                 // console.log('cached', cached)
//             }

//             fenState.undo()

//             bestScore = compareScores(maximizingPlayer, score, bestScore);
//         }

//         return bestScore;
//     }

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
    pawn = 15,
    knight = 50,
    bishop = 50,
    rook = 50,
    queen = 90,
    king = 900,
}
export const evaluate = (fenState: FEN, options: EvaluateOptions): number => {
    const considerPieceValue = options?.pieceValue ?? true
    const considerPawnAdvancement = options?.pawnAdvancement ?? true
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
                * (fenState.currentPlayer === 'white' ? 1 : -1)
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
                const pawnScore = fenState.currentPlayer === 'white'
                    ? pawnAdvancement[Math.abs(rankIndex - 7)][file]
                    : pawnAdvancementBlack[Math.abs(rankIndex - 7)][file]
                fullScore += pawnScore
                throwIfNaN(fullScore, () => console.log('pawnScore:', pawnScore, 'rankIndex:', rankIndex, 'file:', file))
            }
            file++
        }
    }

    return fullScore
    // Evaluate material
    // const str = fenState.current.split(' ')[0]
    // let rankIndex = 7   // start at 7, as we're reading the FEN from top to bottom
    // let file = 0
    // for (let i = 0; i < str.length; i++) {
    //     if (str[i] == '/') {
    //         rankIndex--
    //         file = 0
    //         continue
    //     }
    //     if (!isNaN(parseInt(str[i]))) {
    //         file += parseInt(str[i])
    //         continue
    //     }
    //     const color = str[i] === str[i].toUpperCase() ? 'white' : 'black'
    //     const piece: Piece = {
    //         type: str[i].toLowerCase() as PieceType,
    //         color: color,
    //         pos: new Pos(file, rankIndex)
    //     }
    //     const value = options.pieceValue ? pieceValue(str[i]) : 0
    //     const mobilityScore = options.mobility ? getMobilityScore(fenState, piece) : 1
    //     let thisPieceScore = 0
    //     if (color === 'white') {
    //         thisPieceScore += value
    //         // thisPieceScore *= (options.pawnAdvancement && piece.type == 'p')
    //         //     ? pawnAdvancement[Math.abs(rankIndex - 7)][file] : 1
    //         // thisPieceScore *= mobilityScore
    //         score += thisPieceScore
    //     } else {
    //         thisPieceScore += value
    //         // thisPieceScore *= (options.pawnAdvancement && piece.type == 'p')
    //         //     ? pawnAdvancementBlack[Math.abs(rankIndex - 7)][file] : 1
    //         // thisPieceScore *= mobilityScore
    //         score -= thisPieceScore
    //     }
    //     file++
    // }
    // return score;
}

const getMobilityScore = (fenState: FEN, piece: Piece): number => {
    const moves = getMoves(fenState, piece, false).length
    return moves == 0 ? 1 : moves
}

