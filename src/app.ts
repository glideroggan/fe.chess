import './assets/css/main.css'
import './components/chessTable'
import './components/boardCell'
import './components/chessPiece'
import './components/statusTable'
import './components/captureBox'
import { ChessTable } from './components/chessTable'


const board:ChessTable = document.querySelector('chess-table')
board.ai = true