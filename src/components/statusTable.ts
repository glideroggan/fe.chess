import { scoreObservers } from '../services/ai';
import { isWhite, white } from '../services/binaryBoard';
import { boardState } from '../services/rules';

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
        // TODO: add back
        // boardState.checkMateObservers.push(() => {
        //     this.status.classList.remove('hidden')
        //     this.status.innerText = 'Checkmate!'
        // })

        setInterval(() => {
            this.timers[current] = this.timers[current] || 0
            this.timers[current]++
            this.waiting.innerText = `Waiting: ${this.timers[current]}s`
        }, 1000)

        scoreObservers.push(this.setScore.bind(this))
    }

    setScore(score: number) {
        this.bestScore.innerText = `Best Score: ${score}`
    }
    setTurn(msg: string) {
        this.turn.innerText = `Turn: ${msg}`
    }
}

customElements.define('status-table', StatusTable)