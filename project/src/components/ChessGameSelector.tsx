import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Users, Bot, Zap } from 'lucide-react';
import ChessGame from './ChessGame';
import MultiplayerChess from './MultiplayerChess';
import AuthModal from './AuthModal';

interface ChessGameSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChessGameSelector: React.FC<ChessGameSelectorProps> = ({ isOpen, onClose }) => {
  const [selectedMode, setSelectedMode] = useState<'bot' | 'multiplayer' | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleModeSelect = (mode: 'bot' | 'multiplayer') => {
    if (mode === 'bot') {
      setSelectedMode('bot');
    } else {
      // Check if user is logged in
      const token = localStorage.getItem('chess_token');
      if (token) {
        setSelectedMode('multiplayer');
      } else {
        setShowAuth(true);
      }
    }
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setShowAuth(false);
    setSelectedMode('multiplayer');
  };

  const handleBack = () => {
    setSelectedMode(null);
    setShowAuth(false);
  };

  const handleClose = () => {
    setSelectedMode(null);
    setShowAuth(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="h-full w-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {!selectedMode && !showAuth && (
              <div className="bg-dark-800 rounded-2xl border border-dark-700 w-full max-w-md p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Crown className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-xl sm:text-2xl font-bold font-poppins">Choose Game Mode</h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Game Mode Options */}
                <div className="space-y-4">
                  {/* Play with Bot */}
                  <motion.button
                    onClick={() => handleModeSelect('bot')}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-6 bg-gradient-to-r from-primary-600/20 to-accent-600/20 border-2 border-primary-500/30 hover:border-primary-500/60 rounded-xl transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">Play with Eusha Bot</h3>
                        <p className="text-gray-400 text-sm">Challenge the AI engine • No registration required</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Zap className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 text-xs font-medium">2000+ ELO Engine</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  {/* Multiplayer */}
                  <motion.button
                    onClick={() => handleModeSelect('multiplayer')}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-6 bg-gradient-to-r from-green-600/20 to-blue-600/20 border-2 border-green-500/30 hover:border-green-500/60 rounded-xl transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">Multiplayer Chess</h3>
                        <p className="text-gray-400 text-sm">Play against real players • Friends & matchmaking</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-green-400 text-xs font-medium">• Live games</span>
                          <span className="text-blue-400 text-xs font-medium">• Friend requests</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm">
                    Choose your preferred way to play chess with Eusha!
                  </p>
                </div>
              </div>
            )}

            {/* Auth Modal */}
            {showAuth && (
              <AuthModal
                isOpen={showAuth}
                onClose={handleBack}
                onSuccess={handleAuthSuccess}
              />
            )}

            {/* Bot Game */}
            {selectedMode === 'bot' && (
              <ChessGame
                isOpen={true}
                onClose={handleBack}
              />
            )}

            {/* Multiplayer Game */}
            {selectedMode === 'multiplayer' && (
              <MultiplayerChess
                isOpen={true}
                onClose={handleBack}
                user={user}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChessGameSelector;