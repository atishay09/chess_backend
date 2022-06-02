import chess
import chess.engine
import os

dir = os.getcwd()
print(cwd)
engine = chess.engine.SimpleEngine.popen_uci(r"I:\Everything\Internship\Impactional Games\stockfish_15_win_x64_avx2\stockfish.exe")

board = chess.Board()

while not board.is_game_over():
    board.push_san(input("\nEnter your move : \n"))
    print(board)
    print("\n\n\nBot : \n")
    result = engine.play(board, chess.engine.Limit(time=0.1))
    board.push(result.move)
    print(board)
if board.is_game_over():
    print("Game Over")