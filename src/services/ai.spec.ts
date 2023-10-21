import { getSpecificPiece, getPiece } from "./FEN";
import { constructNodeChain, rootNegaMax } from "./ai";
import { BinaryBoard, black, king, knight, move, pawn, rook, undo, white } from "./binaryBoard";
import { EvaluateOptions, capturePoints, evaluate } from "./evaluation";
import { filterKingVulnerableMoves, getAllPossibleMoves, getMovesTowards } from "./moves";
import { getBishopMoves, getKingMoves, getKnightMoves, getPawnMoves, getQueenMoves, getRookMoves, isOutsideBoard } from "./pieceMoves";
import { Pos } from "./utils";
import { negaMax } from "./zeroSum";

describe('nothing', () => {
    it('nothing', () => {
        expect(true).toEqual(true)
    })
})

describe('Pos', () => {
    it('hmmm', () => {
        const state = BinaryBoard.parse('8/8/8/8/3P1P2/2P3P1/2R5/2P3P1 w KQkq - 0 1')
        const result = getPiece(state, Pos.parse('d3'))
        expect(result.color).toEqual(white)
        expect(result.type).toEqual(pawn)
        expect(result.pos.rank).toEqual('d')
        expect(result.pos.file).toEqual(3)
    })
    it('add', () => {
        const pos = Pos.from('a', 0)
        const result = pos.add(1, 1)
        expect(result.rank).toEqual('b')
        expect(result.file).toEqual(1)
        expect(result.x).toEqual(1)
        expect(result.y).toEqual(1)
    })
    it('fen2Pos', () => {
        const pos = Pos.from('a', 0)
        expect(pos.rank).toEqual('a')
        expect(pos.file).toEqual(0)
        expect(pos.x).toEqual(pos.file)
        expect(pos.y).toEqual(0)
    })
    it('from 1', () => {
        const pos = new Pos(0, 0)
        expect(pos).toEqual(Pos.from('a', 0))
    })
    it('from 2', () => {
        const pos = new Pos(1, 0)
        expect(pos).toEqual(Pos.from('a', 1))
    })
    it('from 3', () => {
        const pos = new Pos(1, 1)
        expect(pos).toEqual(Pos.from('b', 1))
    })
    it('from 4', () => {
        const pos = new Pos(0, 7)
        expect(pos).toEqual(Pos.from('h', 0))
    })
    it('from 5', () => {
        const pos = new Pos(0, 3)
        expect(pos).toEqual(Pos.from('d', 0))
    })
    it('from 6', () => {
        const pos = Pos.from('a', 1)
        const result = pos.add(2, 1)
        expect(result).toEqual(Pos.from('c', 2))
    })
    it('from (x is fine, file throws)', () => {
        const result = new Pos(8, 1)
        expect(result.x).toEqual(8)
        expect(() => result.file).toThrow()
    })
    it('from (y is fine, rank throws)', () => {
        const result = new Pos(1, 8)
        expect(result.y).toEqual(8)
        expect(() => result.rank).toThrow()
    })
    it('pos (reading rank with negative)', () => {
        const result = new Pos(1, -1)
        expect(result.y).toEqual(-1)
        expect(() => result.rank).toThrow()
    })
    it('pos (reading file with negative)', () => {
        const result = new Pos(-1, 0)
        expect(result.x).toEqual(-1)
        expect(() => result.file).toThrow()
    })
    it('from 11', () => {
        const result = Pos.from('a', -1)
        expect(result.x).toEqual(-1)
        expect(result.rank).toEqual('a')
        expect(result.y).toEqual(0)
        expect(() => result.file).toThrow()
    })
    it('from (throw 6)', () => {
        expect(() => Pos.from('', 1)).toThrow()
    })
})

