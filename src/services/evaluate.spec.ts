import { FEN, getPiece } from "./FEN"
import { EvaluateOptions, evaluate, rootNegaMax } from "./ai"

describe('evaluate', () => {
    it('new evaluate - all', () => {
        const state = FEN.parse('rnbqkbnr/pppppp1p/8/6p1/7P/8/PPPPPPP1/RNBQKBNR w KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: false
        }
        const result = evaluate(state, options)

        expect(result).toEqual(0)
    })
    it('new evaluate - black less pawn', () => {
        const state = FEN.parse('rnbqkbnr/pppppp1p/8/6P1/8/8/PPPPPPP1/RNBQKBNR w KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: false
        }
        const result = evaluate(state, options)

        expect(result).toEqual(15)
    })
    it('evaluate pawn position score', () => {
        const expectedScore = 1 * (8 * 1)
        const state = FEN.parse('8/8/8/8/8/8/PPPPPPPP/8 w KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: false,
            pawnAdvancement: true,
            mobility: false,
            random: false
        }
        const result = evaluate(state, options)
        expect(result).toEqual(expectedScore)
    })
    it('evaluate pawn position score (better to advance)', () => {
        /*
h:rnbqkbnr
g:pppppppp
f:--------        
e:--------
d:--------
c:--------
b:PPPPPPPP
a:RNBQKBNR
--01234567
        */
        const state = FEN.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: true,
            mobility: false,
            random: false
        }
        const result = rootNegaMax(state, 1, options)
        expect(getPiece(state, result.bestMove.from).type).toEqual('p')
    })
    it('evaluate (dont sacrifice pawn for advancement)', () => {
        /*
h:rnbqkbnr
g:ppppp---
f:--------        
e:-----p-p
d:-----P-p
c:---BP--N
b:PPPP--P-
a:RNBQK--R
--01234567
        */
        const state = FEN.parse('rnbqkbnr/ppppp3/8/5p1p/5P1p/3BP2N/PPPP2P1/RNBQK2R b KQkq - 0 5')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: true,
            mobility: false,
            random: false
        }
        const result = rootNegaMax(state, 1, options)
        console.log(result)
        expect(result.bestMove.to.toString()).toEqual('f4')
    })
})