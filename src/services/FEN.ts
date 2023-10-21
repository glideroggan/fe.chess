import { Color, Piece, PieceType } from "./rules";
import { Pos } from "./utils";

export const expandRank = (rank: string): string => {
    let expandedRank = ''
    for (const element of rank) {
        const char = element
        if (isNaN(parseInt(char))) {
            // not a number
            expandedRank += char
        } else {
            // a number
            for (let j = 0; j < parseInt(char); j++) {
                expandedRank += '0'
            }
        }
    }
    return expandedRank
}

export const compressRank = (rank: string): string => {
    let compressedRank = ''
    let count = 0
    for (let i = 0; i < rank.length; i++) {
        const char = rank[i]
        if (char === '0') {
            count++
        } else {
            if (count > 0) {
                compressedRank += count.toString()
                count = 0
            }
            compressedRank += char
        }
    }
    if (count > 0) {
        compressedRank += count.toString()
    }
    return compressedRank
}

type PlayerChangeFunction = (color: Color) => void

// rnbqkbnr/ppppp3/8/5p1p/5P1p/3BP2N/PPPP2P1/RNBQK2R b KQkq - 0 5
export class FEN {
    // PERF: add getters for getting parts of the state
    current: string;
    history: string[] = [];

    clone(): FEN {
        return FEN.parse(this.current)
    }

    constructor(fen: string) {
        this.current = fen;
        if (this.current.split(' ').length !== 6) throw new Error('Invalid FEN')
        if (this.current.split(' ')[0].split('/').length !== 8) throw new Error('Invalid FEN')
    }
    static parse(fen: string): FEN {
        
        return new FEN(fen);
    }
    get currentPlayer(): Color {
        return this.current.split(' ')[1] === 'w' ? Color.white : Color.black
    }
    get rounds(): number {
        return parseInt(this.current.split(' ')[5])
    }
    toString(): string {
        return this.current;
    }
    playerChangeObservers: (PlayerChangeFunction)[] = [];
    onPlayerChange(callback: PlayerChangeFunction) {
        this.playerChangeObservers.push(callback);
    }
    stateChangeObservers: (() => void)[] = [];
    onStateChange(callback: () => void) {
        this.stateChangeObservers.push(callback);
    }
    checkMateObservers: (() => void)[] = [];
    checkMate() {
        console.log('[checkmate] notifying observers: ${this.checkMateObservers.length}')
        for (const callback of this.checkMateObservers) {
            callback()
        }
    }

    undo() {
        const p = this.history.pop()
        if (p == undefined) throw new Error('No history')
        this.current = p
    }

    updateRank(rank: string, newRank: string) {
        newRank = compressRank(newRank);
        const a = this.current.split(' ');
        const b = a[0].split('/');
        // invert the order of the array, so that the first row is at the bottom
        b.reverse();
        b[rank.charCodeAt(0) - 97] = newRank
        b.reverse();
        this.current = b.join('/') + ' ' + a.slice(1).join(' ')
    }
}



export const getKing = (state: FEN, player: Color): Pos => {
    const char = player.num == 1 ? 'K' : 'k'
    const ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    for (const rankSymbol of ranks) {
        const rank = getRank(state, rankSymbol)
        if (rank.indexOf(char) !== -1) {
            const file = rank.indexOf(char)
            return Pos.from(rankSymbol, file)
        }
    }
    // console.log(state)
    throw new Error('King not found')
}

export const increaseRoundNumber = (state: FEN): void => {
    const a = state.current.split(' ')
    let b = a[5]
    b = (parseInt(b) + 1).toString()
    a[5] = b
    state.current = a.join(' ');
}

export const togglePlayerTurn = (state: FEN): void => {
    const a = state.current.split(' ')
    let b = a[1]
    b = b === 'w' ? 'b' : 'w'
    a[1] = b
    state.current = a.join(' ');
    if (b === 'w')
        increaseRoundNumber(state);
}

export const movePiece = (state: FEN, from: Pos, to: Pos): void => {
    // save move
    state.history.push(state.current);

    // update from position
    let rank = getRank(state, from.rank);
    const char = rank[from.file];
    rank = rank.slice(0, from.file) + '0' + rank.slice(from.file + 1);
    state.updateRank(from.rank, rank);

    // update to position
    rank = getRank(state, to.rank);
    rank = rank.slice(0, to.file) + char + rank.slice(to.file + 1);
    state.updateRank(to.rank, rank);

    // change player turn
    togglePlayerTurn(state);
}

export const getPiece = (state: FEN, pos: Pos): Piece => {
    // look into the FEN and return the piece at the given position
    const rank = getRank(state, pos.rank);
    if (rank[pos.file] == '0') return null
    const color = rank[pos.file] == rank[pos.file].toUpperCase() ? Color.white : Color.black
    return new Piece(rank[pos.file], pos.y, pos.x, color)
}

export const getRank = (state: FEN, rank: string): string => {
    const a = state.current.split(' ')[0];
    const b = a.split('/');
    // invert the order of the array, so that the first row is at the bottom
    b.reverse();
    return expandRank(b['abcdefgh'.indexOf(rank)]);
}