describe('getPiece', () => {
    it('getPiece a0', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.parse('a0')
        const result = getPiece(state, pos)
        expect(result.color).toEqual(white)
        expect(result.type).toEqual(rook)
        expect(result.pos.rank).toEqual('a')
    })
    it('getPiece', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.parse('h0')
        let result = getPiece(state, pos)
        // expect(result).toEqual({ color: black, type: 'r', pos: pos,num:rook })
        expect(result.color).toEqual(black)
        expect(result.type).toEqual(rook)
        expect(result.pos.toString()).toEqual('h0')
        result = getPiece(state, Pos.parse('a0'))
        // expect(result).toEqual({ color: white, type: 'R', pos: Pos.parse('a0'), num: rook })
        expect(result.color).toEqual(white)
        expect(result.type).toEqual(rook)
        expect(result.pos.toString()).toEqual('a0')
        result = getPiece(state, Pos.parse('b3'))
        // expect(result).toEqual({ color: white, type: 'P', pos: Pos.parse('b3'), num: pawn })
        expect(result.color).toEqual(white)
        expect(result.type).toEqual(pawn)
        expect(result.pos.toString()).toEqual('b3')
        result = getPiece(state, Pos.parse('c0'))
        expect(result).toEqual(null)
    })
    it('getPiece h4', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.parse('h4')
        const result = getPiece(state, pos)
        // expect(result).toEqual({ color: black, type: 'k', pos: pos, num: 1 })
        expect(result.color).toEqual(black)
        expect(result.type).toEqual(king)
        expect(result.pos.toString()).toEqual('h4')
    })
    it('getPiece a4', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('a', 4)
        const result = getPiece(state, pos)
        // expect(result).toEqual({ color: white, type: 'K', pos: pos, num: 1 })
        expect(result.color).toEqual(white)
        expect(result.type).toEqual(king)
        expect(result.pos.toString()).toEqual('a4')
    })
})
describe('positioning', () => {
    it('isOutsideBoard (inside)', () => {
        const pos = Pos.from('a', 0)
        const result = isOutsideBoard(pos);
        expect(result).toEqual(false);
    })
    it('isOutsideBoard (x>)', () => {
        const pos = Pos.from('a', 8)
        const result = isOutsideBoard(pos);
        expect(result).toEqual(true);
    })
    it('isOutsideBoard (x<)', () => {
        const pos = Pos.from('a', -1)

        const result = isOutsideBoard(pos);
        expect(result).toEqual(true);
    })
})

describe('ai', () => {
    it('evaluate 0', () => {
        const state = BinaryBoard.parse('8/8/8/8/8/8/8/8 w KQkq - 0 1')
        const options: EvaluateOptions = {
            mobility: false,
            pawnAdvancement: false,
            pieceValue: true
        }
        const result = evaluate(state, options)
        expect(result).toEqual(0)
    })
    it('evaluate 900', () => {
        const state = BinaryBoard.parse('8/8/8/8/8/8/8/K7 w KQkq - 0 1')
        const options: EvaluateOptions = {
            mobility: false,
            pawnAdvancement: false,
            pieceValue: true
        }
        const result = evaluate(state, options)
        expect(result).toEqual(capturePoints.king)
    })
    it('evaluate 900-900', () => {
        const state = BinaryBoard.parse('k7/8/8/8/8/8/8/K7 w KQkq - 0 1')
        const options: EvaluateOptions = {
            mobility: false,
            pawnAdvancement: false,
            pieceValue: true
        }
        const result = evaluate(state, options)
        expect(result).toEqual(0)
    })
    it('evaluate 900-900', () => {
        const state = BinaryBoard.parse('k7/8/8/8/8/8/8/K7 w KQkq - 0 1')
        const options: EvaluateOptions = {
            mobility: false,
            pawnAdvancement: false,
            pieceValue: true
        }
        const result = evaluate(state, options)
        expect(result).toEqual(0)
    })
})

describe('FEN', () => {
    it('getKing 1', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const result = getSpecificPiece(state, king | black)
        expect(result).toEqual(Pos.parse('h4'))
    })
    it('getKing 2', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const result = getSpecificPiece(state, king | white)
        expect(result).toEqual(Pos.from('a', 4))
    })
    it('movePiece 1', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const from = Pos.parse('b0')
        const to = Pos.parse('c0')
        move(state, from, to)
        expect(state.boardData.getFullBoard).toEqual('rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq - 0 1')
    })
    it('movePiece 1.1', () => {
        /*
         d:--------
         c:--------
         b:PPPPPPPP
         a:--------
         --01234567
         b1c1
         */
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const from = Pos.parse('b1')
        const to = Pos.parse('c1')
        move(state, from, to)
        expect(state.boardData.getFullBoard).toEqual('rnbqkbnr/pppppppp/8/8/8/1P6/P1PPPPPP/RNBQKBNR b KQkq - 0 1')
    })
    it('movePiece 2', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq - 0 1')
        const from = Pos.parse('g1')
        const to = Pos.parse('e1')
        move(state, from, to)
        expect(state.boardData.getFullBoard).toEqual('rnbqkbnr/p1pppppp/8/1p6/8/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 2')
    })
    it('movePiece 3', () => {
        const state = BinaryBoard.parse('rnbqkbnr/p1pppppp/8/1p6/8/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 2')
        const from = Pos.parse('c0')
        const to = Pos.parse('d0')
        move(state, from, to)
        expect(state.boardData.getFullBoard).toEqual('rnbqkbnr/p1pppppp/8/1p6/P7/8/1PPPPPPP/RNBQKBNR b KQkq - 0 2')
    })
    it('movePiece 4', () => {
        const state = BinaryBoard.parse('rnbqkbnr/p1pppppp/8/1p6/P7/8/1PPPPPPP/RNBQKBNR b KQkq - 0 2')
        const from = Pos.from('e', 1)
        const to = Pos.from('d', 0)
        move(state, from, to)
        expect(state.boardData.getFullBoard).toEqual('rnbqkbnr/p1pppppp/8/8/p7/8/1PPPPPPP/RNBQKBNR w KQkq - 0 3')
    })
    it('togglePlayerTurn', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        state.toggleTurn()
        expect(state.boardData.getFullBoard).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1')
    })
    it('increaseFullmoveNumber 1', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const result = state.increaseTurns()
        expect(state.boardData.getFullBoard).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 2')
    })
    it('increaseFullmoveNumber 10', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 9')
        const result = state.increaseTurns()
        expect(state.boardData.getFullBoard).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 10')
    })
    it('undo (once)', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const from = Pos.parse('b0')
        const to = Pos.parse('c0')
        move(state, from, to)
        undo(state)
        expect(state.boardData.getFullBoard).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    })
    it('undo (last step)', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        let from = Pos.from('b', 0)
        let to = Pos.from('c', 0)
        move(state, from, to)
        from = Pos.from('c', 0)
        to = Pos.from('d', 0)
        move(state, from, to)
        undo(state)
        expect(state.boardData.getFullBoard).toEqual('rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq - 0 1')
    })
    it('undo (two times)', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        let from = Pos.from('b', 0)
        let to = Pos.from('c', 0)
        move(state, from, to)
        from = Pos.from('c', 0)
        to = Pos.from('d', 0)
        move(state, from, to)
        undo(state)
        undo(state)
        expect(state.boardData.getFullBoard).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    })
    it('undo (error)', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        let from = Pos.from('b', 0)
        let to = Pos.from('c', 0)
        move(state, from, to)
        from = Pos.from('c', 0)
        to = Pos.from('d', 0)
        undo(state)
        expect(() => undo(state)).toThrow()
    })
});

describe('moves pawn', () => {
    it('getPawnMoves white', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.parse('b0')
        const result = getPawnMoves(state, white, pos)
        expect(result).toEqual([Pos.from('c', 0), Pos.from('d', 0)])
    })
    it('getPawnMoves white attack', () => {
        const state = BinaryBoard.parse('rnbqkbnr/p1pppppp/8/8/8/1p6/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.parse('b0')
        const result = getPawnMoves(state, white, pos)
        expect(result).toEqual([Pos.from('c', 0), Pos.from('d', 0), Pos.from('c', 1)])
    })
    it('getPawnMoves not a pawn', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.parse('a1')
        expect(() => getPawnMoves(state, white, pos)).toThrow()
    })
    it('getPawnMoves black', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.parse('g0')
        const result = getPawnMoves(state, black, pos)
        expect(result).toEqual([Pos.from('f', 0), Pos.from('e', 0)])
    })
    it('getPawnMoves black attack', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/1P6/8/8/8/P1PPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.parse('g0')
        const result = getPawnMoves(state, black, pos)
        expect(result).toEqual([Pos.from('f', 0), Pos.from('e', 0), Pos.from('f', 1)])
    })
})

