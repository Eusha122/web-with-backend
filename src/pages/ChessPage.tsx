import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Crown, Users, Bot, Star, Lock, Search, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChessGame from '../components/ChessGame';
import AuthModal from '../components/AuthModal';
import FriendsChess from '../components/FriendsChess';
import { useAuth } from '../contexts/AuthContext';

const ChessPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedMode, setSelectedMode] = useState<'bot' | 'friends' | null>(null);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  const bots = [
    {
      id: 'eusha-bot',
      name: 'Eusha Bot',
      rating: 2000,
      difficulty: 'Expert',
      description: 'Challenge the creator himself! A strong tactical player.',
      avatar: '/481281109_1096804492202639_400819024598160651_n.jpg',
      available: true
    }
  ];

  const upcomingBots = [
    {
      id: 'tactical-master',
      name: 'Tactical Master',
      rating: 2200,
      difficulty: 'Master',
      description: 'Specializes in tactical combinations and puzzles.',
      available: false
    },
    {
      id: 'endgame-expert',
      name: 'Endgame Expert',
      rating: 2100,
      difficulty: 'Expert',
      description: 'Master of endgame positions and techniques.',
      available: false
    },
    {
      id: 'blitz-king',
      name: 'Blitz King',
      rating: 1900,
      difficulty: 'Advanced',
      description: 'Fast-paced games with quick tactical shots.',
      available: false
    }
  ];

  const handleBotSelect = (botId: string) => {
    setSelectedBot(botId);
    setSelectedMode('bot');
  };

  const handleFriendsMode = () => {
    if (currentUser) {
      setSelectedMode('friends');
    } else {
      setShowAuth(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setSelectedMode('friends');
  };

  if (selectedMode === 'bot' && selectedBot) {
    return (
      <ChessGame
        isOpen={true}
        onClose={() => {
          setSelectedMode(null);
          setSelectedBot(null);
        }}
        botId={selectedBot}
      />
    );
  }

  if (selectedMode === 'friends') {
    return (
      <FriendsChess
        onBack={() => setSelectedMode(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <div className="border-b border-dark-700 bg-dark-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Portfolio</span>
              </motion.button>
              <div className="h-6 w-px bg-dark-600"></div>
              <div className="flex items-center space-x-3">
                <Crown className="w-8 h-8 text-yellow-400" />
                <div>
                  <h1 className="text-xl font-bold font-poppins">Chess Arena</h1>
                  <p className="text-sm text-gray-400">Choose your opponent</p>
                </div>
              </div>
            </div>
            
            {currentUser && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{currentUser.displayName}</p>
                  <p className="text-xs text-gray-400">{currentUser.email}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {currentUser.displayName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Available Bots */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Available Bots</h2>
              <p className="text-gray-400">Challenge AI opponents of different skill levels</p>
            </div>

            <div className="grid gap-6">
              {bots.map((bot) => (
                <motion.div
                  key={bot.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-700 hover:border-primary-500/50 transition-all duration-300 cursor-pointer"
                  onClick={() => handleBotSelect(bot.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-500">
                      <img 
                        src={bot.avatar} 
                        alt={bot.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold">{bot.name}</h3>
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                          Available
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                        <span className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>{bot.rating} ELO</span>
                        </span>
                        <span>{bot.difficulty}</span>
                      </div>
                      <p className="text-gray-300">{bot.description}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 rounded-lg font-semibold text-white transition-all duration-200"
                    >
                      Challenge
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Upcoming Bots */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-2">Upcoming Bots</h2>
              <p className="text-gray-400 mb-6">More challenging opponents coming soon!</p>

              <div className="grid gap-4">
                {upcomingBots.map((bot) => (
                  <motion.div
                    key={bot.id}
                    className="bg-dark-800/30 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50 opacity-60"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center">
                        <Bot className="w-8 h-8 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-300">{bot.name}</h3>
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                            Coming Soon
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <span className="flex items-center space-x-1">
                            <Star className="w-4 h-4" />
                            <span>{bot.rating} ELO</span>
                          </span>
                          <span>{bot.difficulty}</span>
                        </div>
                        <p className="text-gray-400">{bot.description}</p>
                      </div>
                      <button
                        disabled
                        className="px-6 py-3 bg-dark-700 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                      >
                        <Lock className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Play with Friends Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 cursor-pointer"
                onClick={handleFriendsMode}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3">Play with Friends</h3>
                  <p className="text-gray-300 mb-6">
                    Challenge your friends to live chess matches. Search by username and send game invitations.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2 text-sm text-blue-300">
                      <Search className="w-4 h-4" />
                      <span>Search friends by username</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-blue-300">
                      <UserPlus className="w-4 h-4" />
                      <span>Send game invitations</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-blue-300">
                      <Crown className="w-4 h-4" />
                      <span>Real-time multiplayer games</span>
                    </div>
                  </div>

                  {!currentUser ? (
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
                      <p className="text-yellow-300 text-sm">
                        Sign in required to play with friends
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-4">
                      <p className="text-green-300 text-sm">
                        Ready to challenge friends!
                      </p>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-white transition-all duration-200"
                  >
                    {currentUser ? 'Enter Friends Mode' : 'Sign In to Play'}
                  </motion.button>
                </div>
              </motion.div>

              {/* Chess.com Style Features */}
              <div className="mt-6 bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-700">
                <h4 className="text-lg font-bold mb-4">Features</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Live game notifications</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Friend management system</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Game history & analysis</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Rating system</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default ChessPage;