const ChessGame = require('../models/ChessGame');
const User = require('../models/User');
const StockfishService = require('./StockfishService');
const { Chess } = require('chess.js');
const { v4: uuidv4 } = require('uuid');

class ChessGameManager {
  constructor(io) {
    this.io = io;
    this.activeGames = new Map();
    this.waitingPlayers = new Map();
    this.stockfish = new StockfishService();
  }

  handleConnection(socket) {
    socket.on('join_game', (data) => this.handleJoinGame(socket, data));
    socket.on('make_move', (data) => this.handleMove(socket, data));
    socket.on('resign', (data) => this.handleResign(socket, data));
    socket.on('offer_draw', (data) => this.handleDrawOffer(socket, data));
    socket.on('accept_draw', (data) => this.handleDrawAccept(socket, data));
    socket.on('find_match', (data) => this.handleFindMatch(socket, data));
    socket.on('cancel_search', () => this.handleCancelSearch(socket));
  }

  handleDisconnection(socket) {
    // Handle player disconnection
    this.waitingPlayers.delete(socket.id);
    
    // Find and handle active games
    for (const [gameId, game] of this.activeGames) {
      if (game.players.white.socketId === socket.id || 
          game.players.black.socketId === socket.id) {
        this.handlePlayerDisconnect(gameId, socket.id);
        break;
      }
    }
  }

  async handleJoinGame(socket, data) {
    try {
      const { gameType, userId, gameId } = data;
      
      if (gameType === 'bot') {
        await this.createBotGame(socket, userId);
      } else if (gameType === 'multiplayer') {
        if (gameId) {
          await this.joinExistingGame(socket, userId, gameId);
        } else {
          await this.findOrCreateMultiplayerGame(socket, userId);
        }
      }
    } catch (error) {
      socket.emit('game_error', { message: error.message });
    }
  }

  async createBotGame(socket, userId) {
    const gameId = uuidv4();
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const game = new ChessGame({
      gameId,
      players: {
        white: userId,
        black: null // Bot doesn't need a user ID
      },
      gameType: 'bot',
      status: 'active'
    });

    await game.save();

    const gameData = {
      gameId,
      players: {
        white: { 
          id: userId, 
          username: user.username, 
          rating: user.rating,
          socketId: socket.id 
        },
        black: { 
          id: 'bot', 
          username: 'Eusha Bot', 
          rating: 2000,
          socketId: null 
        }
      },
      currentFen: game.currentFen,
      currentTurn: game.currentTurn,
      status: game.status
    };

    this.activeGames.set(gameId, gameData);
    socket.join(gameId);
    socket.emit('game_started', gameData);
  }

  async findOrCreateMultiplayerGame(socket, userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if there's a waiting player
    for (const [socketId, waitingPlayer] of this.waitingPlayers) {
      if (waitingPlayer.userId !== userId) {
        // Found a match!
        const gameId = uuidv4();
        
        // Randomly assign colors
        const isWhite = Math.random() < 0.5;
        const whitePlayer = isWhite ? user : waitingPlayer.user;
        const blackPlayer = isWhite ? waitingPlayer.user : user;
        const whiteSocket = isWhite ? socket : this.io.sockets.sockets.get(socketId);
        const blackSocket = isWhite ? this.io.sockets.sockets.get(socketId) : socket;

        const game = new ChessGame({
          gameId,
          players: {
            white: whitePlayer._id,
            black: blackPlayer._id
          },
          gameType: 'multiplayer',
          status: 'active'
        });

        await game.save();

        const gameData = {
          gameId,
          players: {
            white: { 
              id: whitePlayer._id, 
              username: whitePlayer.username, 
              rating: whitePlayer.rating,
              socketId: whiteSocket.id 
            },
            black: { 
              id: blackPlayer._id, 
              username: blackPlayer.username, 
              rating: blackPlayer.rating,
              socketId: blackSocket.id 
            }
          },
          currentFen: game.currentFen,
          currentTurn: game.currentTurn,
          status: game.status
        };

        this.activeGames.set(gameId, gameData);
        this.waitingPlayers.delete(socketId);

        whiteSocket.join(gameId);
        blackSocket.join(gameId);
        
        this.io.to(gameId).emit('game_started', gameData);
        return;
      }
    }

    // No match found, add to waiting list
    this.waitingPlayers.set(socket.id, { userId, user, socket });
    socket.emit('searching_match', { message: 'Searching for opponent...' });
  }

  async handleMove(socket, data) {
    try {
      const { gameId, move } = data;
      const game = this.activeGames.get(gameId);
      
      if (!game) {
        throw new Error('Game not found');
      }

      // Validate move
      const chess = new Chess(game.currentFen);
      const moveResult = chess.move(move);
      
      if (!moveResult) {
        throw new Error('Invalid move');
      }

      // Update game state
      game.currentFen = chess.fen();
      game.currentTurn = chess.turn() === 'w' ? 'white' : 'black';
      
      // Check game status
      let gameStatus = 'active';
      let result = null;
      
      if (chess.isCheckmate()) {
        gameStatus = 'completed';
        result = chess.turn() === 'w' ? 'black_wins' : 'white_wins';
      } else if (chess.isDraw()) {
        gameStatus = 'completed';
        result = 'draw';
      }

      game.status = gameStatus;
      game.result = result;

      // Save to database
      await ChessGame.findOneAndUpdate(
        { gameId },
        {
          currentFen: game.currentFen,
          currentTurn: game.currentTurn,
          status: gameStatus,
          result,
          $push: {
            moves: {
              moveNumber: Math.ceil(chess.history().length / 2),
              [chess.history().length % 2 === 1 ? 'white' : 'black']: moveResult.san,
              timestamp: new Date()
            }
          }
        }
      );

      // Broadcast move to all players in the game
      this.io.to(gameId).emit('move_made', {
        move: moveResult,
        currentFen: game.currentFen,
        currentTurn: game.currentTurn,
        status: gameStatus,
        result
      });

      // Handle bot response for bot games
      if (game.gameType === 'bot' && game.currentTurn === 'black' && gameStatus === 'active') {
        setTimeout(async () => {
          await this.makeBotMove(gameId);
        }, 1000 + Math.random() * 2000); // 1-3 second delay
      }

      // Update player ratings if game is completed
      if (gameStatus === 'completed' && game.gameType === 'multiplayer') {
        await this.updatePlayerRatings(game, result);
      }

    } catch (error) {
      socket.emit('move_error', { message: error.message });
    }
  }