describe('moves rook', () => {
    it('getRookMoves white', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('a', 0)
        const result = getRookMoves(state, white, pos)
        expect(result).toEqual([])
    })
    it('getRookMoves white attack', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/1p6/8/1R1P4/PPPPPPPP/1NBQKBNR w KQkq - 0 1')
        const pos = Pos.from('c', 1)
        const result = getRookMoves(state, white, pos)
        expect(result).toEqual([
            Pos.from('d', 1), Pos.from('e', 1),
            Pos.from('c', 2), Pos.from('c', 0)
        ])
    })
    it('getRookMoves not a rook', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('b', 0)
        expect(() => getRookMoves(state, white, pos)).toThrow()
    })
    it('getRookMoves black', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('h', 0)
        const result = getRookMoves(state, black, pos)
        expect(result).toEqual([])
    })
    it('getRookMoves black attack', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/1r1p/8/1P7/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('f', 1)
        const result = getRookMoves(state, black, pos)
        expect(result).toContainEqual(Pos.from('e', 1))
        expect(result).toContainEqual(Pos.from('d', 1))
        expect(result).toContainEqual(Pos.from('f', 0))
        expect(result).toContainEqual(Pos.from('f', 2))
    })
})

describe('moves knight', () => {
    it('getKnightMoves white', () => {
        /*
        d:--------
        c:*-*-----
        b:PPPPPPPP
        a:RNBQKBNR
        --01234567
        */
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('a', 1)
        const result = getKnightMoves(state, white, pos)
        expect(result).toHaveLength(2)
        expect(result).toContainEqual(Pos.from('c', 2))
        expect(result).toContainEqual(Pos.from('c', 0))
    })
    it('getKnightMoves white attack', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/p1p5/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('a', 1)
        const result = getKnightMoves(state, white, pos)
        expect(result).toContainEqual(Pos.from('c', 2))
        expect(result).toContainEqual(Pos.from('c', 0))
    })
    it('getKnightMoves not a knight', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('a', 0)
        expect(() => getKnightMoves(state, white, pos)).toThrow()
    })
    it('getKnightMoves black', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('h', 1)
        const result = getKnightMoves(state, black, pos)
        expect(result).toContainEqual(Pos.from('f', 2))
        expect(result).toContainEqual(Pos.from('f', 0))
    })
    it('getKnightMoves black attack', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/P1P5/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('h', 1)
        const result = getKnightMoves(state, black, pos)
        expect(result).toContainEqual(Pos.from('f', 0))
        expect(result).toContainEqual(Pos.from('f', 2))
    })
})

describe('moves bishop', () => {
    it('getBishopMoves white', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('a', 2)
        const result = getBishopMoves(state, white, pos)
        expect(result).toEqual([])
    })
    it('getBishopMoves white attack', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/1ppp4/PPBPPPPP/RN1QKBNR w KQkq - 0 1')
        const pos = Pos.from('b', 2)
        const result = getBishopMoves(state, white, pos)
        expect(result).toContainEqual(Pos.from('c', 1))
        expect(result).toContainEqual(Pos.from('c', 3))
    })
    it('getBishopMoves not a bishop', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('a', 0)
        expect(() => getBishopMoves(state, black, pos)).toThrow()
    })
    it('getBishopMoves black', () => {
        const state = BinaryBoard.parse('rnbqkbnr/bppppppp/P7/2p5/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('g', 0)
        const result = getBishopMoves(state, black, pos)
        expect(result).toHaveLength(1)
        expect(result).toContainEqual(Pos.from('f', 1))
    })
    it('getBishopMoves black attack', () => {
        /*
        g:bppppppp
        f:P\------
        e:--P-----
        */
        const state = BinaryBoard.parse('rnbqkbnr/bppppppp/P7/2P5/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('g', 0)
        const result = getBishopMoves(state, black, pos)
        expect(result).toHaveLength(2)
        expect(result).toContainEqual(Pos.from('f', 1))
        expect(result).toContainEqual(Pos.from('e', 2))
    })
})

