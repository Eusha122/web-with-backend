import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle } from 'lucide-react';

interface VisitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, relation: string, email?: string) => Promise<{success: boolean, message: string}>;
}

const VisitorModal: React.FC<VisitorModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const relations = [
    { value: 'friend', label: 'Friend' },
    { value: 'family', label: 'Family Member' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'student', label: 'Fellow Student' },
    { value: 'teacher', label: 'Teacher/Mentor' },
    { value: 'recruiter', label: 'Recruiter' },
    { value: 'stranger', label: 'Just Curious' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !relation) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await onSubmit(name, relation, email);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // Reset form
        setName('');
        setRelation('');
        setEmail('');
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setRelation('');
    setEmail('');
    setMessage(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-dark-800 rounded-xl p-6 w-full max-w-md border border-dark-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-poppins">Welcome! 👋</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
                data-cursor="pointer"
              >
                <X size={20} />
              </button>
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
                  message.type === 'success' 
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'bg-red-500/20 border border-red-500/30 text-red-400'
                }`}
              >
                {message.type === 'success' ? (
                  <Check size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span className="text-sm">{message.text}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your name"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Relation to Me *
                </label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  disabled={loading}
                >
                  <option value="">Select your relation</option>
                  {relations.map((rel) => (
                    <option key={rel.value} value={rel.value}>
                      {rel.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your@email.com"
                  disabled={loading}
                />
                <p className="text-xs text-gray-400 mt-1">
                  I'll send you a thank you message for visiting! 📧
                </p>
              </div>

              <motion.button
                type="submit"
                disabled={loading || !name || !relation}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200"
                data-cursor="pointer"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding to visitor book...</span>
                  </div>
                ) : (
                  'Add Me to Visitors List'
                )}
              </motion.button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                Thank you for visiting my portfolio! Your information helps me understand my audience better.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VisitorModal;