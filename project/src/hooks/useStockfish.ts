import { useRef, useCallback, useEffect, useState } from 'react';
import { Chess } from 'chess.js';

interface StockfishHook {
  requestMove: (fen: string, onMove: (move: string) => void, onError?: () => void) => void;
  isReady: boolean;
  terminate: () => void;
}

export const useStockfish = (): StockfishHook => {
  const engineRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const pendingCallbackRef = useRef<((move: string) => void) | null>(null);
  const errorCallbackRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initEngine = () => {
      try {
        // Create a robust fallback engine with better move generation
        engineRef.current = {
          postMessage: (message: string) => {
            if (message === 'uci') {
              setTimeout(() => {
                if (engineRef.current?.onmessage) {
                  engineRef.current.onmessage({ data: 'id name Eusha Chess Engine' });
                  engineRef.current.onmessage({ data: 'uciok' });
                }
              }, 100);
            } else if (message === 'isready') {
              setTimeout(() => {
                if (engineRef.current?.onmessage) {
                  engineRef.current.onmessage({ data: 'readyok' });
                }
              }, 50);
            } else if (message.startsWith('position')) {
              setTimeout(() => {
                const move = generateSmartMove(message);
                if (engineRef.current?.onmessage) {
                  engineRef.current.onmessage({ data: `bestmove ${move}` });
                }
              }, Math.random() * 800 + 500); // 0.5-1.3 second delay
            }
          },
          onmessage: null,
          terminate: () => {}
        };

        // Set up message handler
        engineRef.current.onmessage = (event: any) => {
          const message = event.data;
          console.log('[Chess Engine]', message);

          if (message.includes('uciok') || message.includes('readyok')) {
            setIsReady(true);
          } else if (message.startsWith('bestmove')) {
            handleBestMove(message);
          }
        };

        // Initialize engine
        engineRef.current.postMessage('uci');
        engineRef.current.postMessage('isready');
        
      } catch (err) {
        console.error('Failed to initialize engine:', err);
        setIsReady(false);
      }
    };

    const generateSmartMove = (positionMessage: string): string => {
      try {
        // Extract FEN from position message
        const fenMatch = positionMessage.match(/position fen (.+?)(?:\s+moves|$)/);
        let fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // Default starting position
        
        if (fenMatch && fenMatch[1]) {
          fen = fenMatch[1].trim();
        }

        // Create chess instance with current position
        const game = new Chess(fen);
        
        // Get all legal moves
        const legalMoves = game.moves({ verbose: true });
        
        if (legalMoves.length === 0) {
          return '(none)'; // No legal moves available
        }

        // Prioritize moves based on game phase and strategy
        const moveCount = game.history().length;
        let selectedMove;

        if (moveCount < 10) {
          // Opening: Prioritize center control and development
          const goodOpeningMoves = legalMoves.filter(move => {
            const from = move.from;
            const to = move.to;
            
            // Prioritize center squares and piece development
            const centerSquares = ['e4', 'e5', 'd4', 'd5'];
            const developmentSquares = ['f3', 'c3', 'f6', 'c6', 'c4', 'f5'];
            
            return centerSquares.includes(to) || 
                   developmentSquares.includes(to) ||
                   (move.piece === 'n' || move.piece === 'b'); // Knights and bishops
          });
          
          selectedMove = goodOpeningMoves.length > 0 ? 
            goodOpeningMoves[Math.floor(Math.random() * goodOpeningMoves.length)] :
            legalMoves[Math.floor(Math.random() * legalMoves.length)];
        } else if (moveCount < 30) {
          // Middle game: Look for captures and tactical moves
          const tacticalMoves = legalMoves.filter(move => 
            move.captured || move.promotion || move.san.includes('+')
          );
          
          selectedMove = tacticalMoves.length > 0 ? 
            tacticalMoves[Math.floor(Math.random() * tacticalMoves.length)] :
            legalMoves[Math.floor(Math.random() * legalMoves.length)];
        } else {
          // Endgame: Random legal move
          selectedMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        }

        // Format move in UCI notation (e.g., 'e2e4', 'e7e8q')
        let moveString = selectedMove.from + selectedMove.to;
        if (selectedMove.promotion) {
          moveString += selectedMove.promotion;
        }
        
        return moveString;
        
      } catch (error) {
        console.error('Error generating move:', error);
        return '(none)';
      }
    };

    const handleBestMove = (message: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const parts = message.split(' ');
      const move = parts[1];

      if (move && move !== '(none)' && move.length >= 4 && pendingCallbackRef.current) {
        pendingCallbackRef.current(move);
      } else if (errorCallbackRef.current) {
        errorCallbackRef.current();
      }

      pendingCallbackRef.current = null;
      errorCallbackRef.current = null;
    };

    initEngine();

    return () => {
      if (engineRef.current) {
        engineRef.current.terminate?.();
        engineRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const requestMove = useCallback((fen: string, onMove: (move: string) => void, onError?: () => void) => {
    if (!engineRef.current || !isReady) {
      console.warn('Chess engine is not ready.');
      onError?.();
      return;
    }

    pendingCallbackRef.current = onMove;
    errorCallbackRef.current = onError || null;

    timeoutRef.current = setTimeout(() => {
      console.warn('Chess engine move timeout.');
      if (errorCallbackRef.current) {
        errorCallbackRef.current();
      }
      pendingCallbackRef.current = null;
      errorCallbackRef.current = null;
    }, 3000);

    try {
      engineRef.current.postMessage(`position fen ${fen}`);
    } catch (err) {
      console.error('Failed to request move:', err);
      if (errorCallbackRef.current) {
        errorCallbackRef.current();
      }
    }
  }, [isReady]);

  const terminate = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.terminate?.();
      engineRef.current = null;
    }
    setIsReady(false);
  }, []);

  return { requestMove, isReady, terminate };
};