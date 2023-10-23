import { BinaryBoard, black, isWhite, king, move, pawn, queen, rook, undo, white } from "../services/binaryBoard"
import { Pos } from "../services/utils"

describe('translate FEN', () => {
    it('should translate', () => {
        const board = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        // console.log(board.boardData.data)
        expect(board.boardData.get(new Pos(0,0))).toBe(rook | white)
    })
})

describe('binaryBoard', () => {
    /*
    h:--------
    g:--------
    f:--------
    e:--------
    d:--------
    c:--------
    b:--------
    a:--------
      01234567

    we need 32bit to represent one cell in a rank

    8*32bit = 256bit
    8 ranks
     
    */
    //    const board:number[][] = []

    
    it('should parse', () => {
        const board = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        expect(board).toBeDefined()
        expect(board.boardData.get(new Pos(0,0))).toBe(rook | white)
        expect(board.boardData.get(new Pos(7,0))).toBe(rook | white)
    })
    it('get correct pieces', () => {
        const board = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        expect(board.get('a0')).toBe(rook | white)
        expect(board.get('b0')).toBe(pawn | white)
        expect(board.get('a4')).toBe(king | white)

        expect(board.get('h0')).toBe(rook | black)
        expect(board.get('g0')).toBe(pawn | black)
        expect(board.get('h4')).toBe(king | black)
    })
    // it('getrank', () => {
    //     const board = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    //     expect(board.getRank(0)).toContain(rook | white)
    //     expect(board.getRank(0)).toContain(queen | white)

    //     expect(board.getRank(7)).toContain(rook | black)
    //     expect(board.getRank(7)).toContain(queen | black)
    // })
    // it('updateRank', () => {
    //     const board = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

    //     const rank = board.getRank(0)
    //     rank[0] = 0
    //     board.updateRank(0, rank)

    //     expect(board.get('a0')).toBe(0)
    // })
})

describe('bit operators', () => {
    it('isWhite', () => {
        expect(isWhite(king | white)).toBe(true)
        expect(isWhite(king | black)).toBe(false)
    })
})

describe('binaryBoard moves', () => {
    it('make a move', () => {
        const board = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        // console.log(board.boardData.data)
        move(board, 'b0', 'c0')

        expect(board.get('b0')).toBe(0)
        expect(board.get('c0')).toBe(pawn | white)
        expect(board.history.length).toBe(1)
    })
    it('undo', () => {
        const board = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

        expect(board.get('b0')).toBe(pawn | white)
        expect(board.get('c0')).toBe(0)

        move(board, 'b0', 'c0')
        expect(board.get('b0')).toBe(0)
        expect(board.get('c0')).toBe(pawn | white)

        undo(board)
        expect(board.get('c0')).toBe(0)
        expect(board.get('b0')).toBe(pawn | white)
    })
})