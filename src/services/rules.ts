import { FEN } from "./FEN"
import { getBishopMoves, getKingMoves, getKnightMoves, getPawnMoves, getQueenMoves, getRookMoves } from "./pieceMoves"
import { FenPos } from "./utils"

export let boardState: FEN
export let movingPiece: Piece

export type Color = 'white' | 'black'
export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k'

export type Piece = {
    color: Color
    type: PieceType
    pos: FenPos
}

export const startMoving = (pos: FenPos) => {
    // record the piece that is being moved
    movingPiece = boardState.getPiece(pos)
}

export const resetBoard = () => {
    boardState = FEN.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
}

export const validMove = (from: FenPos, to: FenPos): boolean => {
    // check if valid move for piece
    const toPiece = boardState.getPiece(to)
    if (toPiece != null && toPiece.color === boardState.currentPlayer) {
        return false
    }
    const piece = boardState.getPiece(from)
    if (piece != null) {
        const arr = getPossibleMoves(piece)
        if (arr.find((pos) => pos.equals(to))) {
            return true
        }
    }
    // check that we're not breaking chess rule (leaving king vulnerable)
    return false
}

const getPossibleMoves = (piece: Piece, kingCheck: boolean = true): FenPos[] => {
    let pMoves = []
    switch (piece.type) {
        case 'p':
            pMoves = getPawnMoves(piece.color, piece.pos)
            break
        case 'r':
            pMoves = getRookMoves(piece.color, piece.pos)
            break
        case 'n':
            pMoves = getKnightMoves(piece.color, piece.pos)
            break
        case 'b':
            pMoves = getBishopMoves(piece.color, piece.pos)
            break
        case 'q':
            pMoves = getQueenMoves(piece.color, piece.pos)
            break
        case 'k':
            pMoves = getKingMoves(piece.color, piece.pos)
            break
    }
    // check that all moves returned do not put the king in check
    if (kingCheck) {
        const results = filterKingVulnerableMoves(piece, pMoves)
        pMoves = results.valid
    }
    return pMoves
}

const filterKingVulnerableMoves = (piece: Piece, moves: FenPos[]): {valid:FenPos[], danger:any} => {
    const validMoves:FenPos[] = []
    const dangerMoves:{from:FenPos,to:FenPos}[] = []
    for (const to of moves) {
        // put the board in a place when the move is made
        // then check if the king is in check
        // if it not, then the move is valid
        boardState.move(piece.pos, to)

        // check if king is in check
        const kingPos = boardState.getKing(piece.color)
        const possibleMoves = getMovesTowards(kingPos, boardState.currentPlayer)
        if (possibleMoves.length > 0) {
            boardState.undo()
            dangerMoves.push(...possibleMoves)
            continue
        }
        boardState.undo()
        validMoves.push(to)
    }
    return {valid:validMoves, danger:dangerMoves}
}

export const getMovesTowards = (targetPos: FenPos, color: Color): {from:FenPos,to:FenPos}[] => {
    // go through whole board and check valid moves against this position
    const moves:{from:FenPos,to:FenPos}[] = []
    const ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    for (const rankSymbol of ranks) {
        const rank = boardState.getRank(rankSymbol)
        for (let x = 0; x < 8; x++) {
            const p = rank[x]
            if (isNaN(parseInt(p))) {
                // piece
                const piece:Piece = {
                    color: p === p.toUpperCase() ? 'white' : 'black',
                    type: p.toLowerCase() as PieceType,
                    pos: new FenPos(rankSymbol, x)
                }
                if (piece.color == color) {
                    let arr = getPossibleMoves(piece, false)
                    arr = arr.filter((pos) => pos.equals(targetPos))
                    arr.forEach((pos) => moves.push({from:piece.pos,to:pos}))
                }
            }
        }    
    }
    return moves
}


export const movePiece = (from: FenPos, to: FenPos): boolean => {
    boardState.move(from, to)
    boardState.playerChangeObservers.forEach((callback) => {
        callback(boardState.currentPlayer);
    });
    console.log(boardState.toString())

    movingPiece = null
    return true
}