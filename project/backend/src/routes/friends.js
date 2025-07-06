const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Send friend request
router.post('/request', auth, async (req, res) => {
  try {
    const { username } = req.body;
    const senderId = req.userId;

    // Find target user
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === senderId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if already friends
    if (targetUser.friends.includes(senderId)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    // Check if request already sent
    const existingRequest = targetUser.friendRequests.find(
      req => req.from.toString() === senderId
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Add friend request
    targetUser.friendRequests.push({ from: senderId });
    await targetUser.save();

    res.json({ message: 'Friend request sent successfully' });

  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept friend request
router.post('/accept', auth, async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    const requestIndex = user.friendRequests.findIndex(
      req => req._id.toString() === requestId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    const senderId = user.friendRequests[requestIndex].from;

    // Add to friends list for both users
    user.friends.push(senderId);
    user.friendRequests.splice(requestIndex, 1);
    await user.save();

    await User.findByIdAndUpdate(senderId, {
      $push: { friends: userId }
    });

    res.json({ message: 'Friend request accepted' });

  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject friend request
router.post('/reject', auth, async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    const requestIndex = user.friendRequests.findIndex(
      req => req._id.toString() === requestId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    user.friendRequests.splice(requestIndex, 1);
    await user.save();

    res.json({ message: 'Friend request rejected' });

  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get friend requests
router.get('/requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friendRequests.from', 'username rating gamesPlayed')
      .select('friendRequests');

    res.json({ friendRequests: user.friendRequests });

  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get friends list
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friends', 'username rating gamesPlayed isOnline lastSeen')
      .select('friends');

    res.json({ friends: user.friends });

  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove friend
router.delete('/:friendId', auth, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.userId;

    // Remove from both users' friend lists
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId }
    });

    res.json({ message: 'Friend removed successfully' });

  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    const userId = req.userId;

    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: userId }
    })
    .select('username rating gamesPlayed')
    .limit(10);

    res.json({ users });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;