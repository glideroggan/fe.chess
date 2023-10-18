import { FEN, movePiece } from "./FEN"
import { AiMoveResult, EvaluateOptions, MoveNode, evaluate } from "./ai"
import { Move, getAllPossibleMoves } from "./rules"



export const negaMax = (node: MoveNode,  options: EvaluateOptions): number => {
    if (node.moves.length == 0) return node.color * evaluate(FEN.parse(node.state), options)
    for (const childNode of node.moves) {
        // value = Math.max(value, )
        childNode.score = -negaMax(childNode, options)
    }
    return node.moves.reduce((a, b) => Math.max(a, b.score), -Infinity)
}