describe('moves queen', () => {
    it('getQueenMoves white', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('a', 3)
        const result = getQueenMoves(state, white, pos)
        expect(result).toEqual([])
    })
    it('getQueenMoves white attack', () => {
        /*
        h:--------
        g:--------
        f:--------
        e:--------
        d:-p---P--
        c:--\P/---
        b:--PQ-p--
        a:--PPP---
        */
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/1p3P2/3P4/2PQ1p2/2PPP3 w KQkq - 0 1')
        const pos = Pos.from('b', 3)
        const result = getQueenMoves(state, white, pos)

        expect(result).toHaveLength(5)
        expect(result).toContainEqual(Pos.from('b', 5))
        expect(result).toContainEqual(Pos.from('b', 4))
        expect(result).toContainEqual(Pos.from('c', 4))
        expect(result).toContainEqual(Pos.from('c', 2))
        expect(result).toContainEqual(Pos.from('d', 1))
    })
    it('getQueenMoves not a queen', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('a', 0)
        expect(() => getQueenMoves(state, white, pos)).toThrow()
    })
    it('getQueenMoves black', () => {
        /*
        h:--------
        g:--------
        f:--------
        e:-p-p-p--
        d:--\-/---
        c:-p-q-p--
        b:--/-\---
        a:-p-p-p--
        */
        const state = BinaryBoard.parse('8/8/8/1p1p1p2/8/1p1q1p2/8/1p1p1p2 w KQkq - 0 1')
        const pos = Pos.from('c', 3)
        const result = getQueenMoves(state, black, pos)
        expect(result).toHaveLength(8)
        expect(result).toContainEqual(Pos.from('d', 2))
        expect(result).toContainEqual(Pos.from('d', 3))
        expect(result).toContainEqual(Pos.from('d', 4))
        expect(result).toContainEqual(Pos.from('c', 2))
        expect(result).toContainEqual(Pos.from('c', 4))
        expect(result).toContainEqual(Pos.from('b', 2))
        expect(result).toContainEqual(Pos.from('b', 3))
        expect(result).toContainEqual(Pos.from('b', 4))
    })
    it('getQueenMoves black attack', () => {
        /*
        g:qppppppp
        f:P\------
        e:--P-----
        */
        const state = BinaryBoard.parse('rnbqkbnr/qppppppp/P7/2P5/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('g', 0)
        const result = getQueenMoves(state, black, pos)
        expect(result).toHaveLength(3)
        expect(result).toContainEqual(Pos.from('f', 0))
        expect(result).toContainEqual(Pos.from('f', 1))
        expect(result).toContainEqual(Pos.from('e', 2))
    })
})

describe('moves king', () => {
    it('getKingMoves white', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('a', 4)
        const result = getKingMoves(state, white, pos)
        expect(result).toEqual([])
    })
    it('getKingMoves white attack', () => {
        /*
        d:-p---P--
        c:--pPp---
        b:--PK-p--
        a:--PPP---
        */
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/1p3P2/2pPp3/2PK1p2/2PPP3 w KQkq - 0 1')
        const pos = Pos.from('b', 3)
        const result = getKingMoves(state, white, pos)

        expect(result).toHaveLength(3)
        expect(result).toContainEqual(Pos.from('b', 4))
        expect(result).toContainEqual(Pos.from('c', 2))
        expect(result).toContainEqual(Pos.from('c', 4))
    })
    it('getKingMoves not a king', () => {
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('a', 0)
        expect(() => getKingMoves(state, white, pos)).toThrow()
    })
    it('getKingMoves black', () => {
        /*
        e:-p-p-p--
        d:--\-/---
        c:-p-k-p--
        b:--/-\---
        a:-p-p-p--
        */
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/1p1p1p2/8/1p1k1p2/8/1p1p1p2 w KQkq - 0 1')
        const pos = Pos.from('c', 3)
        const result = getKingMoves(state, black, pos)
        expect(result).toHaveLength(8)
        expect(result).toContainEqual(Pos.from('d', 2))
        expect(result).toContainEqual(Pos.from('d', 3))
        expect(result).toContainEqual(Pos.from('d', 4))
        expect(result).toContainEqual(Pos.from('c', 2))
        expect(result).toContainEqual(Pos.from('c', 4))
        expect(result).toContainEqual(Pos.from('b', 2))
        expect(result).toContainEqual(Pos.from('b', 3))
        expect(result).toContainEqual(Pos.from('b', 4))
    })
    it('getKingMoves black attack', () => {
        /*
        g:kppppppp
        f:P\------
        e:--P-----
        */
        const state = BinaryBoard.parse('rnbqkbnr/kppppppp/P7/2P5/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        const pos = Pos.from('g', 0)
        const result = getKingMoves(state, black, pos)
        expect(result).toHaveLength(2)
        expect(result).toContainEqual(Pos.from('f', 0))
        expect(result).toContainEqual(Pos.from('f', 1))
    })
})
describe('rules', () => {
    it('getAllPossibleMoves 1', () => {
        /*
        d:kp---q--
        c:--\P/---
        b:--PQ-p--
        a:--PPPK--
        --01234567
        */
        const state = BinaryBoard.parse('8/8/8/8/kp3q2/3P4/2PQ1p2/2PPPK2 w KQkq - 0 1')
        const result = getAllPossibleMoves(state, white)
        expect(result).toContainEqual({ from: Pos.from('a', 4), to: Pos.from('b', 4) })
        expect(result).toContainEqual({ from: Pos.from('a', 4), to: Pos.from('b', 5) })

        expect(result).toContainEqual({ from: Pos.from('a', 5), to: Pos.from('b', 4) })
        expect(result).toContainEqual({ from: Pos.from('a', 5), to: Pos.from('b', 6) })
        expect(result).toHaveLength(13)

    })
    it('filterKingVulnerableMoves 2', () => {
        /*
        d:kp---q--
        c:--\P/---
        b:--PQ-p--
        a:--PPPK--
        */
        const state = BinaryBoard.parse('8/8/8/8/kp3q2/3P4/2PQ1p2/2PPPK2 w KQkq - 0 1')
        const piece = getPiece(state, Pos.from('a', 5))
        const moves = getKingMoves(state, white, Pos.from('a', 5))
        const result = filterKingVulnerableMoves(state, piece, moves)
        expect(result.danger).toHaveLength(2)
    })
    it('getMovesTowards 1', () => {
        /*
        d:-p---q--
        c:--\P/---
        b:--PQ-p--
        a:--PPP---
        */
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/1p3q2/3P4/2PQ1p2/2PPP3 b KQkq - 0 1')
        const targetPos = Pos.from('b', 3)
        const result = getMovesTowards(state, targetPos)
        expect(result).toEqual([
            { from: Pos.from('d', 5), to: Pos.from('b', 3) },

        ])
    })
    it('getMovesTowards (doesnt care about whos turn)', () => {
        /*
        d:-p---q--
        c:--\P/---
        b:--PQ-p--
        a:--PPP---
        */
        const state = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/1p3q2/3P4/2PQ1p2/2PPP3 w KQkq - 0 1')
        const targetPos = Pos.from('b', 3)
        const result = getMovesTowards(state, targetPos)
        expect(result).toEqual([
            { from: Pos.from('d', 5), to: Pos.from('b', 3) },

        ])
    })
    it('filterKingVulnerableMoves 1', () => {
        /*
        d:-p-qpp--
        c:--\P/---
        b:--PK-p--
        a:--PPP---
        */
        const state = BinaryBoard.parse('8/8/8/8/1p1qpp2/3P4/2PK1p2/2PPP3 w KQkq - 0 1')
        const piece = getPiece(state, Pos.from('c', 3))
        const moves = getPawnMoves(state, white, Pos.from('c', 3))
        expect(moves).toHaveLength(1)
        const result = filterKingVulnerableMoves(state, piece, moves)
        expect(result.valid).toEqual([])
    })
})
describe('evaluation', () => {
    it('evaluate pawn advancement (moving forward is good)', () => {
        /*
h:--------
g:--------    
f:--------        
e:--------   
d:P-------
c:--------
b:-PPPPPPP
a:--------
--01234567
*/
        //b   c   d
        const expectedScore = 7 * 0 + 3
        const state = BinaryBoard.parse('8/8/8/8/P7/8/1PPPPPPP/8 w KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: false,
            pawnAdvancement: true,
            mobility: false
        }
        const result = evaluate(state, options)
        expect(result).toEqual(expectedScore)
    })

    it('evaluate pawn position score (black)', () => {
        const expectedScore = 0
        const state = BinaryBoard.parse('8/pppppppp/8/8/8/8/8/8 b KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: false,
            pawnAdvancement: true,
            mobility: false
        }
        const result = evaluate(state, options)
        expect(result).toEqual(expectedScore)
    })
    it('evaluate pawn position score (black-advancing)', () => {
        const expectedScore = (8 * 2)
        const state = BinaryBoard.parse('8/8/pppppppp/8/8/8/8/8 b KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: false,
            pawnAdvancement: true,
            mobility: false
        }
        const result = evaluate(state, options)
        expect(result).toEqual(-expectedScore)
    })
    it('evaluate pawn position score (black-advancing 2)', () => {
        // h:--------
        // g:--------
        // f:ppppppp-
        // e:--------
        // d:-------p
        // c:--------
        // b:--------
        // a:--------
        // --01234567
        const expectedScore = (7 * 2) + (1 * 4)
        const state = BinaryBoard.parse('8/8/ppppppp1/8/7p/8/8/8 b KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: false,
            pawnAdvancement: true,
            mobility: false,
            random: false
        }
        const result = evaluate(state, options)
        expect(result).toEqual(-expectedScore)
    })

    it('evaluate mobility pawn', () => {
        /*
        h:--------
        g:--------    
        f:--------        
        e:--------   
        d:--------
        c:--------
        b:PPPPPPPP
        a:--------
        --01234567
        */
        const expectedScore = 1 * 2
        const state = BinaryBoard.parse('8/8/8/8/8/8/7P/8 w KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: false,
            pawnAdvancement: false,
            mobility: true
        }
        const result = evaluate(state, options)
        // console.log(result)
        expect(result).toEqual(expectedScore)
    })
    it('evaluate mobility pawn 2', () => {
        /*
        h:--------
        g:--------    
        f:--------        
        e:--------   
        d:--------
        c:--------
        b:PPPPPPPP
        a:--------
        --01234567
        */
        const expectedScore = 8 * 2
        const state = BinaryBoard.parse('8/8/8/8/8/8/PPPPPPPP/8 w KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: false,
            pawnAdvancement: false,
            mobility: true
        }
        const result = evaluate(state, options)
        // console.log(result)
        expect(result).toEqual(expectedScore)
    })
    it('evaluate mobility pawn (no move)', () => {
        const expectedScore = (0)
        const state = BinaryBoard.parse('PPPPPPPP/8/8/8/8/8/8/8 w KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: false,
            pawnAdvancement: false,
            mobility: true
        }
        const result = evaluate(state, options)
        expect(result).toEqual(expectedScore)
    })
    it('evaluate mobility knight', () => {
        /*
d:---P-P--
c:--P---P-
b:----N---
a:--P---P-
--01234567
*/                        //knight pawns
        const expectedScore = (0) + (6 * 1)

        const state = BinaryBoard.parse('8/8/8/8/3P1P2/2P3P1/4N3/2P3P1 w KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: false,
            pawnAdvancement: false,
            mobility: true
        }
        const result = evaluate(state, options)
        expect(result).toEqual(expectedScore)
    })
    it('evaluate mobility rook', () => {
        /*
        h:k-------
        g:--------    
        f:--------        
        e:---*-*--   
        d:--*P-P*-
        c:--P---P-
        b:**R***x*
        a:-KP---P-
        --01234567
        */
        const expectedScore =
            // rook
            (1 * 7) +
            // pawns
            (5 * 1)

        const state = BinaryBoard.parse('k7/8/8/8/3P1P2/2P3P1/2R5/1KP3P1 w KQkq - 0 1')
        // console.log(state.boardData)
        const options: EvaluateOptions = {
            pieceValue: false,
            pawnAdvancement: false,
            mobility: true
        }
        const result = evaluate(state, options)
        // console.log('state', state.toString())
        expect(result).toEqual(expectedScore)
    })
})

