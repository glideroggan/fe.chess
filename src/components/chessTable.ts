import { getPiece, getRank } from '../services/FEN';
import { AiState, EvaluateOptions, cache, rootNegaMax } from '../services/ai';
import { Piece, boardState, gameMovePiece, isCheck, resetBoard } from '../services/rules';
import { Pos } from '../services/utils';
import { BoardCell } from './boardCell';
import { ChessPiece } from './chessPiece';
import { StatusTable } from './statusTable';


export class ChessTable extends HTMLElement {
    root: ShadowRoot
    parser: DOMParser;
    status: StatusTable;
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
                cell.pos = new Pos(x, y)
                cell.classList.add('cell')
                if (black) {
                    cell.classList.add('black')
                } else {
                    cell.classList.add('white')
                }
                table.appendChild(cell)
                black = !black
            }
        }

        this.addEventListener('done', this.setup.bind(this))
        this.addEventListener('moved', this.onMoved.bind(this))
        self.addEventListener('aiMove', this.onAiMove.bind(this))

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
        const check = isCheck(boardState)
        console.log('check:', check.length > 0)
        if (check.length > 0) {
            console.log('check:', check)
            for (const pos of check) {
                const cell = this.root.querySelector(`.cell[pos=${pos.toString()}]`)
                cell.classList.add('check')
            }
        } else {
            const cells = this.root.querySelectorAll(`.cell.check`)
            for (const cell of cells) {
                cell.classList.remove('check')
            }
        }
    }
    aiDepth: number = 2
    async onAiMove() {
        console.log('aiMove...')
        // abort any background work
        this.state.abortState.abort = true
        this.state.abortState.reason = 'aiMove'

        let abortState = { abort: false, reason: '' }
        setTimeout(() => {
            abortState.abort = true
            abortState.reason = 'timeout'
        }, 15000)
        const options: EvaluateOptions = {
            pieceValue: true,
        }
        const move = rootNegaMax(boardState, 1, options)
        
        console.log('aiMove...Done')
        console.log('bestMove:', move.bestMove, 'bestScore:', move.bestScore)
        gameMovePiece(move.bestMove.from, move.bestMove.to)
        this.dispatchEvent(new CustomEvent('moved', {
            detail: {
                from: move.bestMove.from, to: move.bestMove.to
            }, bubbles: true, composed: true
        }))
        // aiMove(boardState.clone(), 'aiMove', abortState, 1, true, options).then((move) => {
        //     console.log('aiMove...Done')
        //     if (move != null) {
        //         gameMovePiece(move.bestMove.from, move.bestMove.to)
        //         this.dispatchEvent(new CustomEvent('moved', { detail: { 
        //             from: move.bestMove.from, to: move.bestMove.to }, bubbles: true, composed: true }))
        //     } else {
        //         this.doKingCheck()
        //     }
        //     this.state.workDone = false
        //     this.state.abortState.abort = false
        // })
        //     .catch((move) => {
        //         console.log('aiMove...interrupted', abortState.reason)
        //         if (move != null) {
        //             gameMovePiece(move.from, move.to)
        //             this.dispatchEvent(new CustomEvent('moved', { detail: { from: move.from, to: move.to }, bubbles: true, composed: true }))
        //         } else {
        //             this.doKingCheck()
        //         }
        //         this.state.workDone = false
        //         this.state.abortState.abort = false
        //     })
    }
    state: AiState = { workDone: false, abortState: { abort: false, reason: '' }, board: null }
    aiWork(): Promise<void> {
        const sleep = 1
        return new Promise(async (resolve, reject) => {
            let depth = this.aiDepth
            boardState.onStateChange(() => {
                this.state.abortState.abort = true
                this.state.abortState.reason = 'stateChange'
                this.state.workDone = false
                if (boardState.rounds > 3) {
                    this.aiDepth = 4
                    depth = 4
                }
            })
            const options: EvaluateOptions = {
                pieceValue: true,
                pawnAdvancement: true,
                mobility: true,
            }
            while (true) {
                if (this.state.abortState.abort) {
                    console.log('aiWork: AI turn...')
                    await new Promise(r => setTimeout(r, 1000))
                    continue
                }
                if (this.state.workDone) {
                    console.log('aiWork: done...')
                    await new Promise(r => setTimeout(r, 1000))
                    // depth++
                    continue
                }
                // don't do background work on AI turn
                if (boardState.currentPlayer == 'black') {
                    await new Promise(r => setTimeout(r, 1000))
                    continue
                }
                console.log('aiWork...')
                this.state.workDone = false
                this.state.abortState.abort = false
                // aiMove(boardState.clone(), 'aiWork', this.state.abortState, depth, true, options, sleep).then((move) => {
                //     this.state.workDone = true
                //     console.log('cache size:', Object.keys(cache).length)
                // })
                //     .catch((move) => {
                //         console.log('aiWork...interrupted...', this.state.abortState.reason)
                //         this.state.workDone = true
                //         console.log('cache size:', Object.keys(cache).length)
                //     })
                while (true) {
                    if (this.state.workDone || this.state.abortState.abort) {
                        break;
                    }
                    await new Promise(r => setTimeout(r, 100))
                }
                // if state change happened, then abort
                if (this.state.abortState.abort) {
                    this.state.abortState.abort = false
                    this.state.workDone = false
                    // wait until state change happens again
                    continue
                }
            }
        })
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
            // give time to render
            await new Promise(r => setTimeout(r, 500))
            self.dispatchEvent(new Event('aiMove'))
            // await this.aiMove()
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
            const rank = getRank(boardState, rankSymbol)
            for (let x = 0; x < 8; x++) {
                const p = rank[x]
                if (isNaN(parseInt(p))) {
                    // piece
                    const pos = Pos.from(rankSymbol, x)
                    const piece = getPiece(boardState, pos)
                    const el = this.createPiece(piece, piece.color !== boardState.currentPlayer)
                    const cell = this.root.querySelector('#board').querySelector(`.cell[pos=${pos}]`)
                    cell.appendChild(el)
                }
            }
        })

        // this.aiWork()
        this.status = document.querySelector('status-table')
    }

}

customElements.define('chess-table', ChessTable)


