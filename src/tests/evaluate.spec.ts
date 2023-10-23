import { MoveNode, constructNodeChain, explore, printOut, rootNegaMax } from "../services/ai"
import { BinaryBoard, white } from "../services/binaryBoard"
import { EvaluateOptions, capturePoints, evaluate } from "../services/evaluation"
import { Pos } from "../services/utils"
import { negaMax } from "../services/zeroSum"

describe('evaluate', () => {
    it('new evaluate - all', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppp1p/8/6p1/7P/8/PPPPPPP1/RNBQKBNR w KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: false,
            mobility: false,
        }
        const result = evaluate(state, options)

        expect(result).toEqual(0)
    })
    it('new evaluate - all 2', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppp1ppp/8/4p3/8/4P3/PPPP1PPP/RNBQKBNR w KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: false,
            pawnAdvancement: true,
            mobility: false,
        }
        const result = evaluate(state, options)

        expect(result).toEqual(0)
    })
    it('new evaluate - case 1', () => {
        const state = BinaryBoard.parse('k7/1P6/8/8/8/8/8/K7 b KQkq - 0 1')
        // console.log(state.boardData.data)
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: false,
            mobility: false,
        }
        const result = evaluate(state, options)

        expect(result).toEqual(150)
    })
    it('new evaluate - case 2', () => {
        const state = BinaryBoard.parse('8/1k6/8/8/8/8/8/K7 b KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: false,
            mobility: false,
        }
        const result = evaluate(state, options)

        expect(result).toEqual(0)
    })
    it('new evaluate - black less pawn', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppp1p/8/6P1/8/8/PPPPPPP1/RNBQKBNR w KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: false,
            mobility: false,

        }
        const result = evaluate(state, options)

        expect(result).toEqual(capturePoints.pawn)
    })
    it('evaluate pawn position score - 8/8/8/8/8/8/PPPPPPPP/8 w KQkq - 0 1', () => {
        const expectedScore = 0
        const state = BinaryBoard.parse('8/8/8/8/8/8/PPPPPPPP/8 w KQkq - 0 1')
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
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: true,
            mobility: false,
            random: false
        }
        // const result = rootNegaMax(state, 1, options)
        // expect(getPiece(state, result.bestMove.from).type).toEqual('p')
    })
    //     it('board study - 1nb1k1nr/1pp2ppp/3p4/r3p3/1PP2qP1/N4N1P/P2P1K2/R1B2B1R b KQkq - 0 14', () => {
    //         /*
    // h:-nb-k-nr
    // g:-pp--ppp
    // f:---p----  
    // e:r---p---
    // d:-PP--qP-
    // c:N----N-P
    // b:P--P-K--
    // a:R-B--B-R
    // --01234567
    // e0xc0
    // */
    //         const state = BinaryBoard.parse('1nb1k1nr/1pp2ppp/3p4/r3p3/1PP2qP1/N4N1P/P2P1K2/R1B2B1R b KQkq - 0 14')
    //         const options: EvaluateOptions = {
    //             pieceValue: true,
    //             pawnAdvancement: true,
    //             mobility: true,
    //             random: false,
    //             scoreComparer: (a, b) => a.score - b.score
    //         }
    //         // const node = constructNodeChain(state, 2, -1)
    //         const result = rootNegaMax(state, 2, options)
    //         const max = result.root.moves.reduce((acc, cur) => acc.score > cur.score ? acc : cur)
    //         const store = {
    //             maxDepth: 0,
    //             maxPaths: 0,
    //             leafs: 0,
    //             f: printOut
    //         }
    //         // explore(result.root, store, (a, b) => a.score - b.score)
    //         // console.log('max:', max)

    //         expect(result.bestScore).toEqual(-355)
    //     })
    it('board study - rn1Q2nr/1pN2kp1/4b3/p5Bp/1b6/8/PPqN1PPP/3RK2R b KQkq - 0 17', () => {
        /*
h:rn-Q--nr
g:-pN--kp-
f:----b---  
e:p-----Bp
d:-b------
c:--------
b:PPqN-PPP
a:---RK--R
--01234567
b2d4
*/
        const state = BinaryBoard.parse('rn1Q2nr/1pN2kp1/4b3/p5Bp/1b6/8/PPqN1PPP/3RK2R b KQkq - 0 17')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: true,
            mobility: true,
            random: false,
        }
        // const node = constructNodeChain(state, 2, -1)
        const result = rootNegaMax(state, 2, options)
        const max = result.root.moves.reduce((acc, cur) => acc.score > cur.score ? acc : cur)
        const store = {
            maxDepth: 0,
            maxPaths: 0,
            leafs: 0,
            f: printOut
        }
        // explore(result.root, store, (a, b) => a.score - b.score)
        // console.log('max:', max)

        // expect(result.bestScore).toEqual(-355)
    })
})

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
        const state = BinaryBoard.parse('k7/1P6/8/8/8/8/8/K7 b KQkq - 0 1')
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
        const state = BinaryBoard.parse('K7/1p6/8/8/8/8/8/k7 w KQkq - 0 1')
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
        const rootNode: MoveNode = constructNodeChain(state, 1, state.currentPlayer == white ? 1 : -1)
        const result = negaMax(rootNode, options)
        // explore(rootNode, store)

        const max = rootNode.moves.reduce((acc, cur) => acc.score > cur.score ? acc : cur)
        // console.log('max:', max)
        expect(max.parentMove.from.toString()).toBe(Pos.parse('h0').toString())
        expect(max.parentMove.to.toString()).toBe(Pos.parse('g1').toString())
    })
    // it('can you move?', () => {
    //     const state = FEN.parse('rnbqkbnr/ppppp3/8/5p1p/5P1p/3BP2N/PPPP2P1/RNBQK2R b KQkq - 0 5')
    //     getMoves(state, Pos.parse('g4'))
    // })

    it('better score with protection', () => {
        /*
h:rn--k-nr
g:pQ---ppp
f:--------        
e:---Bp-b-
d:----P---
c:--P--q--
b:PP-P-P-P
a:RNB-KR--
--01234567
e6xb3
        */
        const state = BinaryBoard.parse('rnb1k1nr/2pp2p1/8/pp1P2Bp/6N1/P3Q3/5P1P/7K b KQkq - 0 27')
        const options: EvaluateOptions = {
            pieceValue: true,
        }
        const result = rootNegaMax(state, 1, options)
        let str = ''
        explore(result.root, {
            f: printOut,
            strCollector: (s: string) => str += s
        })
        // console.log(str)
        // console.log('score', result.bestScore)
        // console.log(`move: ${result.bestMove.toString()}`)
        expect(result.bestMove.from.toString()).toEqual('h6')
        expect(result.bestMove.to.toString()).toEqual('g4')
    })

    it('evaluate (is this a good move?)', () => {
        /*
h:rn--k-nr
g:pQ---ppp
f:--------        
e:---Bp-b-
d:----P---
c:--P--q--
b:PP-P-P-P
a:RNB-KR--
--01234567
e6xb3
        */
        const state = BinaryBoard.parse('rnb1k1nr/2pp2p1/8/pp1P2Bp/6N1/P3Q3/5P1P/7K b KQkq - 0 27')
        const options: EvaluateOptions = {
            pieceValue: true,
        }
        const result = rootNegaMax(state, 1, options)
        let str = ''
        explore(result.root, {
            f: printOut,
            strCollector: (s: string) => str += s
        })
        // console.log(str)
        // console.log('score', result.bestScore)
        // console.log(`move: ${result.bestMove.toString()}`)
        // expect(result.bestMove.from.toString()).toEqual('h4')
        // expect(result.bestMove.to.toString()).toEqual('g5')
    })
})