describe('evaluation from history', () => {
    it('why this move', async () => {
        /*
h:rnbqkb-r
g:pppppppp
f:-------n
e:--------
d:-------P
c:--------
b:PPPPPPP-
a:RNBQKBNR
--01234567
Evaluate h7h6
*/
        const state = BinaryBoard.parse('rnbqkb1r/pppppppp/7n/8/7P/8/PPPPPPP1/RNBQKBNR b KQkq - 0 2')
        const options: EvaluateOptions = {
            pieceValue: true,
            scoreComparer: (a, b) => b.score - a.score
        }
        const result = rootNegaMax(state, 2, options)
        // console.log(result.bestMove)
        // expect(result).toEqual(0)
    })
    it('what is the score', async () => {
        /*
h:rnbqkb-r
g:pppppppp
f:-------n
e:--------
d:-------P
c:--------
b:PPPPPPP-
a:RNBQKBNR
--01234567
Evaluate h7h6
*/
        const state = BinaryBoard.parse('rnbqkb1r/pppppppp/7n/8/7P/8/PPPPPPP1/RNBQKBNR b KQkq - 0 2')
        const options: EvaluateOptions = {
            pieceValue: false,
            pawnAdvancement: true,
            mobility: true,
            random: true
        }
        const result = evaluate(state, options)
        expect(result).toEqual(4)
    })
})

