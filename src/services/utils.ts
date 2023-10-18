// export class FenPosOLD {



//     rank: string
//     file: number
//     constructor(rank: string, file: number) {
//         this.rank = rank
//         this.file = file
//     }
//     // static fromNumbers(rank: number, file: number):FenPos {
//     //     return new FenPos('abcdefgh'[rank], file)
//     // }
//     static parse(fen: string): FenPos {
//         return new FenPos(fen[0], parseInt(fen[1]))
//     }
//     static from(rankIndex: number, file: number): FenPos {
//         // I think this is correct, but we have some error somewhere else
//         if (rankIndex < 0 || rankIndex > 7) throw new Error('Invalid rankIndex')
//         return new FenPos('abcdefgh'[rankIndex], file)
//         // return new FenPos('abcdefgh'[Math.abs(rankIndex-7)], file)
//     }
//     toPos():Pos {
//         return fen2Pos(this)
//     }
//     equals(pos: FenPos):boolean {
//         return this.rank === pos.rank && this.file === pos.file
//     }
//     toString() {
//         return `${this.rank}${this.file}`
//     }
// }

export class Pos {
    display: string
    x: number
    y: number

    static rankArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    get file(): number {
        if (this.x < 0 || this.x > 7) throw new Error('Invalid file')
        return this.x
    }
    get rank(): string {
        if (this.y < 0 || this.y > 7) throw new Error('Invalid rank')
        return Pos.rankArray[this.y]
    }
    constructor(xFile: number, yRank: number) {
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
        if (file < 0 || file > 7) console.warn('Invalid file: ' + file.toString())
        const index = Pos.rankArray.indexOf(rank)
        if (index == -1) throw new Error(`Invalid rank ${rank}`)
        return new Pos(file, index)
    }
    add(rank: number, file: number): Pos {
        return new Pos(this.x + file, this.y + rank)
    }
    equals(other: Pos): boolean {
        return this.x === other.x && this.y === other.y
    }
    clone(): Pos {
        return new Pos(this.x, this.y)
    }
    toString(): string {
        return `${this.rank}${this.file}`
    }
}