import { Piece, boardState, resetBoard } from '../services/rules';
import { FenPos, Pos, pos2Fen } from '../services/utils';
import { BoardCell } from './boardCell';
import { ChessPiece } from './chessPiece';


export class ChessTable extends HTMLElement {
    root: ShadowRoot
    parser: DOMParser;
    constructor() {
        super()
        this.root = this.attachShadow({ mode: 'closed' })
        this.parser = new DOMParser()
    }
    async connectedCallback() {
        const html = await import('./chessTable-template.html');
        const doc = this.parser.parseFromString(html.default, 'text/html');
        const template: HTMLTemplateElement = doc.querySelector('template')
        this.root.appendChild(template.content.cloneNode(true));

        // create all the cells in a template and connect to the "board"
        // const board = document.createElement('template')
        const table = this.root.querySelector('#board')
        let black = true
        for (let y = 7; y >= 0; y--) {
            black = !black
            for (let x = 0; x < 8; x++) {
                const cell = document.createElement('board-cell') as BoardCell
                cell.pos = pos2Fen(new Pos(x, y))
                cell.classList.add('cell')
                if (black) {
                    cell.classList.add('black')
                } else {
                    cell.classList.add('white')
                }
                // cell.dataset.x = x.toString()
                // cell.dataset.y = y.toString()
                table.appendChild(cell)
                // board.content.appendChild(cell)
                black = !black
            }
        }

        this.addEventListener('done', this.setup.bind(this))
        this.addEventListener('moved', this.onMoved.bind(this))

        this.dispatchEvent(new Event('done'))
    }
    onMoved() {
        // TODO: we should check if a king is in check, and mark that cell
        const check = boardState.isCheck()
        if (check != null) {
            const cell = this.root.querySelector(`.cell[pos=${check.toString()}]`)
            cell.classList.add('check')
        } else {
            const cell = this.root.querySelector(`.cell.check`)
            if (cell != null) {
                cell.classList.remove('check')
            }
        }
    }
    createPiece(piece: Piece, frozen: boolean): ChessPiece {
        const el = document.createElement('chess-piece') as ChessPiece
        el.setAttribute('color', piece.color)
        el.setAttribute('type', piece.type)
        el.setAttribute('pos', piece.pos.toString())
        el.setAttribute('frozen', frozen.toString())
        return el
    }
    setup() {
        resetBoard()

        const ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
        ranks.forEach((rankSymbol) => {
            const rank = boardState.getRank(rankSymbol)
            for (let x = 0; x < 8; x++) {
                const p = rank[x]
                if (isNaN(parseInt(p))) {
                    // piece
                    const pos = new FenPos(rankSymbol, x)
                    const piece = boardState.getPiece(pos)
                    const el = this.createPiece(piece, piece.color !== boardState.currentPlayer)
                    const cell = this.root.querySelector('#board').querySelector(`.cell[pos=${pos}]`)
                    cell.appendChild(el)
                }
            }    
        })
    }

}

customElements.define('chess-table', ChessTable)


