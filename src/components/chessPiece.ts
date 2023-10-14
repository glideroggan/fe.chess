import { boardState, startMoving } from '../services/rules'
import { FenPos } from '../services/utils'

export class ChessPiece extends HTMLElement {
    root: ShadowRoot
    parser: DOMParser
    div: HTMLDivElement
    initialized: boolean
    constructor() {
        super()
        this.root = this.attachShadow({ mode: 'closed' })
        this.parser = new DOMParser()
    }
    onDragStart(e: DragEvent) {
        e.dataTransfer.setData('text', this.getAttribute('pos'))

        const p = FenPos.parse(this.getAttribute('pos'))
        startMoving(p)
    }
    onTouchStart(e: TouchEvent) {
        e.preventDefault()
        const p = FenPos.parse(this.getAttribute('pos'))
        startMoving(p)
    }
    onDragEnd(e: DragEvent) {
        e.preventDefault()
        // check board state if this should be removed
        // const p = FenPos.parse(this.getAttribute('pos'))
        // const piece = boardState.getPiece(p)
        // if (piece == null) {
        //     this.remove()
        // }
            
    }
    static get observedAttributes() {
        return ['frozen']
    }
    onPlayerChange(color: string) {
        if (color === this.getAttribute('color')) {
            this.setAttribute('frozen', 'false')
        } else {
            this.setAttribute('frozen', 'true')
        }
    }
    async connectedCallback() {
        if (this.initialized) return
        const html = await import('./chessPiece-template.html');
        const doc = this.parser.parseFromString(html.default, 'text/html');
        const template: HTMLTemplateElement = doc.querySelector('template')
        this.root.appendChild(template.content.cloneNode(true));

        this.div = this.root.querySelector('div')
        this.div.classList.add(this.getAttribute('color'))

        // this.div.draggable = true
        this.div.addEventListener('dragstart', this.onDragStart.bind(this))
        this.div.addEventListener('touchstart', this.onTouchStart.bind(this))
        this.div.addEventListener('dragend', this.onDragEnd.bind(this))

        this.div.draggable = this.getAttribute('frozen') !== 'true'
        const t = this.getAttribute('color') === 'white' 
            ? this.getAttribute('type').toLowerCase() : this.getAttribute('type').toUpperCase()
        this.div.classList.add(t)

        // observe changes to the board state
        // when player changes, then if this piece is the same color, then enable drag
        boardState.onPlayerChange((color) => this.onPlayerChange.bind(this)(color))
        this.initialized = true
    }
    async disconnectedCallback() {
    }
    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'frozen') {
            if (this.div !== undefined) {
                if (newValue === 'true') {
                    this.div.draggable = false
                } else {
                    this.div.draggable = true
                }
            }

        }
    }
}

if (!customElements.get('chess-piece')) {
    customElements.define('chess-piece', ChessPiece)
}