describe('minimax', () => {
    it('evaluate white (see benefit from capture rootNegaMax)', () => {
        /*
h:rnbqkbnr
g:ppppp-pp
f:--------
e:-----p--
d:------PP
c:--------
b:PPPPPP--
a:RNBQKBNR
--01234567
*/
        let state = BinaryBoard.parse('rnbqkbnr/ppppp1pp/8/5p2/6PP/8/PPPPPP2/RNBQKBNR w KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: false,
            mobility: false,
            random: false
            
        }
        let result = rootNegaMax(state, 1, options)
        // console.log(result)
        expect(result.bestScore).toEqual(capturePoints.pawn)
        expect(result.bestMove.from).toEqual(Pos.parse('d6'))
        expect(result.bestMove.to).toEqual(Pos.parse('e5'))
    })
    it('evaluate black (see benefit from capture rootNegaMax)', () => {
        // TODO: good ground for testing protectection

        /*
h:rnbqkbnr
g:ppppp-pp
f:--------
e:-----p--
d:------PP
c:--------
b:PPPPPP--
a:RNBQKBNR
--01234567
*/
        let state = BinaryBoard.parse('rnbqkbnr/ppppp1pp/8/5p2/6PP/8/PPPPPP2/RNBQKBNR b KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: false,
            mobility: false,
            scoreComparer: (a, b) => b.score - a.score
        }
        let result = rootNegaMax(state, 1, options)
        expect(result.bestScore).toEqual(capturePoints.pawn)
        expect(result.bestMove.from).toEqual(Pos.parse('e5'))
        expect(result.bestMove.to).toEqual(Pos.parse('d6'))
    })
    it('evaluate black (see benefit from capture NegaMax)', () => {
        /*
h:rnbqkbnr
g:pppppp-p
f:--------
e:------p-
d:-------P
c:--------
b:PPPPPPP-
a:RNBQKBNR
--01234567
*/
        let state = BinaryBoard.parse('rnbqkbnr/pppppp1p/8/6p1/7P/8/PPPPPPP1/RNBQKBNR w KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: false,
            mobility: false,
            scoreComparer: (a, b) => b.score - a.score
        }
        const node = constructNodeChain(state, 2, 1)
        let result = negaMax(node, options)
        expect(result).toEqual(capturePoints.pawn)
    })
    it('evaluate black (random)', () => {
        /*
h:rnbqkb-r
g:pppppppp
f:-------n
e:--------
d:-------P
c:-----P--
b:PPPPP-P-
a:RNBQKBNR
--01234567
*/
        let state = BinaryBoard.parse('rnbqkb1r/pppppppp/7n/8/7P/5P2/PPPPP1P1/RNBQKBNR b KQkq - 0 1')
        const options: EvaluateOptions = {
            pieceValue: true,
            pawnAdvancement: false,
            mobility: false,
            random: false,
            scoreComparer: (a, b) => b.score - a.score
        }
        let result = rootNegaMax(state, 1, options)
        // console.log(result)
        expect(result.bestScore).toEqual(-0)
        // expect(result.bestMove.from).not.toEqual(Pos.parse('e5'))
        // expect(result.bestMove.to).not.toEqual(Pos.parse('d6'))
    })
})