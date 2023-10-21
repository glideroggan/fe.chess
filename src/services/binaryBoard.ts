import { Pos } from "./utils"

export const king:number = 0b0000000001
export const queen:number = 0b0000000010
export const bishop:number = 0b0000000100
export const knight:number = 0b0000001000
export const rook:number = 0b0000010000
export const pawn:number = 0b0000100000

export const white:number = 0b0001000000
export const black:number = 0b0010000000

export const isWhite = (type: number): boolean => (type & white) === white
// export const isKing = (type: number): boolean => (type & king) === 1
// export const isQueen = (type: number): boolean => (type & queen) === 2
// export const isBishop = (type: number): boolean => (type & bishop) === 4
// export const isKnight = (type: number): boolean => (type & knight) === 8
// export const isRook = (type: number): boolean => (type & rook) === 16
// export const isPawn = (type: number): boolean => (type & pawn) === 32
export const mask = 1 | 2 | 4 | 8 | 16 | 32
export const whatType = (pieceType: number): number => pieceType & mask
export const getColor = (pieceType: number): number => pieceType & (white | black)


export class BinaryPiece {
    // contains both the piece type and the color
    typeAndColor: number
    pos: Pos
    constructor(typeAndColor: number, pos: Pos) {
        this.typeAndColor = typeAndColor
        this.pos = pos
    }
    get color(): number {
        // return the color bit
        return this.typeAndColor & (white | black)
    }
    get type(): number {
        // return the type bit
        return this.typeAndColor & mask
    }
    toString():string {
        return `${this.pos.toString()} ${this.typeAndColor}`
    }
}


export class BoardData {
    put(to: Pos, p: number) {
        // guard
        if (p == undefined) throw new Error('Piece not initialized')
        this.data[to.y][to.x] = p
    }
    clear(from: Pos) {
        this.data[from.y][from.x] = 0
    }
    // TODO: maybe we shouldn't give out the rank, but instead only give out a copy
    // getRank(rankNumber: number) {
    //     return this.data[rankNumber]
    // }
    // updateRank(rankIndex: number, rank: number[]) {
    //     // guard
    //     if (rank.find((p) => p == undefined)) throw new Error('Rank ' + rankIndex + ' is not initialized')
    //     this.data[rankIndex] = rank
    // }
    get(pos: Pos) {
        return this.data[pos.y][pos.x]
    }
    get getBoard(): string {
        // PERF: maybe have this generated every time we have a change instead?
        // return the board state as a string
        let board = ''
        for (let y = 7; y >=0; y--) {
            let empty = 0
            for (let x = 0; x < 8; x++) {
                const piece = this.data[y][x]
                if (piece == undefined) throw new Error('Piece not initialized')
                if (piece == 0) {
                    empty++
                    continue
                }
                if (empty > 0) {
                    board += empty.toString()
                    empty = 0
                }
                board += translateNumber2Char(piece)
            }
            if (empty > 0) board += empty.toString()
            if (y > 0) board += '/'
        }
        return board
    }
    get getFullBoard(): string {
        // 'rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq - 0 1'
        let str = this.getBoard
            + ' ' + (this._currentPlayer == white ? 'w' : 'b')
            + ' KQkq - 0' 
            + ' ' + this._turns.toString()
        return str
    }
    private data: number[][] = []
    _currentPlayer: number
    _turns: number
    constructor(fenString?: string) {
        if (fenString == undefined) {
            this._currentPlayer = white
            this._turns = 0
            // intialize the board
            for (let y = 7; y >= 0; y--) {
                this.data[y] = [0, 0, 0, 0, 0, 0, 0, 0]
                // for (let x = 0; x < 8; x++) {
                //     this.data[y][x] = 0
                // }
            }
        } else {
            // guard
            if (fenString.split(' ').length != 6) throw new Error('Invalid FEN string')
            if (fenString.split(' ')[0].split('/').length != 8) throw new Error('Invalid FEN string')

            const boardStr = fenString.split(' ')[0]
            this.data = translateFen2Binary(boardStr)
            // guard
            // go through each rank and file and make sure they are initialized
            for (let y = 7; y >= 0; y--) {
                if (this.data[y] == undefined) this.data[y] = []
                for (let x = 0; x < 8; x++) {
                    if (this.data[y][x] == undefined) this.data[y][x] = 0
                }
            }
            this._currentPlayer = fenString.split(' ')[1] == 'w' ? white : black
            this._turns = parseInt(fenString.split(' ')[5])
        }
    }
    clone(): BoardData {
        const newBoard = new BoardData()
        newBoard._currentPlayer = this._currentPlayer
        newBoard._turns = this._turns
        const clone: number[][] = []
        for (let y = 0; y < 8; y++) {
            clone[y] = new Array(8).fill(0)
            if (this.data[y] == undefined) this.data[y] = new Array(8).fill(0)
            for (let x = 0; x < 8; x++) {
                clone[y][x] = this.data[y][x] ?? 0
            }
        }
        newBoard.data = clone
        return newBoard
    }
}

