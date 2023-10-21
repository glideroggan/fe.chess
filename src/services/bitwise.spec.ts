import { bishop, isBishop, isKing, isKnight, isPawn, isQueen, isRook, king, knight, pawn, queen, rook, whatType } from "./ai"

describe('bitwise', () => {
    it('should work', () => {
        
        expect(isKing(1)).toBe(true)
        expect(isQueen(2)).toBe(true)
        expect(isBishop(4)).toBe(true)
        expect(isKnight(8)).toBe(true)
        expect(isRook(16)).toBe(true)
        expect(isPawn(pawn)).toBe(true)

        expect(whatType(king)).toBe(king)
        expect(whatType(queen)).toBe(queen)
        expect(whatType(bishop)).toBe(bishop)
        expect(whatType(knight)).toBe(knight)
        expect(whatType(rook)).toBe(rook)
        expect(whatType(pawn)).toBe(pawn)
    })
})

