import { MoveNode } from "./ai"
import { BinaryBoard } from "./binaryBoard"
import { EvaluateOptions, evaluate } from "./evaluation"

export const negaMax = (node: MoveNode,  options: EvaluateOptions): number => {
    if (node.moves.length == 0) return node.color * evaluate(new BinaryBoard(node.state), options)
    for (const childNode of node.moves) {
        childNode.score = -negaMax(childNode, options)
    }
    // TODO: what about this comparer? we changed the other?
    return node.moves.reduce((a, b) => Math.max(a, b.score), -Infinity)
}
