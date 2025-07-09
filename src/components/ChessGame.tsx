@@ .. @@
 import { useChessAudio } from '../hooks/useChessAudio';

 interface ChessGameProps {
   isOpen: boolean;
   onClose: () => void;
+  botId?: string;
 }

-const ChessGame: React.FC<ChessGameProps> = ({ isOpen, onClose }) => {
+const ChessGame: React.FC<ChessGameProps> = ({ isOpen, onClose, botId = 'eusha-bot' }) => {
   const [gameState, setGameState] = useState<GameState>({
@@ .. @@
   });

   const { requestMove, isReady } = useStockfish();
   const { playMoveSound, playCaptureSound, playCheckSound, playGameEndSound, speakMessage, stopSpeaking } = useChessAudio();
   const boardRef = useRef<any>(null);

+  // Bot information based on botId
+  const getBotInfo = (id: string) => {
+    switch (id) {
+      case 'eusha-bot':
+        return {
+          name: 'Eusha Bot',
+          rating: 2000,
+          avatar: '/481281109_1096804492202639_400819024598160651_n.jpg'
+        };
+      default:
+        return {
+          name: 'Chess Bot',
+          rating: 1500,
+          avatar: '/481281109_1096804492202639_400819024598160651_n.jpg'
+        };
+    }
+  };
+
+  const botInfo = getBotInfo(botId);
+
   // Gender-based bot messages
   const maleTrashTalk = [
@@ .. @@
                         <div className="flex items-center space-x-3 mb-2">
                           <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-primary-500 flex-shrink-0">
                             <img 
-                              src="/481281109_1096804492202639_400819024598160651_n.jpg" 
-                              alt="Eusha" 
+                              src={botInfo.avatar} 
+                              alt={botInfo.name} 
                               className="w-full h-full object-cover"
                             />
                           </div>
                           <div className="min-w-0 flex-1">
-                            <h4 className="font-bold text-sm sm:text-base truncate">Eusha</h4>
-                            <p className="text-xs sm:text-sm text-gray-400">Rating: 2000</p>
+                            <h4 className="font-bold text-sm sm:text-base truncate">{botInfo.name}</h4>
+                            <p className="text-xs sm:text-sm text-gray-400">Rating: {botInfo.rating}</p>
                           </div>
                         </div>
@@ .. @@
                         <div className="flex items-center space-x-3 mb-2">
                           <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-primary-500 flex-shrink-0">
                             <img 
-                              src="/481281109_1096804492202639_400819024598160651_n.jpg" 
-                              alt="Eusha" 
+                              src={botInfo.avatar} 
+                              alt={botInfo.name} 
                               className="w-full h-full object-cover"
                             />
                           </div>
                           <div className="min-w-0 flex-1">
-                            <h4 className="font-bold text-sm sm:text-base truncate">Eusha</h4>
-                            <p className="text-xs sm:text-sm text-gray-400">Rating: 2000</p>
+                            <h4 className="font-bold text-sm sm:text-base truncate">{botInfo.name}</h4>
+                            <p className="text-xs sm:text-sm text-gray-400">Rating: {botInfo.rating}</p>
                           </div>
                         </div>
@@ .. @@
                       <div className="text-xs sm:text-sm text-gray-400 mt-1">
                         Engine: Eusha Chess Engine v1.0
                       </div>