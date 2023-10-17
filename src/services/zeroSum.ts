import { FEN, movePiece } from "./FEN"
import { AiMoveResult, EvaluateOptions, evaluate } from "./ai"
import { Move, getAllPossibleMovesForCurrentPlayer } from "./rules"



export const negaMax = (state:FEN, depth: number, options:EvaluateOptions):number => {
    if (depth == 0) return evaluate(state, options)
    let max = -Infinity
    const moves = getAllPossibleMovesForCurrentPlayer(state)
    for (const move of moves) {
        movePiece(state, move.from, move.to)
        const score = -negaMax(state, depth -1, options)
        if (score > max) max = score
        state.undo()
    }
    return max
}

// export const maxi = (state:FEN, depth: number, options:EvaluateOptions):number => {
//     if (depth == 0) return evaluate(state, options)
//     let max = -Infinity
//     const moves = getAllPossibleMovesForCurrentPlayer(state)
//     for (const move of moves) {
//         movePiece(state, move.from, move.to)
//         const score = mini(state, depth -1, options)
//         if (score > max) max = score
//         state.undo()
//     }
//     return max
// }

// export const mini = (state:FEN, depth: number, options:EvaluateOptions):number => {
//     if (depth == 0) return -evaluate(state, options)
//     let min = Infinity
//     const moves = getAllPossibleMovesForCurrentPlayer(state)
//     for (const move of moves) {
//         movePiece(state, move.from, move.to)
//         const score = maxi(state, depth -1, options)
//         if (score < min) min = score
//         state.undo()
//     }
//     return min
// }