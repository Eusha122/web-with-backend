import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, UserPlus, Users, Crown, MessageCircle, Trophy, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface FriendsChessProps {
  onBack: () => void;
}

interface Friend {
  id: string;
  displayName: string;
  email: string;
  status: 'online' | 'offline' | 'in-game';
  rating?: number;
}

interface GameInvitation {
  id: string;
  from: string;
  to: string;
  fromName: string;
  toName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
}

const FriendsChess: React.FC<FriendsChessProps> = ({ onBack }) => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'invitations'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [invitations, setInvitations] = useState<GameInvitation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Listen for game invitations
      const invitationsQuery = query(
        collection(db, 'gameInvitations'),
        where('to', '==', currentUser.email)
      );
      
      const unsubscribe = onSnapshot(invitationsQuery, (snapshot) => {
        const invitationsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GameInvitation[];
        setInvitations(invitationsList.filter(inv => inv.status === 'pending'));
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('displayName', '>=', searchQuery),
        where('displayName', '<=', searchQuery + '\uf8ff')
      );
      
      const snapshot = await getDocs(usersQuery);
      const users = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.email !== currentUser?.email);
      
      setSearchResults(users);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendGameInvitation = async (toUser: any) => {
    if (!currentUser) return;

    try {
      await addDoc(collection(db, 'gameInvitations'), {
        from: currentUser.email,
        to: toUser.email,
        fromName: currentUser.displayName,
        toName: toUser.displayName,
        status: 'pending',
        createdAt: new Date()
      });
      
      alert('Game invitation sent!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation');
    }
  };

  const handleInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      await updateDoc(doc(db, 'gameInvitations', invitationId), {
        status: action === 'accept' ? 'accepted' : 'declined'
      });

      if (action === 'accept') {
        // Here you would start the chess game
        alert('Game accepted! Starting chess game...');
      }
    } catch (error) {
      console.error('Error handling invitation:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onBack();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <div className="border-b border-dark-700 bg-dark-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Bots</span>
              </motion.button>
              <div className="h-6 w-px bg-dark-600"></div>
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-xl font-bold font-poppins">Friends Chess</h1>
                  <p className="text-sm text-gray-400">Play with your friends</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser && (
                <>
                  <div className="text-right">
                    <p className="text-sm font-medium">{currentUser.displayName}</p>
                    <p className="text-xs text-gray-400">{currentUser.email}</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {currentUser.displayName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-700">
              <h3 className="text-lg font-bold mb-4">Navigation</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('friends')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'friends' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Users size={18} />
                    <span>My Friends</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('search')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'search' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Search size={18} />
                    <span>Find Players</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('invitations')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'invitations' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageCircle size={18} />
                      <span>Invitations</span>
                    </div>
                    {invitations.length > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {invitations.length}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Friends Tab */}
              {activeTab === 'friends' && (
                <motion.div
                  key="friends"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2">My Friends</h2>
                    <p className="text-gray-400">Challenge your friends to chess matches</p>
                  </div>

                  {friends.length === 0 ? (
                    <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-8 border border-dark-700 text-center">
                      <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">No friends yet</h3>
                      <p className="text-gray-400 mb-4">Search for players and send them friend requests!</p>
                      <button
                        onClick={() => setActiveTab('search')}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold transition-colors"
                      >
                        Find Players
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {friends.map((friend) => (
                        <div
                          key={friend.id}
                          className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-700"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold">
                                  {friend.displayName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-lg font-bold">{friend.displayName}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                  <span className={`flex items-center space-x-1 ${
                                    friend.status === 'online' ? 'text-green-400' : 'text-gray-500'
                                  }`}>
                                    <div className={`w-2 h-2 rounded-full ${
                                      friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                                    }`}></div>
                                    <span>{friend.status}</span>
                                  </span>
                                  {friend.rating && (
                                    <span className="flex items-center space-x-1">
                                      <Trophy size={14} />
                                      <span>{friend.rating}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              disabled={friend.status !== 'online'}
                              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                            >
                              Challenge
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Search Tab */}
              {activeTab === 'search' && (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Find Players</h2>
                    <p className="text-gray-400">Search for players by their display name</p>
                  </div>

                  <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-700">
                    <div className="flex space-x-4 mb-6">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                        className="flex-1 px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Search by display name..."
                      />
                      <button
                        onClick={searchUsers}
                        disabled={loading}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg font-semibold transition-colors"
                      >
                        {loading ? 'Searching...' : 'Search'}
                      </button>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold">Search Results</h3>
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                                <span className="font-bold">
                                  {user.displayName?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-bold">{user.displayName}</h4>
                                <p className="text-sm text-gray-400">{user.email}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => sendGameInvitation(user)}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                            >
                              <UserPlus size={16} />
                              <span>Invite to Game</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Invitations Tab */}
              {activeTab === 'invitations' && (
                <motion.div
                  key="invitations"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Game Invitations</h2>
                    <p className="text-gray-400">Pending game invitations from other players</p>
                  </div>

                  {invitations.length === 0 ? (
                    <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-8 border border-dark-700 text-center">
                      <MessageCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">No pending invitations</h3>
                      <p className="text-gray-400">When someone invites you to a game, it will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {invitations.map((invitation) => (
                        <div
                          key={invitation.id}
                          className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-700"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <Crown className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold">Game Invitation</h3>
                                <p className="text-gray-400">
                                  <span className="text-white font-medium">{invitation.fromName}</span> wants to play chess with you
                                </p>
                                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                  <Clock size={14} />
                                  <span>{invitation.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleInvitation(invitation.id, 'decline')}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleInvitation(invitation.id, 'accept')}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                              >
                                Accept
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsChess;