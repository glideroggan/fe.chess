BUGS:
- there is a white line in the capturebox at the bottom when a white rook is there
- when two captures happen after each other, then last one will be "cleaned", so last capture is not shown
TODO:
- add caching of the FEN and moves
  - need unittests
- status bar
  - TESTING
  - write unit test that the call is being made to the callback
- status table on bottom on mobile
- add the missing moves (en passant, castling, promotion)
- fix time to show 00:00.00
- bestmove from AI should contain the logic that came to that conclusion
  - include the "max" score model in the bestmove
- undo button

- Add touch support (mobile)
  - https://stackoverflow.com/questions/71313587/what-is-the-equivalent-of-dragstart-event-datatransfer-setdata-for-touchstart 

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
  - We can check if our piece is currently covering other of our pieces with its moves
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