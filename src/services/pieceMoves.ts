import { Color, boardState } from "./rules"
import { FenPos } from "./utils"

type Move = {
    forward: number
    file: number
    attackMove: boolean
}

export const getPawnMoves = (color: Color, pos: FenPos): FenPos[] => {
    /*Pawn
        [X] White
        [ ] Black
        [X] 1 or 2 steps forward
            2 steps only if it's the first move
            1 step if nothing is blocking
        [X] 1 up and left, if there's an enemy piece
        [X] 1 up and right, if there's an enemy piece
        [ ] Passant
    */
    let moves: FenPos[] = []
    // TODO: go through all the possible moves and check if they are valid
    const pawnMoves:Move[] = [{ forward: 1, file: 0, attackMove:false }, { forward: 2, file: 0, attackMove:false }, { forward: 1, file: -1, attackMove: true }, { forward: 1, file: 1, attackMove: true }]
    for (const move of pawnMoves) {
        const forward = color == 'white' ? move.forward : -move.forward
        const newPos = new FenPos(
            String.fromCharCode(pos.rank.charCodeAt(0) + forward), 
            pos.file + move.file)
        const piece = boardState.getPiece(newPos)
        if (move.attackMove) {
            if (piece != null && piece.color != color) {
                moves.push(newPos)
            }
        } else if (piece == null) {
            moves.push(newPos)
        }
    }

    if (color == 'white') {
        if (pos.rank == 'b') {
            // check that we can move there
            if (boardState.getPiece(new FenPos('c', pos.file)) == null) {
                moves.push(new FenPos('c', pos.file))
            }
            if (boardState.getPiece(new FenPos('d', pos.file)) == null) {
                moves.push(new FenPos('d', pos.file))
            }
        } else {
            // check one step forward
            // TODO: check boundaries of the board
            const newPos = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + 1), pos.file)
            if (boardState.getPiece(newPos) == null) {
                moves.push(newPos)
            }
            // check up and left
            const newPos2 = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + 1), pos.file - 1)
            const piece = boardState.getPiece(newPos2)
            if (piece != null && piece.color != color) {
                moves.push(newPos2)
            }
            // check up and right
            const newPos3 = new FenPos(String.fromCharCode(pos.rank.charCodeAt(0) + 1), pos.file + 1)
            const piece2 = boardState.getPiece(newPos3)
            if (piece2 != null && piece2.color != color) {
                moves.push(newPos3)
            }
        }
        // TODO: continue adding moves here
    }
    return moves
}