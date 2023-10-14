import { filterKingVulnerableMoves, getAllPossibleMoves } from "./rules";
import { FenPos } from "./utils";

export const aiMove = (): {from:FenPos, to:FenPos} => {
    // TODO: Implement AI move logic here
    // For now, just return a random move
    const moves = getAllPossibleMoves();
    const randomIndex = Math.floor(Math.random() * moves.length);

    return moves[randomIndex];
}

