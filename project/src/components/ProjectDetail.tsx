import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ExternalLink, Github } from 'lucide-react';

interface ProjectDetailProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, isOpen, onClose }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(Object.keys(project?.languages || {})[0] || '');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, language: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(language);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="h-full w-full bg-dark-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-dark-700 flex-shrink-0">
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">{project.title}</h1>
                  <p className="text-gray-400 text-xs sm:text-sm lg:text-base">{project.description}</p>
                </div>
                <div className="hidden sm:flex flex-wrap gap-1 sm:gap-2">
                  {project.tags.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4">
                {/* External Links */}
                <div className="hidden sm:flex items-center space-x-1">
                  <motion.a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="View on GitHub"
                  >
                    <Github size={16} />
                  </motion.a>
                  <motion.a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="View Demo"
                  >
                    <ExternalLink size={16} />
                  </motion.a>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Tags */}
            <div className="sm:hidden px-3 py-2 border-b border-dark-700">
              <div className="flex flex-wrap gap-1">
                {project.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Mobile External Links */}
            <div className="sm:hidden flex items-center justify-center space-x-4 px-3 py-2 border-b border-dark-700 bg-dark-700/30">
              <motion.a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-3 py-2 bg-dark-600 hover:bg-dark-500 rounded-lg text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Github size={16} />
                <span>GitHub</span>
              </motion.a>
              <motion.a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white transition-colors text-sm"
              >
                <ExternalLink size={16} />
                <span>Live Demo</span>
              </motion.a>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-hidden p-2 sm:p-4">
              <div className="bg-dark-700/50 rounded-xl border border-dark-600 h-full flex flex-col">
                <div className="flex items-center justify-between p-2 sm:p-4 border-b border-dark-600 flex-shrink-0">
                  <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
                    {Object.keys(project.languages).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                          selectedLanguage === lang
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-600 text-gray-400 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                  <motion.button
                    onClick={() => copyToClipboard(project.languages[selectedLanguage], selectedLanguage)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 bg-dark-600 hover:bg-dark-500 rounded-md text-xs sm:text-sm text-gray-400 hover:text-white transition-colors ml-2"
                  >
                    {copiedCode === selectedLanguage ? (
                      <>
                        <Check size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </motion.button>
                </div>
                <div className="flex-1 overflow-auto p-2 sm:p-4">
                  <pre className="text-xs sm:text-sm text-gray-300 whitespace-pre-wrap break-words">
                    <code>{project.languages[selectedLanguage]}</code>
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectDetail;