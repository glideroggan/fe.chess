import { bishop, black, king, knight, pawn, queen, rook, white } from "./binaryBoard"

export class Pos {
    
    display: string
    x: number
    y: number

    private static rankArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    get file(): number {
        if (this.x < 0 || this.x > 7) throw new Error('Invalid file')
        return this.x
    }
    get rank(): string {
        if (this.y < 0 || this.y > 7) throw new Error('Invalid rank')
        return Pos.rankArray[this.y]
    }
    constructor(xFile: number|string, yRank?: number) {
        if (typeof xFile === 'string') {
            const pos = Pos.parse(xFile)
            xFile = pos.x
            yRank = pos.y
        }
        this.x = xFile
        // if (xFile < 0 || xFile > 7) console.warn('Invalid file: ' + xFile.toString())
        this.y = yRank
        try { this.display = this.toString() } catch { '' }
        // if (yRank < 0 || yRank > 7) console.warn('Invalid rank: ' + yRank.toString())
        if (isNaN(this.x) || isNaN(this.y)) throw new Error('Invalid rank or file')
    }
    static parse(pos: string): Pos {
        return new Pos(parseInt(pos[1]), Pos.rankArray.indexOf(pos[0]))
    }
    static from(rank: string, file: number): Pos {
        // if (file < 0 || file > 7) console.warn('Invalid file: ' + file.toString())
        const index = Pos.rankArray.indexOf(rank)
        if (index == -1) throw new Error(`Invalid rank ${rank}`)
        return new Pos(file, index)
    }
    direction(to: Pos):string {
        const dx = Math.sign(to.x - this.x)
        const dy = Math.sign(to.y - this.y)
        // return a direction in the form of a string with the value N, S, E, W, NE, NW, SE, SW
        if (dx === 0 && dy === 0) {
            throw new Error('Positions are the same')
        }
        let direction = ''
        if (dx === 0) {
            direction += dy > 0 ? 'N' : 'S'
        } else if (dy === 0) {
            direction += dx > 0 ? 'E' : 'W'
        } else {
            direction += dy > 0 ? 'N' : 'S'
            direction += dx > 0 ? 'E' : 'W'
        }
        return direction
    }
    add(rank: number, file: number): Pos {
        return new Pos(this.x + file, this.y + rank)
    }
    equals(other: Pos|string): boolean {
        if (typeof other === 'string') {
            other = Pos.parse(other)
        }
        return this.x === other.x && this.y === other.y
    }
    clone(): Pos {
        return new Pos(this.x, this.y)
    }
    toString(): string {
        return `${this.rank}${this.file}`
    }
}

const translateChar2Binary = (char: string): number => {
    switch (char) {
        case 'k': return king | black
        case 'q': return queen | black
        case 'b': return bishop | black
        case 'n': return knight | black
        case 'r': return rook | black
        case 'p': return pawn | black
        case 'K': return king | white
        case 'Q': return queen | white
        case 'B': return bishop | white
        case 'N': return knight | white
        case 'R': return rook | white
        case 'P': return pawn | white
        default: throw new Error('Invalid character: ' + char)
    }
}
export const translateFen2Binary = (fen: string): number[][] => {
    const data: number[][] = []
    let rankIndex = 7
    let file = 0
    for (let i = 0; i < fen.length; i++) {
        if (fen[i] == '/') {
            rankIndex--
            file = 0
            continue
        }
        if (!isNaN(parseInt(fen[i]))) {
            file += parseInt(fen[i])
            for (let j = 0; j <= file; j++) {
                if (data[rankIndex] == undefined) data[rankIndex] = []
                data[rankIndex][file] = 0
            }
            continue
        }
        if (data[rankIndex] == undefined) data[rankIndex] = [0, 0, 0, 0, 0, 0, 0, 0]

        data[rankIndex][file] = translateChar2Binary(fen[i])
        file++
    }
    return data
}