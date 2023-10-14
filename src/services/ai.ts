import { FEN } from "./FEN";
import { Piece, boardState, getAllPossibleMoves } from "./rules";
import { FenPos } from "./utils";

export const aiMove =
    (depth: number, maximizingPlayer: boolean): Promise<{ from: FenPos, to: FenPos }> => {
        const p = new Promise<{ from: FenPos, to: FenPos }>((resolve, reject) => {
            const moves = getAllPossibleMoves();
            if (moves.length === 0) {
                return null
            }
            const r = Math.floor(Math.random() * moves.length)
            let bestMove: { from: FenPos, to: FenPos } = moves[r];
            let bestScore = maximizingPlayer ? -Infinity : Infinity;

            if (depth === 0 || moves.length === 0) {
                return bestMove;
            }

            for (const move of moves) {
                const { from, to } = move;
                boardState.move(from, to);

                const score = minimax(depth - 1, !maximizingPlayer);

                boardState.undo()

                if (maximizingPlayer) {
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = move;
                    }
                } else {
                    if (score < bestScore) {
                        bestScore = score;
                        bestMove = move;
                    }
                }
            }

            console.log('bestMove:', bestMove, 'bestScore:', bestScore)
            resolve(bestMove)
        })
        return p
    }

const minimax = (depth: number, maximizingPlayer: boolean): number => {
    if (depth === 0) {
        return evaluate(boardState);
    }

    const moves = getAllPossibleMoves();
    let bestScore = maximizingPlayer ? -Infinity : Infinity;

    for (const move of moves) {
        const { from, to } = move;
        boardState.move(from, to);

        const score = minimax(depth - 1, !maximizingPlayer);

        boardState.undo()

        if (maximizingPlayer) {
            bestScore = Math.max(bestScore, score);
        } else {
            bestScore = Math.min(bestScore, score);
        }
    }

    return bestScore;
}

const evaluate = (boardState: FEN): number => {
    let score = 0;
    const positionalScores = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [5, 10, 10, -20, -20, 10, 10, 5],
        [-10, -5, 0, 0, 0, 0, -5, -10],
        [-10, 0, 5, 5, 5, 5, 0, -10],
        [-5, 0, 5, 5, 5, 5, 0, -5],
        [0, 0, 5, 5, 5, 5, 0, -5],
        [-10, 5, 5, 5, 5, 5, 0, -10],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ]

    // Evaluate material
    const ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    for (const rankSymbol of ranks) {
        const rank = boardState.getRank(rankSymbol)
        for (let x = 0; x < 8; x++) {
            const p = rank[x]
            if (isNaN(parseInt(p))) {
                // piece
                const piece = boardState.getPiece(new FenPos(rankSymbol, x));
                const y = rankSymbol.charCodeAt(0) - 97
                if (piece.color === 'white') {
                    score += pieceValue(piece) + positionalScores[y][x];
                } else {
                    score -= pieceValue(piece) + positionalScores[y][x];
                }

            }
        }
    }
    return score;
}

const pieceValue = (piece: Piece): number => {
    switch (piece.type) {
        case "p":
            return 10;
        case "n":
            return 30;
        case "b":
            return 30;
        case "r":
            return 50;
        case "q":
            return 90;
        case "k":
            return 900;
    }
}
