import './assets/css/main.css'
import './components/chessTable'
import './components/boardCell'
import './components/chessPiece'
import './components/statusTable'
import { ChessTable } from './components/chessTable'
import { StatusTable } from './components/statusTable'


const board:ChessTable = document.querySelector('chess-table')
board.ai = true