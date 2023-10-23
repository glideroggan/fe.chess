import { BinaryBoard, BinaryPiece, bishop, black, getPiece, isWhite, king, knight, move, pawn, queen, rook, translateNumber2Char, undo, white } from "./binaryBoard";
import { EvaluateOptions } from "./evaluation";
import { getAllPossibleMoves } from "./moves";
import { Move, PieceType } from "./rules";
import { Pos } from "./utils";
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
    board: BinaryBoard
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
    color: number   // -1 black 1 white
    state: BinaryBoard
    parentMoveDisplay?: string
    parentMove?: Move
    parent?: MoveNode    
}
export const constructNodeChain = (state: BinaryBoard, depth: number, player: number, parent?: MoveNode, parentMove?: Move): MoveNode | null => {

    const node: MoveNode = { parent: parent, moves: [], color: player, state: state.clone(), parentMove: parentMove, parentMoveDisplay: `${parentMove?.from.toString()}->${parentMove?.to.toString()}` }
    if (depth == 0) return node

    const moves = getAllPossibleMoves(state, player == 1 ? white : black)
    for (const pieceMove of moves) {
        move(state, pieceMove.from, pieceMove.to)
        node.moves.push(constructNodeChain(state, depth - 1, -player, node, pieceMove))
        undo(state)
    }
    return node
}

export const rootNegaMax = (state: BinaryBoard, depth: number, options: EvaluateOptions): AiMoveResult => {
    // important that player variable in this stage is 1 or -1
    const rootNode = constructNodeChain(state, depth, isWhite(state.currentPlayer) ? 1 : -1)
    negaMax(rootNode, options)

    if (options.console) {
        let str = ''
        explore(rootNode, {
            f: printOut,
            strCollector: (s: string) => str += s
        })
        console.log('[AI] negamax tree:\n', str)
    }

    // find the node with the best score
    const bestScore = rootNode.moves.reduce((a: number, b: MoveNode) => Math.max(a, b.score), -Infinity)
    const nodes = rootNode.moves.filter((move) => move.score == bestScore)
    const bestMove = nodes[Math.floor(Math.random() * nodes.length)]
    onScoreUpdate(bestMove?.score ?? 0)
    return {
        bestMove: bestMove?.parentMove,
        bestScore: bestMove?.score,
        checkmate: bestMove == null,
        root: rootNode,
    };
}


export const loopThroughBoard = (state: BinaryBoard, callback: (piece: BinaryPiece) => void) => {
    // 8/8/8/8/8/8/PPPPPPPP/8
    for (let y = 0; y < 8; y++) {
        // const rank = state.getRank(y)
        for (let x = 0; x < 8; x++) {
            const pieceType = state.get(new Pos(x, y))
            if (pieceType === 0) continue
            const piece = new BinaryPiece(pieceType, new Pos(x, y))
            callback(piece)
        }
    }
}

export const translateToNumber = (type: PieceType): number => {
    switch (type) {
        case 'k': case 'K': return 1
        case 'q': case 'Q': return 2
        case 'b': case 'B': return 4
        case 'n': case 'N': return 8
        case 'r': case 'R': return 16
        case 'p': case 'P': return 32
    }
}
export const translateToPiece = (binaryType: number): string => {
    // return the correct character based on the binary type
    switch (binaryType) {
        case king | white: return 'K'
        case king | black: return 'k'
        case queen | white: return 'Q'
        case queen | black: return 'q'
        case bishop | white: return 'B'
        case bishop | black: return 'b'
        case knight | white: return 'N'
        case knight | black: return 'n'
        case rook | white: return 'R'
        case rook | black: return 'r'
        case pawn | white: return 'P'
        case pawn | black: return 'p'
    }
}

export const printOut = (n: MoveNode, strCollector: (str: string) => void) => {
    const c = -n.color == 1 ? 'w' : 'b'
    // check if there was a capture by looking at the state before this node
    const previousState = n.parent?.state
    let captured = 0
    if (previousState != undefined && n.parentMove != null && n.parentMove.to != null) {
        const previousPiece = getPiece(previousState, n.parentMove.to)
        if (previousPiece != null) {
            captured = getPiece(n.state, n.parentMove.to)?.typeAndColor != previousPiece?.typeAndColor ? previousPiece?.typeAndColor : 0
        }

    }
    strCollector(`${c}: ${n.parentMoveDisplay?.toString()} (${n.score}) ${translateNumber2Char(captured)} ${n.state.boardData.getFullBoard}\n`)
}
export const explore = (n: MoveNode, store: any) => {
    if (n == null) return
    store.f(n, store.strCollector)
    if (n.moves.length == 0) return
    const best = n.moves.reduce((acc, cur) => acc.score > cur.score ? acc : cur)
    explore(best, store)
}


