import { AiState, rootNegaMax, translateToPiece } from '../services/ai';
import { BinaryPiece, black, boardState, getPiece, isWhite } from '../services/binaryBoard';
import { EvaluateOptions } from '../services/evaluation';
import { getTravelPath, allPossibleMoveCache, getPossibleMovesCache, getMovesTowardsCache } from '../services/moves';
import { Move, captured, gameMovePiece, isCheck } from '../services/rules';
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
        const { check, end } = isCheck(boardState)
        if (check.length > 0) {
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
        if (end != undefined) {
            const cell = this.root.querySelector(`.cell[pos=${end.pos.toString()}]`)
            cell.classList.add('mate')
        }
    }
    aiDepth: number = 2
    async onAiMove() {
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
        const move = rootNegaMax(boardState, 2, options)

        console.log('aiMove...Done')
        if (move.bestMove != null) {
            console.log('bestMove:', move.bestMove, 'bestScore:', move.bestScore)
            const results = gameMovePiece(move.bestMove.from, move.bestMove.to)
            this.dispatchEvent(new CustomEvent('moved', {
                detail: {
                    moveResults: results,
                    move: {from: move.bestMove.from, to: move.bestMove.to}
                }, bubbles: true, composed: true
            }))
        }


    }
    state: AiState = { workDone: false, abortState: { abort: false, reason: '' }, board: null }
    // aiWork(): Promise<void> {
    //     const sleep = 1
    //     return new Promise(async (resolve, reject) => {
    //         let depth = this.aiDepth
    //         boardState.onStateChange(() => {
    //             this.state.abortState.abort = true
    //             this.state.abortState.reason = 'stateChange'
    //             this.state.workDone = false
    //             if (boardState.boardData._turns > 3) {
    //                 this.aiDepth = 4
    //                 depth = 4
    //             }
    //         })
    //         const options: EvaluateOptions = {
    //             pieceValue: true,
    //             pawnAdvancement: true,
    //             mobility: true,
    //         }
    //         while (true) {
    //             if (this.state.abortState.abort) {
    //                 console.log('aiWork: AI turn...')
    //                 await new Promise(r => setTimeout(r, 1000))
    //                 continue
    //             }
    //             if (this.state.workDone) {
    //                 console.log('aiWork: done...')
    //                 await new Promise(r => setTimeout(r, 1000))
    //                 // depth++
    //                 continue
    //             }
    //             // don't do background work on AI turn
    //             if (boardState.currentPlayer.toString() == 'black') {
    //                 await new Promise(r => setTimeout(r, 1000))
    //                 continue
    //             }
    //             console.log('aiWork...')
    //             this.state.workDone = false
    //             this.state.abortState.abort = false
    //             // aiMove(boardState.clone(), 'aiWork', this.state.abortState, depth, true, options, sleep).then((move) => {
    //             //     this.state.workDone = true
    //             //     console.log('cache size:', Object.keys(cache).length)
    //             // })
    //             //     .catch((move) => {
    //             //         console.log('aiWork...interrupted...', this.state.abortState.reason)
    //             //         this.state.workDone = true
    //             //         console.log('cache size:', Object.keys(cache).length)
    //             //     })
    //             while (true) {
    //                 if (this.state.workDone || this.state.abortState.abort) {
    //                     break;
    //                 }
    //                 await new Promise(r => setTimeout(r, 100))
    //             }
    //             // if state change happened, then abort
    //             if (this.state.abortState.abort) {
    //                 this.state.abortState.abort = false
    //                 this.state.workDone = false
    //                 // wait until state change happens again
    //                 continue
    //             }
    //         }
    //     })
    // }
    // TODO: use a typed event
    async onMoved(moveEvent: CustomEvent) {
        console.log('getPossibleMovesCache hits: ', getPossibleMovesCache.hit)
        console.log('allPossibleMoveCache hits: ', allPossibleMoveCache.hit)
        console.log('getMovesTowardsCache hits: ', getMovesTowardsCache.hit)
        // clear board from last move
        const cells = this.root.querySelectorAll(`.cell[dir]`)
        for (const cell of cells) {
            cell.removeAttribute('dir')
        }
        // clear any suggestions from last turn
        const cells2 = this.root.querySelectorAll(`.cell.ai`)
        for (const cell of cells2) {
            cell.classList.remove('ai')
        }
        // update UI
        const fromCell = this.root.querySelector(`.cell[pos=${moveEvent.detail.move.from.toString()}]`)
        const toCell = this.root.querySelector(`.cell[pos=${moveEvent.detail.move.to.toString()}]`)
        // remove the piece from the old cell
        this.handleRemovalOfPiece(toCell);

        // handle special moves UI updates
        if (moveEvent.detail.moveResults.special?.moves?.length > 0) {
            // we have additional pieces that moved
            // update UI
            for (const m of moveEvent.detail.moveResults.special.moves) {
                console.log('special move:', m)
                const fromCell = this.root.querySelector(`.cell[pos=${m.from.toString()}]`)
                const toCell = this.root.querySelector(`.cell[pos=${m.to.toString()}]`)
                // remove the piece from the old cell
                this.handleRemovalOfPiece(toCell);
                const piece = fromCell.querySelector('chess-piece')
                piece.setAttribute('pos', m.to.toString())
                toCell.appendChild(piece)
            }
        }

        const piece = fromCell.querySelector('chess-piece')
        piece.setAttribute('pos', moveEvent.detail.move.to.toString())
        toCell.appendChild(piece)

        this.doKingCheck()
        this.highlightMove(moveEvent.detail.move.from, moveEvent.detail.move.to)

        await new Promise(r => setTimeout(r, 50))
        // make a AI move if AI is enabled
        if (this.getAttribute('ai') === 'true' && boardState.currentPlayer === black) {
            // give time to render
            self.dispatchEvent(new Event('aiMove'))
        } else if (false) {
            this.giveAIsuggestion().then((move) => {
                // color start and end cell
                const fromCell = this.root.querySelector(`.cell[pos=${move.from.toString()}]`)
                const toCell = this.root.querySelector(`.cell[pos=${move.to.toString()}]`)
                fromCell.classList.add('ai')
                toCell.classList.add('ai')
            })
        }
    }
    async giveAIsuggestion(): Promise<Move> {
        // call AI as white
        return new Promise((resolve, reject) => {
            const options: EvaluateOptions = {
                pieceValue: true,
                pawnAdvancement: true,
                mobility: true,
                console: true,
            }
            const move = rootNegaMax(boardState, 2, options)
            resolve(move.bestMove)
        })
    }

    private handleRemovalOfPiece(toCell: Element) {
        const targetPiece = toCell.querySelector('chess-piece');
        // TODO: don't really like that we use document here, because if we would enclose capture-box inside a shadow root, then this wouldn't work
        // but what is the alternative? using specific state services is like redux,
        // using events? then we still need some main service where we can subscribe to events, like redux
        const captureBox = document.querySelector('capture-box');
        if (captured != null) {
            // notify capture-box of the capture
            captureBox.setAttribute('type', targetPiece.getAttribute('type'));
            captureBox.setAttribute('color', targetPiece.getAttribute('color'));
        } else {
            captureBox.removeAttribute('type');
        }
        if (targetPiece != null) {
            targetPiece.remove();
        }
    }

    highlightMove(from: Pos, to: Pos) {
        // highlight the cells that the piece moved in
        // when a piece "jump", like the knight, then highlight the source and destination only
        const piece = getPiece(boardState, to)
        getTravelPath(from, to, piece.type).reduce((prev, pos): Pos => {
            let cell = this.root.querySelector(`.cell[pos=${pos.toString()}]`)
            let prevCell = this.root.querySelector(`.cell[pos=${prev.toString()}]`)

            if (!prev.equals(pos)) {
                let dir = prev.direction(pos)
                cell.setAttribute('dir', dir)
                prevCell.setAttribute('dir', dir)
            }

            return pos
        })
    }
    createPiece(piece: BinaryPiece, frozen: boolean): ChessPiece {
        const el = document.createElement('chess-piece') as ChessPiece
        el.setAttribute('color', isWhite(piece.color) ? 'white' : 'black')
        el.setAttribute('type', translateToPiece(piece.typeAndColor).toString())
        el.setAttribute('pos', piece.pos.toString())
        el.setAttribute('frozen', frozen.toString())
        return el
    }
    setup() {
        // resetBoard()

        const ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
        ranks.forEach((rankSymbol) => {
            // const rank = getRank(boardState, rankSymbol)
            for (let x = 0; x < 8; x++) {
                // const p = rank[x]
                const p = getPiece(boardState, new Pos(x, ranks.indexOf(rankSymbol)))
                if (p != null) {// && !isNaN(parseInt(p))
                    // if (isNaN(parseInt(p))) {
                    // piece
                    // const pos = Pos.from(rankSymbol, x)
                    // const piece = getPiece(boardState, pos)
                    const el = this.createPiece(p, p.color !== boardState.currentPlayer)
                    const cell = this.root.querySelector('#board').querySelector(`.cell[pos=${p.pos.toString()}]`)
                    cell.appendChild(el)
                }
            }
        })

        // this.aiWork()
        this.status = document.querySelector('status-table')
    }

}

customElements.define('chess-table', ChessTable)


