import { Common } from "./common";

class CaptureBox extends Common {
    slotEl: HTMLSlotElement
    
    constructor() {
        super()
    }
    static get observedAttributes() {
        return ['color', 'type']
    }
    importHtml(): Promise<typeof import("*.html")> {
        return import('./captureBox-template.html')
    }
    afterConnected(): void {
        this.slotEl = this.root.querySelector('board-cell')
    }
    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'color') {
            this.slotEl.querySelector('chess-piece').setAttribute('color', newValue)
        }
        if (name === 'type') {
            if (newValue === null) {
                this.slotEl.innerHTML = ''
                return
            }
            if (oldValue === null) {
                const el = document.createElement('chess-piece')
                this.slotEl.appendChild(el)
            }
            this.slotEl.querySelector('chess-piece').setAttribute('type', newValue)
        }
    }
}

customElements.define('capture-box', CaptureBox)