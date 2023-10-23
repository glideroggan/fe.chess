import { bishop, black, getColor, king, knight, pawn, queen, rook, whatType, white } from "../services/binaryBoard"

describe('bitwise', () => {
    it('should work', () => {
        
        // expect(isKing(1)).toBe(true)
        // expect(isQueen(2)).toBe(true)
        // expect(isBishop(4)).toBe(true)
        // expect(isKnight(8)).toBe(true)
        // expect(isRook(16)).toBe(true)
        // expect(isPawn(pawn)).toBe(true)

        expect(whatType(king)).toBe(king)
        expect(whatType(queen)).toBe(queen)
        expect(whatType(bishop)).toBe(bishop)
        expect(whatType(knight)).toBe(knight)
        expect(whatType(rook)).toBe(rook)
        expect(whatType(pawn)).toBe(pawn)

        expect(getColor(king | black)).toBe(black)
        expect(getColor(king | white)).toBe(white)
    })
})

