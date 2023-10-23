import { MoveNode, constructNodeChain, rootNegaMax } from "../services/ai"
import { BinaryBoard } from "../services/binaryBoard"
import { EvaluateOptions } from "../services/evaluation"
import { Pos } from "../services/utils"
import { negaMax } from "../services/zeroSum"

describe('Long test', () => {
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
        const state = BinaryBoard.parse('rnbqkbnr/ppppp3/8/5p1p/5P1p/3BP2N/PPPP2P1/RNBQK2R b KQkq - 0 5')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: true,
            mobility: false,
            random: false
        }
        const rootNode = constructNodeChain(state, 2, -1)
        const result = negaMax(rootNode, options)
        // expect(result.bestMove.from.toString()).toEqual('g4')
        // expect(result.bestMove.to.toString()).toEqual('f4')
    })
    it('negamax (correct move, protect pawn)', () => {
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
c3e5
protect with h6f7 or g4f4
*/
        const state = BinaryBoard.parse('rnbqkbnr/ppppp3/8/5p1p/5P1p/3BP2N/PPPP2P1/RNBQK2R b KQkq - 0 5')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: true,
            mobility: true,
            random: false,
        }
        // const rootNode: MoveNode = constructNodeChain(state, 2, -1)
        const result = rootNegaMax(state, 3, options)

        // explore(result.root, store)
        // const max = rootNode.moves.reduce((acc, cur) => acc.score > cur.score ? acc : cur)
        // console.log('max:', `${max.parentMoveDisplay} (${max.score})`)
        // console.log(result)
        expect(result.bestMove.from.toString()).toBe(Pos.parse('g4').toString())
        expect(result.bestMove.to.toString()).toBe(Pos.parse('f4').toString())
    })
})