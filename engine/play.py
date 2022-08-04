import chess
import chess.engine
import os

dir = os.getcwd()
print(dir)
engine = chess.engine.SimpleEngine.popen_uci(r"D:\internship\chess\chess-backend-engine-windows\stockfish_15_win_x64_avx2\stockfish_15_x64_avx2.exe")
# engine = chess.engine.SimpleEngine.popen_uci(r"D:\internship\chess\chessgame-backend\stockfish_15_win_x64_avx2\stockfish_15_x64_avx2.exe")

board = chess.Board()

while not board.is_game_over():
    print(board.legal_moves)
    board.push_san(input("\nEnter your move : \n"))
    print(board)
    print("\n\n\nBot : \n")
    result = engine.play(board, chess.engine.Limit(time=0.1))
    board.push(result.move)
    print(board)
if board.is_game_over():
    print("Game Over")