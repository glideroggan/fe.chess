import { FEN, getPiece } from "./FEN"
import { EvaluateOptions, MoveNode, capturePoints, constructNodeChain, evaluate, rootNegaMax } from "./ai"
import { getMoves } from "./moves"
import { Pos } from "./utils"
import { negaMax } from "./zeroSum"

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
    it('new evaluate - case 1', () => {
        const state = FEN.parse('k7/1P6/8/8/8/8/8/K7 b KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: false
        }
        const result = evaluate(state, options)

        expect(result).toEqual(150)
    })
    it('new evaluate - case 2', () => {
        const state = FEN.parse('8/1k6/8/8/8/8/8/K7 b KQkq - 0 1')
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

        expect(result).toEqual(capturePoints.pawn)
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
        // const result = rootNegaMax(state, 1, options)
        // expect(getPiece(state, result.bestMove.from).type).toEqual('p')
    })
})


const explore = (n: MoveNode, store: any, comparer?: ((a: MoveNode, b: MoveNode) => number)) => {
    if (n == null) return
    store.maxPaths = Math.max(store.maxPaths, n.moves.length)
    if (store.f !== undefined) store.f(n)
    if (comparer == undefined) {
        for (const m of n.moves) {
            store.leafs++
            explore(m, store)
        }
    } else {
        // sort by score
        const sorted = n.moves.filter(a => a != null).sort(comparer)
        explore(sorted[0], store, comparer)
    }

}
describe('test', () => {
    //     it('constructNodeChain (correct depth and explored all paths)', () => {
    //         /*
    // h:k-------
    // g:--------
    // f:--------        
    // e:--------
    // d:--------
    // c:--------
    // b:--------
    // a:K-------
    // --01234567
    // */
    //         const state = FEN.parse('k7/8/8/8/8/8/8/K7 w KQkq - 0 1')
    //         // const options: EvaluateOptions = {
    //         //     pieceValue: true,
    //         //     pawnAdvancement: true,
    //         //     mobility: false,
    //         //     random: false
    //         // }
    //         const rootNode: MoveNode = constructNodeChain(state, 3, 1)
    //         let n = rootNode

    //         const store = {
    //             maxDepth: 0,
    //             maxPaths: 0,
    //             leafs: 0,
    //             f: (n: MoveNode) => {
    //                 // if (n.moveToGetHere != null) {
    //                 //     const c = n.color == -1 ? 'black' : 'white'
    //                 //     console.log(`${c}: ${n.moveToGetHere?.toString()}`)
    //                 // }

    //             }
    //         }
    //         explore(n, store)

    //         expect(store.maxPaths).toEqual(8)
    //     })
    //     it('negamax (correct depth and explored all paths)', () => {
    //         /*
    // h:k-------
    // g:--------
    // f:--------        
    // e:--------
    // d:--------
    // c:--------
    // b:--------
    // a:K-------
    // --01234567
    // */
    //         const state = FEN.parse('k7/8/8/8/8/8/8/K7 w KQkq - 0 1')
    //         const options: EvaluateOptions = {
    //             pieceValue: true,
    //             pawnAdvancement: true,
    //             mobility: false,
    //             random: false
    //         }
    //         const rootNode: MoveNode = constructNodeChain(state, 2, -1)
    //         const result = negaMax(rootNode, options)

    //         const store = {
    //             maxDepth: 0,
    //             maxPaths: 0,
    //             leafs: 0,
    //             f: (n: MoveNode) => {
    //                 // console.log(n.moveToGetHere?.toString())
    //             }
    //         }
    //         // explore(rootNode, 1, store, (a, b) => a.score - b.score)
    //         expect(Math.abs(result)).toBe(0)
    //     })
    const printOut = (n: MoveNode) => {
        if (n.parentMove != null) {
            const c = n.color == 1 ? 'black' : 'white'
            console.log(`${c}: ${n.parentMove?.toString()} (${n.score}) - ${n.state})`)
        }
    }
    it('negamax (correct move)', () => {
        /*
h:k-------
g:-P------
f:--------        
e:--------
d:--------
c:--------
b:--------
a:K-------
--01234567
*/
        const state = FEN.parse('k7/1P6/8/8/8/8/8/K7 b KQkq - 0 1')
        const options: EvaluateOptions = {
            pawnAdvancement: false,
            mobility: false,
            random: false
        }
        const store = {
            maxDepth: 0,
            maxPaths: 0,
            leafs: 0,
            f: printOut
        }
        const rootNode: MoveNode = constructNodeChain(state, 1, -1)
        const result = negaMax(rootNode, options)
        // explore(rootNode, store)

        const max = rootNode.moves.reduce((acc, cur) => acc.score > cur.score ? acc : cur)
        // console.log('max:', max)
        expect(max.parentMove.from.toString()).toBe(Pos.parse('h0').toString())
        expect(max.parentMove.to.toString()).toBe(Pos.parse('g1').toString())
    })
    it('negamax white (correct move)', () => {
        /*
h:K-------
g:-p------
f:--------        
e:--------
d:--------
c:--------
b:--------
a:k-------
--01234567
*/
        const state = FEN.parse('K7/1p6/8/8/8/8/8/k7 w KQkq - 0 1')
        const options: EvaluateOptions = {
            pawnAdvancement: false,
            mobility: false,
            random: false
        }
        const store = {
            maxDepth: 0,
            maxPaths: 0,
            leafs: 0,
            f: printOut
        }
        const rootNode: MoveNode = constructNodeChain(state, 1, state.currentPlayer == 'white' ? 1 : -1)
        const result = negaMax(rootNode, options)
        // explore(rootNode, store)

        const max = rootNode.moves.reduce((acc, cur) => acc.score > cur.score ? acc : cur)
        console.log('max:', max)
        expect(max.parentMove.from.toString()).toBe(Pos.parse('h0').toString())
        expect(max.parentMove.to.toString()).toBe(Pos.parse('g1').toString())
    })
    // it('can you move?', () => {
    //     const state = FEN.parse('rnbqkbnr/ppppp3/8/5p1p/5P1p/3BP2N/PPPP2P1/RNBQK2R b KQkq - 0 5')
    //     getMoves(state, Pos.parse('g4'))
    // })
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
        const state = FEN.parse('rnbqkbnr/ppppp3/8/5p1p/5P1p/3BP2N/PPPP2P1/RNBQK2R b KQkq - 0 5')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: true,
            mobility: false,
            random: false
        }
        const rootNode: MoveNode = constructNodeChain(state, 2, -1)
        const result = negaMax(rootNode, options)

        const store = {
            maxDepth: 0,
            maxPaths: 0,
            leafs: 0,
            f: printOut
        }
        // explore(rootNode, store)
        const max = rootNode.moves.reduce((acc, cur) => acc.score > cur.score ? acc : cur)
        // console.log('max:', `${max.parentMoveDisplay} (${max.score})`)
        expect(max.parentMove.from.toString()).toBe(Pos.parse('h0').toString())
        expect(max.parentMove.to.toString()).toBe(Pos.parse('g1').toString())
    })
    //     it('evaluate (dont sacrifice pawn for advancement)', () => {
    //         /*
    // h:rnbqkbnr
    // g:ppppp---
    // f:--------        
    // e:-----p-p
    // d:-----P-p
    // c:---BP--N
    // b:PPPP--P-
    // a:RNBQK--R
    // --01234567
    //         */
    //         const state = FEN.parse('rnbqkbnr/ppppp3/8/5p1p/5P1p/3BP2N/PPPP2P1/RNBQK2R b KQkq - 0 5')
    //         const options: EvaluateOptions = {
    //             pieceValue: true,
    //             pawnAdvancement: true,
    //             mobility: false,
    //             random: false
    //         }
    //         const rootNode = constructNodeChain(state, 2, -1)
    //         console.log(rootNode)
    //         const result = negaMax(rootNode, 1, -1, options)
    //         console.log(result)
    //         // expect(result.bestMove.from.toString()).toEqual('g4')
    //         // expect(result.bestMove.to.toString()).toEqual('f4')
    //     })
})