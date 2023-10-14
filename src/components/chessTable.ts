import { resetBoard } from '../services/rules';
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
        // const cellTemplate:HTMLTemplateElement = doc.querySelector('#cell')
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
        console.log('moved')
    }
    setup() {
        console.log('setup')
        resetBoard()

        // TODO: this should use the board state to place pieces
        // pawns
        
        for (let x = 0; x < 8; x++) {
            const pawn = document.createElement('chess-piece') as ChessPiece
            pawn.setAttribute('color', 'white')
            pawn.setAttribute('frozen', 'false')
            pawn.setAttribute('type', 'pawn')
            const fenPos = new FenPos('b', x).toString()
            pawn.setAttribute('pos', fenPos)
            const cell = this.root.querySelector('#board').querySelector(`.cell[pos=${fenPos}]`)
            cell.appendChild(pawn)
        }
        for (let x = 0; x < 8; x++) {
            const pawn = document.createElement('chess-piece') as ChessPiece
            pawn.setAttribute('color', 'black')
            pawn.setAttribute('frozen', 'true')
            pawn.setAttribute('type', 'pawn')
            const fenPos = new FenPos('g', x).toString()
            pawn.setAttribute('pos', fenPos)
            const cell = this.root.querySelector('#board').querySelector(`.cell[pos=${fenPos}]`)
            cell.appendChild(pawn)
        }
    }

}

customElements.define('chess-table', ChessTable)