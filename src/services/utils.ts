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