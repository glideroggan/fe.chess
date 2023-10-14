import { aiMove } from '../services/ai';
import { Piece, boardState, movePiece, resetBoard } from '../services/rules';
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
                table.appendChild(cell)
                // board.content.appendChild(cell)
                black = !black
            }
        }

        this.addEventListener('done', this.setup.bind(this))
        this.addEventListener('moved', this.onMoved.bind(this))

        this.dispatchEvent(new Event('done'))
    }
    set ai(value: boolean) {
        if (value) {
            this.setAttribute('ai', 'true')
        } else {
            this.setAttribute('ai', 'false')
        }
    }
    doKingCheck() {
        const check = boardState.isCheck()
        console.log('check:', check)
        if (check.length > 0) {
            for (const pos in check) {
                const cell = this.root.querySelector(`.cell[pos=${check.toString()}]`)
                cell.classList.add('check')
            }
        } else {
            const cells = this.root.querySelectorAll(`.cell.check`)
            for (const cell of cells) {
                cell.classList.remove('check')
            }
        }
    }
    async onMoved(moveEvent: CustomEvent) {
        // update UI
        const fromCell = this.root.querySelector(`.cell[pos=${moveEvent.detail.from.toString()}]`)
        const toCell = this.root.querySelector(`.cell[pos=${moveEvent.detail.to.toString()}]`)
        // remove the piece from the old cell
        const targetPiece = toCell.querySelector('chess-piece')
        if (targetPiece != null) {
            targetPiece.remove()
        }
        const piece = fromCell.querySelector('chess-piece')
        piece.setAttribute('pos', moveEvent.detail.to.toString())
        toCell.appendChild(piece)

        this.doKingCheck()

        // make a AI move if AI is enabled
        if (this.getAttribute('ai') === 'true' && boardState.currentPlayer === 'black') {
            // TODO: is it possible to make this happen in the background?
            // so that the UI is not blocked
            // is it possible to dispatch an event that is handled and then we catch
            // that when done?
            aiMove(3, false).then((move) => {
                if (move != null) {
                    movePiece(move.from, move.to)
                    this.onMoved(new CustomEvent('moved', { detail: { from: move.from, to: move.to }, bubbles: true, composed: true }))
                } else {
                    this.doKingCheck()
                }
            })
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


