import { MoveNode } from "./ai"
import { EvaluateOptions, evaluate } from "./evaluation"

export const negaMax = (node: MoveNode,  options: EvaluateOptions): number => {
    if (node.moves.length == 0) return node.color * evaluate(node.state.clone(), options)
    for (const childNode of node.moves) {
        childNode.score = -negaMax(childNode, options)
    }
    return node.moves.reduce((a:number, b:MoveNode) => Math.max(a, b.score), -Infinity)
}
