Investigate bad moves
- r1b1k1nr/ppQ2pp1/2p1p3/3pP2p/4q3/2P3P1/PP2P2P/RNB1KBR1 b KQkq - 0 14
  - next move d4 -> a1

BUGS:
- possible to move black pieces as white
  This happens after black (AI) have moved, we should trigger the freeze of the black pieces after the AI has moved
  - freeze black pieces, and don't unfreeze, if AI is on
- color isn't set on two captures in a row in the capturebox
- there is a white line in the capturebox at the bottom when a white rook is there
TODO:
- add the missing moves (en passant, promotion)
  - promotion
    - Need a modal for choosing the promotion piece
    - AI needs to be able to choose the promotion piece
  
- let the AI suggest a move for white
  - Color the suggested move
    - the color maybe could be fixed programatically, so that we can slightly change the color of the suggested move
  - hide it behind an option in the game
- Protection (https://www.cs.cornell.edu/boom/2004sp/ProjectArch/Chess/algorithms.html#staticboard)
- think about evaluating the king
  - Does it make sense to try to capture the king? From the games perspective it is not about taking the king
  - but to limit its moves

- deploy
  - put it in docker
  - deploy it to server
  - develop a "deployment" server app that can run on server and pick up github deployment hooks

- how can we reduce the moments were the AI is gaining nothing by willingly capture an equal valued piece, and then losing it in the next move?
  - rn2k1nr/ppp2ppp/5q2/3Bp3/1b1PP1b1/2P2N2/PP3PPP/RNBQK2R b KQkq - 0 6
- extend FEN notation
  - castling
      Castling availability: If neither side has the ability to castle, this field uses the character -. Otherwise, this field contains one or more letters: "K" if White can castle kingside, "Q" if White can castle queenside, "k" if Black can castle kingside, and "q" if Black can castle queenside. A situation that temporarily prevents castling does not prevent the use of this notation.
- rules
  - fifty-fifty rule
- status bar
  - TESTING
  - write unit test that the call is being made to the callback
- status table on bottom on mobile

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