type PlayerChangeFunction = (color: number) => void

export class BinaryBoard {

    playerChangeObservers: (PlayerChangeFunction)[] = [];
    onPlayerChange(callback: PlayerChangeFunction) {
        this.playerChangeObservers.push(callback);
    }
    stateChangeObservers: (() => void)[] = [];
    onStateChange(callback: () => void) {
        this.stateChangeObservers.push(callback);
    }

    put(to: Pos, p: number) {
        this.boardData.put(to, p)
    }
    clear(from: Pos) {
        this.boardData.clear(from)
    }
    constructor(boardData: BoardData) {
        this.boardData = boardData
    }
    increaseTurns() {
        this.boardData._turns++
    }
    toggleTurn() {
        this.boardData._currentPlayer = this.boardData._currentPlayer == white ? black : white
        
    }
    getPiece(typeAndColor: number): BinaryPiece | null {
        // go through the board data and return the piece
        for (let y = 0; y < 8; y++) {
            // const rank = this.boardData.getRank(y)
            for (let x = 0; x < 8; x++) {
                const p = this.boardData.get(new Pos(x, y))
                if (p == undefined) throw new Error('Piece not initialized')
                if (p == 0) continue
                if (p == typeAndColor) return new BinaryPiece(typeAndColor, new Pos(x, y))

                // if (rank[x] == piece) return new BinaryPiece(piece, new Pos(x, y))
            }
        }
        return null
    }
    boardData: BoardData = new BoardData()
    get currentPlayer(): number {
        return this.boardData._currentPlayer
    }
    clone(): BinaryBoard {
        // TODO: go back to just use the boarddata
        return new BinaryBoard(this.boardData.clone())
    }
    // updateRank(rankNumber: number | string, rank: number[]) {
    //     if (typeof rankNumber == 'string') rankNumber = Pos.parse(rankNumber).y
    //     this.boardData.updateRank(rankNumber, rank)
    // }
    // getRank(rankNumber: number | string): number[] | null {
    //     if (typeof rankNumber == 'string') rankNumber = Pos.parse(rankNumber).y
    //     // guard
    //     if (rankNumber < 0 || rankNumber > 7) throw new Error('Rank ' + rankNumber + ' does not exist')
    //     const rank = this.boardData.getRank(rankNumber)
    //     if (rank == undefined) throw new Error('Rank ' + rankNumber + ' does not exist')
    //     if (rank.find((p) => p == undefined)) throw new Error('Rank ' + rankNumber + ' is not initialized')
    //     return rank
    // }
    get(posStr: string|Pos): number | null {
        if (typeof posStr == 'string') posStr = Pos.parse(posStr)
        // const pos = Pos.parse(posStr)
        // TODO: all of this shouldn't be necessary, the boardData should always be initialized
        // if (this.boardData.data[pos.y] == undefined) this.boardData.data[pos.y] = []
        const binary = this.boardData.get(posStr)
        // guard
        if (binary == undefined) throw new Error('data uninitialized ' + posStr.toString())
        return binary
    }
    history: BoardData[] = []
    // static fromBoardData(boardData: BoardData): BinaryBoard {
    //     const board = new BinaryBoard(boardData)
    //     // board.boardData = boardData
    //     return board
    // }
    static parse(fenString: string): BinaryBoard {
        const boardData = new BoardData(fenString)


        // const arr = translateFen2Binary(boardString)
        // console.log('arr', arr)

        const board = new BinaryBoard(boardData)

        // board.boardData._currentPlayer = fenString.split(' ')[1] == 'w' ? white : black
        // initialize any undefined values
        // for (let y = 0; y < 8; y++) {
        //     // if (board.boardData.data[y] == undefined) board.boardData.data[y] = new Array(8).fill(0)
        //     for (let x = 0; x < 8; x++) {
        //         if (board.boardData.data[y][x] == undefined) board.boardData.data[y][x] = 0
        //     }
        // }

        return board
    }


    // loopThroughBoard(board, (piece: Piece) => {
    //     if (board.boardData.data[piece.pos.y] == undefined) board.boardData.data[piece.pos.y] = []
    //     board.boardData.data[piece.pos.y][piece.pos.x] = piece.num | piece.color.binary
    // })
    // return board
    // }
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

const translateNumber2Char = (num: number): string => {
    switch (num) {
        case king | black: return 'k'
        case queen | black: return 'q'
        case bishop | black: return 'b'
        case knight | black: return 'n'
        case rook | black: return 'r'
        case pawn | black: return 'p'
        case king | white: return 'K'
        case queen | white: return 'Q'
        case bishop | white: return 'B'
        case knight | white: return 'N'
        case rook | white: return 'R'
        case pawn | white: return 'P'
        default: throw new Error('Invalid binary data: ' + num)
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

// export const gameMove = (board: BinaryBoard, fromData: Pos | string, toData: Pos | string) => {
//     const from = typeof fromData == 'string' ? Pos.parse(fromData) : fromData
//     const to = typeof toData == 'string' ? Pos.parse(toData) : toData

//     // guard
//     const piece = board.get(from.toString())
//     if (piece == null) throw new Error('No piece at ' + from.toString())

//     board.history.push(board.clone().boardData)

//     // from
//     const p = board.get(from)
//     board.clear(from)
//     board.put(to, p)

//     // let rank = board.getRank(from.y)
//     // const p = rank[from.x]
//     // rank[from.x] = 0
//     // board.updateRank(from.y, rank)

//     // // to
//     // rank = board.getRank(to.y)
//     // rank[to.x] = p
//     // board.updateRank(to.y, rank)

//     toggleTurn(board)
//     board.playerChangeObservers.forEach(callback => callback(board.boardData._currentPlayer))

//     if (board.currentPlayer == white) board.increaseTurns()
// }

export const move = (board: BinaryBoard, fromData: Pos | string, toData: Pos | string):BinaryPiece | null => {
    const from = typeof fromData == 'string' ? Pos.parse(fromData) : fromData
    const to = typeof toData == 'string' ? Pos.parse(toData) : toData

    // guard
    const piece = board.get(from.toString())
    if (piece == null) throw new Error('No piece at ' + from.toString())

    board.history.push(board.clone().boardData)

    // from
    const p = board.get(from)
    board.clear(from)
    const captured = board.get(to)
    board.put(to, p)

    toggleTurn(board)

    if (board.currentPlayer == white) board.increaseTurns()
    return captured == 0 ? null : new BinaryPiece(captured, to)
}

export const toggleTurn = (board: BinaryBoard) => {
    board.toggleTurn()
}
export const undo = (board: BinaryBoard) => {
    const history = board.history.pop()
    if (history == undefined) throw new Error('No history to undo')

    board.boardData = history
}