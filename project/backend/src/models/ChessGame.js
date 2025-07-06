const mongoose = require('mongoose');

const chessGameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  players: {
    white: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    black: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  gameType: {
    type: String,
    enum: ['multiplayer', 'bot'],
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'abandoned'],
    default: 'waiting'
  },
  result: {
    type: String,
    enum: ['white_wins', 'black_wins', 'draw', 'abandoned'],
    default: null
  },
  moves: [{
    moveNumber: Number,
    white: String,
    black: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  currentFen: {
    type: String,
    default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  },
  currentTurn: {
    type: String,
    enum: ['white', 'black'],
    default: 'white'
  },
  timeControl: {
    initial: {
      type: Number,
      default: 600 // 10 minutes
    },
    increment: {
      type: Number,
      default: 0
    }
  },
  timeRemaining: {
    white: {
      type: Number,
      default: 600
    },
    black: {
      type: Number,
      default: 600
    }
  },
  lastMoveTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
chessGameSchema.index({ gameId: 1 });
chessGameSchema.index({ 'players.white': 1, 'players.black': 1 });
chessGameSchema.index({ status: 1 });

module.exports = mongoose.model('ChessGame', chessGameSchema);