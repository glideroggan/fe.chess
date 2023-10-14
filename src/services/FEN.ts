import { FenPos } from "./utils";
import { boardState, Color, getMovesTowards, Piece, PieceType } from "./rules";

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
                expandedRank += '1'
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
        if (char === '1') {
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

export class FEN {
    
    
    
    current: string;
    history: string[] = [];
    
    constructor(fen: string) {
        this.current = fen;
    }
    static parse(fen: string): FEN {
        return new FEN(fen);
    }
    get currentPlayer(): Color {
        return this.current.split(' ')[1] === 'w' ? 'white' : 'black'
    }
    toString(): string {
        return this.current;
    }
    playerChangeObservers: (PlayerChangeFunction)[] = [];
    onPlayerChange(callback: PlayerChangeFunction) {
        this.playerChangeObservers.push(callback);
    }
    isCheck():FenPos[] {
        let res = []
        let kingPos = boardState.getKing('white')
        let possibleMoves = getMovesTowards(kingPos)
        if (possibleMoves.length > 0) {
            res.push(kingPos)
        }
        kingPos = boardState.getKing('black')
        possibleMoves = getMovesTowards(kingPos)
        if (possibleMoves.length > 0) {
            res.push(kingPos)
        }
        return []
    }
    undo() {
        this.current = this.history.pop();
    }
    getKing(player: Color) {
        const char = player === 'white' ? 'K' : 'k'
        const ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
        for (const rankSymbol of ranks) {
            const rank = this.getRank(rankSymbol)
            if (rank.indexOf(char) !== -1) {
                const file = rank.indexOf(char)
                return new FenPos(rankSymbol, file)
            }
        }
    }
    move(from: FenPos, to: FenPos) {
        this.history.push(this.current);
        // change player turn
        this.togglePlayerTurn();

        let rank = this.getRank(from.rank);
        // update from position
        let expandedRank = expandRank(rank);
        const char = expandedRank[from.file];
        expandedRank = expandedRank.slice(0, from.file) + '1' + expandedRank.slice(from.file + 1);
        let compressedRank = compressRank(expandedRank);
        boardState.updateRank(from.rank, compressedRank);

        // update to position
        rank = this.getRank(to.rank);
        expandedRank = expandRank(rank);
        expandedRank = expandedRank.slice(0, to.file) + char + expandedRank.slice(to.file + 1);
        compressedRank = compressRank(expandedRank);
        boardState.updateRank(to.rank, compressedRank);
    }
    togglePlayerTurn() {
        const a = this.current.split(' ')
        let b = a[1]
        b = b === 'w' ? 'b' : 'w'
        a[1] = b
        this.current = a.join(' ');
        if (b === 'w')
            this.increaseFullmoveNumber();
    }
    increaseFullmoveNumber() {
        const a = this.current.split(' ')
        let b = a[5]
        b = (parseInt(b) + 1).toString()
        a[5] = b
        this.current = a.join(' ');
    }
    updateRank(rank: string, newRank: string) {
        const a = this.current.split(' ');
        const b = a[0].split('/');
        // invert the order of the array, so that the first row is at the bottom
        b.reverse();
        b[rank.charCodeAt(0) - 97] = newRank
        b.reverse();
        this.current = b.join('/') + ' ' + a.slice(1).join(' ')
    }
    getPiece(pos: FenPos): Piece {
        // look into the FEN and return the piece at the given position
        const rank = this.getRank(pos.rank);
        // the row can either contain a character, which means that, that position is occupied
        // by a piece, or it can contain a number, which means that, that many positions are empty
        // const rank = expandRank(row)
        if (rank[pos.file] == '1') return null
        const color = rank[pos.file] == rank[pos.file].toUpperCase() ? 'white' : 'black'
        return  {
            color: color,
            type: rank[pos.file].toLowerCase() as PieceType,
            pos: new FenPos(pos.rank, pos.file)
        }
    }
    getRank(rank: string) {
        const a = this.current.split(' ')[0];
        const b = a.split('/');
        // invert the order of the array, so that the first row is at the bottom
        b.reverse();
        return expandRank(b[rank.charCodeAt(0) - 97])
    }
}
