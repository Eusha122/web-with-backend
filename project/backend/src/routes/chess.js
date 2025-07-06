const express = require('express');
const ChessGame = require('../models/ChessGame');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's game history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const games = await ChessGame.find({
      $or: [
        { 'players.white': userId },
        { 'players.black': userId }
      ],
      status: 'completed'
    })
    .populate('players.white', 'username rating')
    .populate('players.black', 'username rating')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await ChessGame.countDocuments({
      $or: [
        { 'players.white': userId },
        { 'players.black': userId }
      ],
      status: 'completed'
    });

    res.json({
      games,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get game history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific game
router.get('/game/:gameId', auth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.userId;

    const game = await ChessGame.findOne({ gameId })
      .populate('players.white', 'username rating')
      .populate('players.black', 'username rating');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Check if user is part of this game
    if (game.players.white._id.toString() !== userId && 
        game.players.black._id.toString() !== userId &&
        game.gameType !== 'bot') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ game });

  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const topPlayers = await User.find({ gamesPlayed: { $gte: 5 } })
      .select('username rating gamesPlayed gamesWon gamesLost gamesDrawn')
      .sort({ rating: -1 })
      .limit(limit);

    const leaderboard = topPlayers.map((player, index) => ({
      rank: index + 1,
      username: player.username,
      rating: player.rating,
      gamesPlayed: player.gamesPlayed,
      winRate: player.gamesPlayed > 0 ? 
        Math.round((player.gamesWon / player.gamesPlayed) * 100) : 0
    }));

    res.json({ leaderboard });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;