import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Search, UserPlus, Clock, Trophy, ArrowLeft } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface MultiplayerChessProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const MultiplayerChess: React.FC<MultiplayerChessProps> = ({ isOpen, onClose, user }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentView, setCurrentView] = useState<'menu' | 'search' | 'friends' | 'game'>('menu');
  const [searchingMatch, setSearchingMatch] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (isOpen && user) {
      // Initialize socket connection
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('chess_token')
        }
      });

      setSocket(newSocket);

      // Socket event listeners
      newSocket.on('game_started', (gameData) => {
        console.log('Game started:', gameData);
        setCurrentView('game');
      });

      newSocket.on('searching_match', () => {
        setSearchingMatch(true);
      });

      newSocket.on('search_cancelled', () => {
        setSearchingMatch(false);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/friends`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('chess_token')}`
        }
      });
      const data = await response.json();
      setFriends(data.friends || []);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/friends/requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('chess_token')}`
        }
      });
      const data = await response.json();
      setFriendRequests(data.friendRequests || []);
    } catch (error) {
      console.error('Failed to fetch friend requests:', error);
    }
  };

  const handleFindMatch = () => {
    if (socket) {
      socket.emit('find_match', { userId: user.id });
      setCurrentView('search');
    }
  };

  const handleCancelSearch = () => {
    if (socket) {
      socket.emit('cancel_search');
      setSearchingMatch(false);
      setCurrentView('menu');
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/friends/search/${searchQuery}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('chess_token')}`
        }
      });
      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const sendFriendRequest = async (username: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('chess_token')}`
        },
        body: JSON.stringify({ username })
      });

      if (response.ok) {
        alert('Friend request sent!');
        setSearchResults(prev => prev.filter((u: any) => u.username !== username));
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/friends/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('chess_token')}`
        },
        body: JSON.stringify({ requestId })
      });

      if (response.ok) {
        fetchFriendRequests();
        if (action === 'accept') {
          fetchFriends();
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} friend request:`, error);
    }
  };

  const renderMenu = () => (
    <div className="space-y-6">
      {/* User Info */}
      <div className="bg-dark-700/50 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-white">{user.username[0].toUpperCase()}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user.username}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center space-x-1">
                <Trophy size={14} />
                <span>{user.rating}</span>
              </span>
              <span>{user.gamesPlayed} games</span>
            </div>
          </div>
        </div>
      </div>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <h4 className="text-yellow-400 font-medium mb-3">Friend Requests ({friendRequests.length})</h4>
          <div className="space-y-2">
            {friendRequests.slice(0, 3).map((request: any) => (
              <div key={request._id} className="flex items-center justify-between">
                <span className="text-white text-sm">{request.from.username}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleFriendRequest(request._id, 'accept')}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs text-white"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleFriendRequest(request._id, 'reject')}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Options */}
      <div className="space-y-3">
        <motion.button
          onClick={handleFindMatch}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full p-4 bg-gradient-to-r from-green-600/20 to-blue-600/20 border-2 border-green-500/30 hover:border-green-500/60 rounded-xl transition-all duration-300 text-left"
        >
          <div className="flex items-center space-x-3">
            <Search className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Find Match</h3>
              <p className="text-gray-400 text-sm">Play against a random opponent</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          onClick={() => setCurrentView('friends')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-500/30 hover:border-blue-500/60 rounded-xl transition-all duration-300 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Friends</h3>
                <p className="text-gray-400 text-sm">Manage friends and send invites</p>
              </div>
            </div>
            <span className="text-blue-400 font-medium">{friends.length}</span>
          </div>
        </motion.button>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
        <Search className="w-10 h-10 text-white animate-pulse" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Searching for opponent...</h3>
        <p className="text-gray-400">We're finding you a worthy challenger!</p>
      </div>

      <div className="flex justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <motion.button
        onClick={handleCancelSearch}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium text-white transition-colors"
      >
        Cancel Search
      </motion.button>
    </div>
  );

  const renderFriends = () => (
    <div className="space-y-6">
      {/* Search Users */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">Add Friends</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
            className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search username..."
          />
          <button
            onClick={searchUsers}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white transition-colors"
          >
            <Search size={18} />
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2">
            {searchResults.map((user: any) => (
              <div key={user._id} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                <div>
                  <span className="text-white font-medium">{user.username}</span>
                  <span className="text-gray-400 text-sm ml-2">Rating: {user.rating}</span>
                </div>
                <button
                  onClick={() => sendFriendRequest(user.username)}
                  className="flex items-center space-x-1 px-3 py-1 bg-primary-600 hover:bg-primary-700 rounded text-sm text-white transition-colors"
                >
                  <UserPlus size={14} />
                  <span>Add</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Friends List */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">Your Friends ({friends.length})</h3>
        {friends.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No friends yet. Search and add some!</p>
        ) : (
          <div className="space-y-2">
            {friends.map((friend: any) => (
              <div key={friend._id} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <div>
                    <span className="text-white font-medium">{friend.username}</span>
                    <div className="text-gray-400 text-sm">
                      Rating: {friend.rating} • {friend.gamesPlayed} games
                    </div>
                  </div>
                </div>
                <button
                  disabled={!friend.isOnline}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm text-white transition-colors"
                >
                  {friend.isOnline ? 'Challenge' : 'Offline'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="bg-dark-800 rounded-2xl border border-dark-700 w-full max-w-md p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {currentView !== 'menu' && (
                <button
                  onClick={() => setCurrentView('menu')}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <Users className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl sm:text-2xl font-bold font-poppins">
                {currentView === 'menu' && 'Multiplayer Chess'}
                {currentView === 'search' && 'Finding Match'}
                {currentView === 'friends' && 'Friends'}
                {currentView === 'game' && 'Live Game'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'menu' && renderMenu()}
              {currentView === 'search' && renderSearch()}
              {currentView === 'friends' && renderFriends()}
              {currentView === 'game' && (
                <div className="text-center">
                  <p className="text-white">Game interface would go here...</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MultiplayerChess;