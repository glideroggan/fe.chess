import { BinaryBoard, BinaryPiece, BoardData, bishop, black, isWhite, king, knight, move, pawn, queen, rook, undo, white } from "./binaryBoard";
import { EvaluateOptions } from "./evaluation";
import { getAllPossibleMoves, getPossibleMoves } from "./moves";
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
    color: 1 | -1
    state: BoardData
    parentMoveDisplay?: string
    parentMove: Move
}
export const constructNodeChain = (state: BinaryBoard, depth: number, player: 1 | -1, parentMove?: Move): MoveNode | null => {

    const node: MoveNode = { moves: [], color: player, state: state.clone().boardData, parentMove: parentMove, parentMoveDisplay: `${-player}:${parentMove?.from.toString()}->${parentMove?.to.toString()}` }
    if (depth == 0) return node

    const moves = getAllPossibleMoves(state, player == 1 ? white : black)
    for (const pieceMove of moves) {
        move(state, pieceMove.from, pieceMove.to)
        node.moves.push(constructNodeChain(state, depth - 1, player == 1 ? -1 : 1, pieceMove))
        undo(state)
    }
    return node
}

export const rootNegaMax = (state: BinaryBoard, depth: number, options: EvaluateOptions): AiMoveResult => {
    // important that player variable in this stage is 1 or -1
    const rootNode = constructNodeChain(state, depth, isWhite(state.currentPlayer) ? 1 : -1)
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
    //     const piece = new Piece(str[i], rankIndex, file, getColor(str[i]))
    //     callback(piece)
    //     file++
    // }
}

// export const getColor = (char: string): Color => char === char.toUpperCase() ? Color.white : Color.black
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




