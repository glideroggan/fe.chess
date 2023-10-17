BUGS:
- check is not visible in UI for white
TODO:
- Add touch support (mobile)
  - https://stackoverflow.com/questions/71313587/what-is-the-equivalent-of-dragstart-event-datatransfer-setdata-for-touchstart 
- show "captured" pieces
- add the missing moves (en passant, castling, promotion)
- add a "new game" button
- tint the squares that was used in last move
- Avoid "silly" moves by AI
  - add pawn advancement
  - add mobility score
black move: h7 -> h6
rnbqkbr1/pppppppp/7n/8/7P/5P2/PPPPP1P1/RNBQKBNR w KQkq - 0 3
h:rnbqkb-r
g:pppppppp
f:-------n        
e:--------
d:-------P
c:-----P--
b:PPPPP-P-
a:RNBQKBNR
--01234567
h8 -> h7
- Protection
  - if you can protect another piece and still have protection on the moving piece, to protect a more valuable piece
  - how do we quantify that value?
  - 
h:rnbqkbnr
g:-\pppppp
f:p-x-----        
e:-p-\----
d:----\--P
c:-----\P-
b:PPPPPPB-
a:RNBQK-NR
--01234567
g3g4 -> protect h1
*/