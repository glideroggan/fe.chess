import { Move } from "./rules"
import { Pos, translateFen2Binary } from "./utils"

export const king: number = 0b0000000001
export const queen: number = 0b0000000010
export const bishop: number = 0b0000000100
export const knight: number = 0b0000001000
export const rook: number = 0b0000010000
export const pawn: number = 0b0000100000

export const white: number = 0b0001000000
export const black: number = 0b0010000000

export const isWhite = (type: number): boolean => (type & white) === white
export const mask = 1 | 2 | 4 | 8 | 16 | 32
export const whatType = (pieceType: number): number => pieceType & mask
export const getColor = (pieceType: number): number => pieceType & (white | black)
export type TypeAndColor = number



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
    toString(): string {
        return `${this.pos.toString()} ${this.typeAndColor}`
    }
}

export class BoardData {
    private data: number[][] = []
    _currentPlayer: number
    _turns: number
    _halfMoveClock: number
    _castling: string
    get castling(): string {
        return this._castling
    }
    constructor(fenString?: string) {
        if (fenString == undefined) {
            this._currentPlayer = white
            this._turns = 0
            this._halfMoveClock = 0
            this._castling = 'KQkq'
            // intialize the board
            for (let y = 7; y >= 0; y--) {
                this.data[y] = [0, 0, 0, 0, 0, 0, 0, 0]
            }
        } else {
            // guard
            if (fenString.split(' ').length != 6) throw new Error('Invalid FEN string')
            if (fenString.split(' ')[0].split('/').length != 8) throw new Error('Invalid FEN string')

            // castling
            this._castling = fenString.split(' ')[2]

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
            this._halfMoveClock = parseInt(fenString.split(' ')[4])
        }
    }
    put(to: Pos, p: number) {
        // guard
        if (p == undefined) throw new Error('Piece not initialized')
        this.data[to.y][to.x] = p
    }
    clear(from: Pos) {
        this.data[from.y][from.x] = 0
    }
    get(pos: Pos): number {
        return this.data[pos.y][pos.x]
    }
    get getBoard(): string {
        // PERF: maybe have this generated every time we have a change instead?
        // return the board state as a string
        let board = ''
        for (let y = 7; y >= 0; y--) {
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
            + ' ' + this._castling + ' - ' + this._halfMoveClock.toString()
            + ' ' + this._turns.toString()
        return str
    }

    clone(): BoardData {
        const newBoard = new BoardData()
        newBoard._currentPlayer = this._currentPlayer
        newBoard._turns = this._turns
        newBoard._halfMoveClock = this._halfMoveClock
        newBoard._castling = this._castling
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
    static parse(fenString: string): BinaryBoard {
        const boardData = new BoardData(fenString)
        const board = new BinaryBoard(boardData)
        return board
    }
    checkmateObservers: (() => void)[] = [];
    onCheckmate(callback: () => void) {
        this.checkmateObservers.push(callback);
    }
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
    remove(from: Pos) {
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
            for (let x = 0; x < 8; x++) {
                const p = this.boardData.get(new Pos(x, y))
                if (p == undefined) throw new Error('Piece not initialized')
                if (p == 0) continue
                if (p == typeAndColor) return new BinaryPiece(typeAndColor, new Pos(x, y))
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
    get(posStr: string | Pos): TypeAndColor {
        if (typeof posStr == 'string') posStr = Pos.parse(posStr)
        const binary = this.boardData.get(posStr)
        // guard
        if (binary == undefined) throw new Error('data uninitialized ' + posStr.toString())
        return binary
    }
    history: BoardData[] = []

}

export const boardState: BinaryBoard = BinaryBoard.parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')



export const translateNumber2Char = (num: number): string => {
    switch (num) {
        case 0: return '-'
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



export const getSpecificPiece = (state: BinaryBoard, typeAndColor: number): Pos => {
    const a = state.getPiece(typeAndColor)
    if (a == null) throw new Error('King not found')
    return a.pos
}

export const getPiece = (state: BinaryBoard, pos: Pos | string): BinaryPiece => {
    if (typeof pos == 'string') pos = Pos.parse(pos)
    // look into the FEN and return the piece at the given position
    // const rank = state.getRank(pos.y);
    const piece = state.get(pos)
    if (piece == 0) return null
    return new BinaryPiece(piece, pos)
}

export type MoveResult = {
    captured: BinaryPiece | null,
    pieceMoved: BinaryPiece,
    special: {
        moves: Move[]
    }
}
export const move = (board: BinaryBoard, fromData: Pos | string, toData: Pos | string): MoveResult => {
    const results: MoveResult = {
        captured: null,
        pieceMoved: null,
        special: {
            moves: []
        }
    }
    const from = typeof fromData == 'string' ? Pos.parse(fromData) : fromData
    const to = typeof toData == 'string' ? Pos.parse(toData) : toData

    // guard
    const piece = board.get(from.toString())
    if (piece == null) throw new Error('No piece at ' + from.toString())

    board.history.push(board.clone().boardData)

    // from
    const p: number = board.get(from)
    board.remove(from)
    const captured = board.get(to)
    board.put(to, p)

    // handle castling
    if (whatType(p) == king) {
        handleSpecialMoves(p, from, to, board, results)
    }

    toggleTurn(board)

    if (board.currentPlayer == white) board.increaseTurns()
    results.pieceMoved = new BinaryPiece(p, to)
    results.captured = captured == 0 ? null : new BinaryPiece(captured, to)
    return results
}

export const toggleTurn = (board: BinaryBoard) => {
    board.toggleTurn()
}
export const undo = (board: BinaryBoard) => {
    const history = board.history.pop()
    if (history == undefined) throw new Error('No history to undo')

    board.boardData = history
}

type CastlingMove = {
    kingMove: Move,
    rookMove: Move
}
const handleSpecialMoves = (p: number, from: Pos, to: Pos, board: BinaryBoard, results: MoveResult) => {
    const kingPredefinedMoves: Record<TypeAndColor, CastlingMove[]> = {
        [king | white]: [
            {
                kingMove: new Move(new Pos('a4'), new Pos('a6')),
                rookMove: new Move('a7', 'a5')
            },
            {
                kingMove: new Move(new Pos('a4'), new Pos('a2')),
                rookMove: new Move('a0', 'a3')
            }],
        [king | black]: [
            {
                kingMove: new Move(new Pos('h4'), new Pos('h6')),
                rookMove: new Move('h7', 'h5')
            },
            {
                kingMove: new Move(new Pos('h4'), new Pos('h2')),
                rookMove: new Move('h0', 'h3')
            }
        ]
    }
    const predefinedMoves:CastlingMove[] = kingPredefinedMoves[p]
    // go through the moves
    for (let i = 0; i < predefinedMoves.length; i++) {
        const predefinedMove = predefinedMoves[i]
        if (predefinedMove.kingMove.from.equals(from) && predefinedMove.kingMove.to.equals(to)) {
            board.remove(predefinedMove.rookMove.from)
            board.put(predefinedMove.rookMove.to, rook | white)
            results.special.moves.push(predefinedMove.rookMove)
        }
    }

    // let rookMove: Move
    // switch ({ piece: p, from: from, to: to }) {
    //     case { piece: king | white, from: new Pos('a4'), to: new Pos('a6') }:
    //         // kingside
    //         rookMove = new Move(new Pos('a7'), new Pos('a5'))
    //         board.remove(rookMove.from)
    //         board.put(rookMove.to, rook | white)
    //         results.special.moves.push(rookMove)
    //         break
    //     case { piece: king | black, from: new Pos('h4'), to: new Pos('h6') }:
    //         // kingside
    //         rookMove = new Move(new Pos('h7'), new Pos('h5'))
    //         board.remove(rookMove.from)
    //         board.put(rookMove.to, rook | white)
    //         results.special.moves.push(rookMove)
    //         break
    //     case { piece: king | white, from: new Pos('a4'), to: new Pos('a2') }:
    //         // queenside
    //         rookMove = new Move(new Pos('a0'), new Pos('a3'))
    //         board.remove(rookMove.from)
    //         board.put(rookMove.to, rook | white)
    //         results.special.moves.push(rookMove)
    //         break
    //     case { piece: king | black, from: new Pos('h4'), to: new Pos('h2') }:
    //         // queenside
    //         rookMove = new Move(new Pos('h0'), new Pos('h3'))
    //         board.remove(rookMove.from)
    //         board.put(rookMove.to, rook | white)
    //         results.special.moves.push(rookMove)
    //         break
    // }

    // update castling FEN
    if (p == (king | white)) {
        board.boardData._castling = board.boardData._castling.replace('K', '')
        board.boardData._castling = board.boardData._castling.replace('Q', '')
    }
    if (p == (king | black)) {
        board.boardData._castling = board.boardData._castling.replace('q', '')
        board.boardData._castling = board.boardData._castling.replace('k', '')
    }
    if (p == (rook | white) && from.x == 0 && from.y == 0) board.boardData._castling = board.boardData._castling.replace('Q', '')
    if (p == (rook | white) && from.x == 7 && from.y == 0) board.boardData._castling = board.boardData._castling.replace('K', '')
    if (p == (rook | black) && from.x == 0 && from.y == 7) board.boardData._castling = board.boardData._castling.replace('q', '')
    if (p == (rook | black) && from.x == 7 && from.y == 7) board.boardData._castling = board.boardData._castling.replace('k', '')
}
