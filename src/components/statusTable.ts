import { scoreObservers } from '../services/ai';
import { boardState, isWhite, white } from '../services/binaryBoard';

export class StatusTable extends HTMLElement {
    root: ShadowRoot
    parser: DOMParser;
    turn: HTMLParagraphElement
    waiting: HTMLParagraphElement
    bestScore: HTMLParagraphElement;
    status: HTMLParagraphElement;
    timers:number[] = []
    
    
    constructor() {
        super()
        this.root = this.attachShadow({ mode: 'closed' })
        this.parser = new DOMParser()
    }
    async connectedCallback() {
        const html = await import('./statusTable-template.html');
        const doc = this.parser.parseFromString(html.default, 'text/html');
        const template: HTMLTemplateElement = doc.querySelector('template')
        this.root.appendChild(template.content.cloneNode(true));

        this.turn = this.root.querySelector('[turn]')
        this.waiting = this.root.querySelector('[waiting]')
        this.bestScore = this.root.querySelector('[bestScore]')
        this.status = this.root.querySelector('[gameStatus]')

        this.setTurn(this.getAttribute('turn'))
        let current:number = white;
        boardState.onPlayerChange((color) => {
            current = color
            this.setTurn(isWhite(color) ? 'white' : 'black')
        })
        boardState.checkmateObservers.push(() => {
            this.status.classList.remove('hidden')
            this.status.innerText = 'Checkmate!'
        })

        setInterval(() => {
            this.timers[current] = this.timers[current] || 0
            this.timers[current]++
            const minutes = Math.floor(this.timers[current] / 60).toString().padStart(2, '0')
            const seconds = (this.timers[current] % 60).toString().padStart(2, '0')
            this.waiting.innerText = `Waiting: ${minutes}:${seconds}`
        }, 1000)

        scoreObservers.push(this.setScore.bind(this))
    }

    setScore(score: number) {
        // this.bestScore.innerText = `Best Score: ${score}`
    }
    setTurn(msg: string) {
        this.turn.innerText = `Turn: ${msg}`
    }
}

customElements.define('status-table', StatusTable)