export class FenPos {
    rank: string
    file: number
    constructor(rank: string, file: number) {
        this.rank = rank
        this.file = file
    }
    static parse(fen: string): FenPos {
        return new FenPos(fen[0], parseInt(fen[1]))
    }
    equals(pos: FenPos):boolean {
        return this.rank === pos.rank && this.file === pos.file
    }
    toString() {
        return `${this.rank}${this.file}`
    }
}

export class Pos {
    x: number
    y: number
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
    equals(other: Pos): boolean {
        return this.x === other.x && this.y === other.y
    }
}
export const pos2Fen = (pos: Pos): FenPos => {
    let x:string
    let y:string
    switch (pos.y) {
        case 0:
            y = 'a'
            break
        case 1:
            y = 'b'
            break
        case 2:
            y = 'c'
            break
        case 3:
            y = 'd'
            break
        case 4:
            y = 'e'
            break
        case 5:
            y = 'f'
            break
        case 6:
            y = 'g'
            break
        case 7:
            y = 'h'
            break
    }
    x = pos.x.toString()
    return new FenPos(y, parseInt(x))
}

export const fen2Pos = (fen: FenPos): Pos => {
    let x:number
    let y:number
    switch (fen.rank) {
        case 'a':
            y = 0
            break
        case 'b':
            y = 1
            break
        case 'c':
            y = 2
            break
        case 'd':
            y = 3
            break
        case 'e':
            y = 4
            break
        case 'f':
            y = 5
            break
        case 'g':
            y = 6
            break
        case 'h':
            y = 7
            break
    }
    x = fen.file
    return new Pos(x, y)
}