  async makeBotMove(gameId) {
    try {
      const game = this.activeGames.get(gameId);
      if (!game || game.status !== 'active') return;

      const bestMove = await this.stockfish.getBestMove(game.currentFen, 5);
      
      // Make the move
      const chess = new Chess(game.currentFen);
      const moveResult = chess.move({
        from: bestMove.slice(0, 2),
        to: bestMove.slice(2, 4),
        promotion: bestMove.slice(4) || undefined
      });

      if (!moveResult) {
        console.error('Bot generated invalid move:', bestMove);
        return;
      }

      // Update game state
      game.currentFen = chess.fen();
      game.currentTurn = 'white';
      
      // Check game status
      let gameStatus = 'active';
      let result = null;
      
      if (chess.isCheckmate()) {
        gameStatus = 'completed';
        result = 'black_wins';
      } else if (chess.isDraw()) {
        gameStatus = 'completed';
        result = 'draw';
      }

      game.status = gameStatus;
      game.result = result;

      // Save to database
      await ChessGame.findOneAndUpdate(
        { gameId },
        {
          currentFen: game.currentFen,
          currentTurn: game.currentTurn,
          status: gameStatus,
          result,
          $push: {
            moves: {
              moveNumber: Math.ceil(chess.history().length / 2),
              black: moveResult.san,
              timestamp: new Date()
            }
          }
        }
      );

      // Broadcast bot move
      this.io.to(gameId).emit('move_made', {
        move: moveResult,
        currentFen: game.currentFen,
        currentTurn: game.currentTurn,
        status: gameStatus,
        result,
        isBot: true
      });

    } catch (error) {
      console.error('Bot move error:', error);
    }
  }

  async updatePlayerRatings(game, result) {
    const whitePlayer = await User.findById(game.players.white.id);
    const blackPlayer = await User.findById(game.players.black.id);

    if (!whitePlayer || !blackPlayer) return;

    // Simple ELO rating calculation
    const K = 32; // K-factor
    const whiteRating = whitePlayer.rating;
    const blackRating = blackPlayer.rating;

    const expectedWhite = 1 / (1 + Math.pow(10, (blackRating - whiteRating) / 400));
    const expectedBlack = 1 - expectedWhite;

    let whiteScore, blackScore;
    
    if (result === 'white_wins') {
      whiteScore = 1;
      blackScore = 0;
    } else if (result === 'black_wins') {
      whiteScore = 0;
      blackScore = 1;
    } else {
      whiteScore = 0.5;
      blackScore = 0.5;
    }

    const newWhiteRating = Math.round(whiteRating + K * (whiteScore - expectedWhite));
    const newBlackRating = Math.round(blackRating + K * (blackScore - expectedBlack));

    // Update ratings and game statistics
    await User.findByIdAndUpdate(whitePlayer._id, {
      rating: newWhiteRating,
      $inc: {
        gamesPlayed: 1,
        gamesWon: whiteScore === 1 ? 1 : 0,
        gamesLost: whiteScore === 0 ? 1 : 0,
        gamesDrawn: whiteScore === 0.5 ? 1 : 0
      }
    });

    await User.findByIdAndUpdate(blackPlayer._id, {
      rating: newBlackRating,
      $inc: {
        gamesPlayed: 1,
        gamesWon: blackScore === 1 ? 1 : 0,
        gamesLost: blackScore === 0 ? 1 : 0,
        gamesDrawn: blackScore === 0.5 ? 1 : 0
      }
    });
  }

  handleCancelSearch(socket) {
    this.waitingPlayers.delete(socket.id);
    socket.emit('search_cancelled');
  }

  async handleResign(socket, data) {
    const { gameId } = data;
    const game = this.activeGames.get(gameId);
    
    if (!game) return;

    const resigningPlayer = game.players.white.socketId === socket.id ? 'white' : 'black';
    const result = resigningPlayer === 'white' ? 'black_wins' : 'white_wins';

    game.status = 'completed';
    game.result = result;

    await ChessGame.findOneAndUpdate(
      { gameId },
      { status: 'completed', result }
    );

    this.io.to(gameId).emit('game_ended', {
      result,
      reason: 'resignation',
      resignedBy: resigningPlayer
    });

    if (game.gameType === 'multiplayer') {
      await this.updatePlayerRatings(game, result);
    }
  }

  handlePlayerDisconnect(gameId, socketId) {
    const game = this.activeGames.get(gameId);
    if (!game) return;

    // Mark game as abandoned after 30 seconds
    setTimeout(async () => {
      const currentGame = this.activeGames.get(gameId);
      if (currentGame && currentGame.status === 'active') {
        currentGame.status = 'abandoned';
        
        await ChessGame.findOneAndUpdate(
          { gameId },
          { status: 'abandoned', result: 'abandoned' }
        );

        this.io.to(gameId).emit('game_ended', {
          result: 'abandoned',
          reason: 'player_disconnected'
        });

        this.activeGames.delete(gameId);
      }
    }, 30000);
  }
}

module.exports = ChessGameManager;