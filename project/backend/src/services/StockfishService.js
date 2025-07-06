const { spawn } = require('child_process');
const { Chess } = require('chess.js');

class StockfishService {
  constructor() {
    this.engine = null;
    this.isReady = false;
    this.pendingCallbacks = new Map();
    this.initEngine();
  }

  initEngine() {
    try {
      // Try to use system Stockfish first, fallback to npm package
      const stockfishPath = process.env.STOCKFISH_PATH || 'stockfish';
      this.engine = spawn(stockfishPath);
      
      this.engine.stdout.on('data', (data) => {
        this.handleEngineOutput(data.toString());
      });

      this.engine.stderr.on('data', (data) => {
        console.error('Stockfish error:', data.toString());
      });

      this.engine.on('error', (error) => {
        console.error('Failed to start Stockfish:', error);
        this.fallbackToJSEngine();
      });

      // Initialize UCI protocol
      this.sendCommand('uci');
      this.sendCommand('isready');
      
    } catch (error) {
      console.error('Stockfish initialization failed:', error);
      this.fallbackToJSEngine();
    }
  }

  fallbackToJSEngine() {
    console.log('Using JavaScript chess engine fallback');
    this.isReady = true;
  }

  handleEngineOutput(output) {
    const lines = output.trim().split('\n');
    
    for (const line of lines) {
      console.log('Stockfish:', line);
      
      if (line.includes('uciok') || line.includes('readyok')) {
        this.isReady = true;
      } else if (line.startsWith('bestmove')) {
        this.handleBestMove(line);
      }
    }
  }

  handleBestMove(line) {
    const parts = line.split(' ');
    const move = parts[1];
    const requestId = this.currentRequestId;
    
    if (requestId && this.pendingCallbacks.has(requestId)) {
      const callback = this.pendingCallbacks.get(requestId);
      this.pendingCallbacks.delete(requestId);
      
      if (move && move !== '(none)') {
        callback(null, move);
      } else {
        callback(new Error('No valid move found'));
      }
    }
  }

  sendCommand(command) {
    if (this.engine && !this.engine.killed) {
      this.engine.stdin.write(command + '\n');
    }
  }

  async getBestMove(fen, difficulty = 5) {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        return this.generateJSMove(fen, resolve, reject);
      }

      const requestId = Date.now().toString();
      this.currentRequestId = requestId;
      this.pendingCallbacks.set(requestId, (error, move) => {
        if (error) {
          // Fallback to JS engine
          this.generateJSMove(fen, resolve, reject);
        } else {
          resolve(move);
        }
      });

      // Set position and search
      this.sendCommand(`position fen ${fen}`);
      this.sendCommand(`go depth ${difficulty}`);

      // Timeout after 5 seconds
      setTimeout(() => {
        if (this.pendingCallbacks.has(requestId)) {
          this.pendingCallbacks.delete(requestId);
          this.generateJSMove(fen, resolve, reject);
        }
      }, 5000);
    });
  }

  generateJSMove(fen, resolve, reject) {
    try {
      const game = new Chess(fen);
      const moves = game.moves({ verbose: true });
      
      if (moves.length === 0) {
        return reject(new Error('No legal moves available'));
      }

      // Simple move selection with some strategy
      let selectedMove = this.selectStrategicMove(game, moves);
      
      if (!selectedMove) {
        selectedMove = moves[Math.floor(Math.random() * moves.length)];
      }

      const moveString = selectedMove.from + selectedMove.to + 
        (selectedMove.promotion ? selectedMove.promotion : '');
      
      resolve(moveString);
    } catch (error) {
      reject(error);
    }
  }

  selectStrategicMove(game, moves) {
    // Prioritize captures
    const captures = moves.filter(move => move.captured);
    if (captures.length > 0) {
      return captures[Math.floor(Math.random() * captures.length)];
    }

    // Prioritize checks
    const checks = moves.filter(move => {
      const tempGame = new Chess(game.fen());
      tempGame.move(move);
      return tempGame.isCheck();
    });
    if (checks.length > 0) {
      return checks[Math.floor(Math.random() * checks.length)];
    }

    // Prioritize center control in opening
    if (game.history().length < 10) {
      const centerMoves = moves.filter(move => 
        ['e4', 'e5', 'd4', 'd5', 'f4', 'f5', 'c4', 'c5'].includes(move.to)
      );
      if (centerMoves.length > 0) {
        return centerMoves[Math.floor(Math.random() * centerMoves.length)];
      }
    }

    return null;
  }

  destroy() {
    if (this.engine && !this.engine.killed) {
      this.engine.kill();
    }
    this.pendingCallbacks.clear();
  }
}

module.exports = StockfishService;