import { boardState } from '../services/binaryBoard'
import { gameMovePiece, movingPiece, gameValidMove } from '../services/rules'
import { Pos } from '../services/utils'

export class BoardCell extends HTMLElement {
    root: ShadowRoot
    parser: DOMParser
    cell: HTMLDivElement
    info: HTMLParagraphElement
    entered: boolean
    arrow: HTMLDivElement

    static get observedAttributes() {
        return ['dir']
    }

    constructor() {
        super()
        this.root = this.attachShadow({ mode: 'closed' })
        this.parser = new DOMParser()
    }
    set pos(pos: Pos) {
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
        const cellPos:Pos = Pos.parse(this.getAttribute('pos'))
        
        if (cellPos.equals(movingPiece.pos)) {
            this.cell.classList.remove('valid')
            return
        }
        if (gameValidMove(boardState, movingPiece.pos, cellPos)) {
            // tint green
            this.cell.classList.add('valid')
        }
    }
    onDrop(e: DragEvent) {
        if (!this.cell.classList.contains('valid')) {
            this.entered = false
            return;
        }
        this.cell.classList.remove('valid')
        this.entered = false
        // move the piece to the new cell
        if (movingPiece == null) {
            console.error('onDrop: movingPiece is null')
            return
        }
        const from = movingPiece.pos
        const to = Pos.parse(this.getAttribute('pos'))
        
        const results = gameMovePiece(from, to)
        this.dispatchEvent(new CustomEvent('moved', { 
            detail: {moveResults: results, move: {from:from, to:to}}, bubbles: true, composed: true }))    
    }
    async connectedCallback() {
        const html = await import('./boardCell-template.html');
        const doc = this.parser.parseFromString(html.default, 'text/html');
        const template: HTMLTemplateElement = doc.querySelector('template')
        this.root.appendChild(template.content.cloneNode(true));

        this.cell = this.root.querySelector('div')
        this.arrow = this.root.querySelector('div [arrow]')
        this.info = this.root.querySelector('[info]')
        this.info.innerHTML = this.getAttribute('pos')
        // Continue here, adding the event listeners for drag and drop
        this.cell.addEventListener('dragover', this.onDragOver.bind(this))
        // TODO: need a listener for leaving the cell
        this.cell.addEventListener('dragleave', this.onDragLeave.bind(this))
        this.cell.addEventListener('drop', this.onDrop.bind(this))
    }
    async attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'dir') {
            if (newValue === null) {
                this.arrow.classList.remove(...this.arrow.classList)
                return
            }
            this.arrow.classList.add('arrow')
            this.arrow.classList.remove(oldValue)
            this.arrow.classList.add(newValue)
        }
    }
}
if (!customElements.get('board-cell'))
    customElements.define('board-cell', BoardCell)