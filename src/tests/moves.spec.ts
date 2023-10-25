import *  as binaryBoardModule from "../services/binaryBoard"
import { BinaryBoard, getPiece, move, rook, white } from "../services/binaryBoard"
import { getCastlingMoves } from "../services/pieceMoves"
import { Pos } from "../services/utils"

describe('Moves', () => {
    it('castling', () => {
        const state = BinaryBoard.parse('rnbqkbnr/ppp2pp1/4p3/3p3p/8/3BPN2/PPPP1PPP/RNBQK2R w KQkq - 0 4')

        const moves = getCastlingMoves(state, white)
        expect(state.boardData.castling).toBe('KQkq')
        expect(moves.length).toBe(1)

        move(state, Pos.parse('a4'), Pos.parse('a6'))

        expect(state.boardData.castling).toBe('kq')
        expect(getPiece(state, Pos.parse('a5'))?.typeAndColor).toBe(rook | white)
    })
    it('castling - update FEN after move', () => {
        const state = BinaryBoard.parse('rnbqkbnr/ppp2pp1/4p3/3p3p/8/3BPN2/PPPP1PPP/RNBQK2R w KQkq - 0 4')

        move(state, Pos.parse('a4'), Pos.parse('a6'))

        expect(state.boardData.castling).toBe('kq')
    })
    it('castling - white should be able to castle (kingside)', () => {
        /*
        h:r-b-k-nr
        g:-ppp-ppp
        f:--n-pq--
        e:p-b-----
        d:----PP--
        c:--PP-NPB
        b:PP-----P
        a:RNBQK--R
        */
        const state = BinaryBoard.parse('r1b1k1nr/1ppp1ppp/2n1pq2/p1b5/4PP2/2PP1NPB/PP5P/RNBQK2R w KQkq - 0 8')
        const moves = getCastlingMoves(state, white)
        expect(moves.length).toBe(1)
    })
})