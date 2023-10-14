import { lastMove, movePiece, movingPiece, validMove } from '../services/rules'
import { FenPos } from '../services/utils'

export class BoardCell extends HTMLElement {
    root: ShadowRoot
    parser: DOMParser
    cell: HTMLDivElement
    info: HTMLParagraphElement
    entered: boolean
    constructor() {
        super()
        this.root = this.attachShadow({ mode: 'closed' })
        this.parser = new DOMParser()
    }
    set pos(pos: FenPos) {
        this.setAttribute('pos', pos.toString())
    }
    onDragLeave(e: DragEvent) {
        e.preventDefault()
        this.cell.classList.remove('valid')
        this.entered = false
    }
    onDragOver(e: DragEvent) {
        e.preventDefault()
        if (this.entered) return
        this.entered = true
        // we can't use the data in the transfer during dragover
        // but we could check with the board state and set the values there
        const cellPos:FenPos = FenPos.parse(this.getAttribute('pos'))
        // TODO: if ok move, tint green, otherwise tint red
        // what is the position of this cell?
        
        // what is the current position of the piece?
        if (cellPos.equals(movingPiece.pos)) {
            this.cell.classList.remove('valid')
            return
        }
        if (validMove(movingPiece.pos, cellPos)) {
            // tint green
            this.cell.classList.add('valid')
        }
    }
    onDrop(e: DragEvent) {
        this.cell.classList.remove('valid')
        this.entered = false
        // move the piece to the new cell
        const success = movePiece(movingPiece.pos, FenPos.parse(this.getAttribute('pos')))
        if (success) {
            console.log('moved', lastMove.pos.toString(), '->', this.getAttribute('pos'))
            // remove any enemy piece in the new cell
            let piece = this.querySelector('chess-piece')
            console.log('piece', piece)
            if (piece != null) {
                piece.remove()
            }

            // create a new piece in the new cell
            piece = document.createElement('chess-piece')
            piece.setAttribute('pos', this.getAttribute('pos'))
            piece.setAttribute('color', lastMove.color)
            piece.setAttribute('frozen', 'true')
            this.appendChild(piece)
            this.dispatchEvent(new Event('moved', { bubbles: true, composed: true }))
        }
    }
    async connectedCallback() {
        const html = await import('./boardCell-template.html');
        const doc = this.parser.parseFromString(html.default, 'text/html');
        const template: HTMLTemplateElement = doc.querySelector('template')
        this.root.appendChild(template.content.cloneNode(true));

        this.cell = this.root.querySelector('div')
        this.info = this.root.querySelector('[info]')
        this.info.innerHTML = this.getAttribute('pos')
        // Continue here, adding the event listeners for drag and drop
        this.cell.addEventListener('dragover', this.onDragOver.bind(this))
        // TODO: need a listener for leaving the cell
        this.cell.addEventListener('dragleave', this.onDragLeave.bind(this))
        this.cell.addEventListener('drop', this.onDrop.bind(this))
    }
}
if (!customElements.get('board-cell'))
    customElements.define('board-cell', BoardCell)