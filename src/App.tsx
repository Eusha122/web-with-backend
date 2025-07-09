@@ .. @@
 import React, { useState, useEffect } from 'react';
+import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
 import { motion, AnimatePresence } from 'framer-motion';
+import { AuthProvider } from './contexts/AuthContext';
 import Navbar from './components/Navbar';
 import Hero from './components/Hero';
 import About from './components/About';
@@ -12,6 +14,7 @@
 import CustomCursor from './components/CustomCursor';
 import ParticleBackground from './components/ParticleBackground';
 import ScrollProgress from './components/ScrollProgress';
+import ChessPage from './pages/ChessPage';

 function App() {
   const [isLoading, setIsLoading] = useState(true);
@@ .. @@
   };

   return (
-    <div className="relative min-h-screen bg-dark-900 text-white overflow-x-hidden">
-      <CustomCursor />
-      <ParticleBackground />
-      <ScrollProgress />
-      
-      <AnimatePresence mode="wait">
-        {isLoading ? (
-          <LoadingScreen key="loading" />
-        ) : (
-          <motion.div
-            key="main"
-            initial={{ opacity: 0 }}
-            animate={{ opacity: 1 }}
-            transition={{ duration: 0.5 }}
-            className="relative z-10"
-          >
-            <Navbar visitors={visitors} onAddVisitor={addVisitor} />
-            <Hero />
-            <About />
-            <Projects />
-            <Blog />
-            <Contact />
-            <Footer />
-          </motion.div>
-        )}
-      </AnimatePresence>
-    </div>
+    <AuthProvider>
+      <Router>
+        <div className="relative min-h-screen bg-dark-900 text-white overflow-x-hidden">
+          <CustomCursor />
+          <ParticleBackground />
+          <ScrollProgress />
+          
+          <Routes>
+            <Route path="/chess" element={<ChessPage />} />
+            <Route path="/" element={
+              <AnimatePresence mode="wait">
+                {isLoading ? (
+                  <LoadingScreen key="loading" />
+                ) : (
+                  <motion.div
+                    key="main"
+                    initial={{ opacity: 0 }}
+                    animate={{ opacity: 1 }}
+                    transition={{ duration: 0.5 }}
+                    className="relative z-10"
+                  >
+                    <Navbar visitors={visitors} onAddVisitor={addVisitor} />
+                    <Hero />
+                    <About />
+                    <Projects />
+                    <Blog />
+                    <Contact />
+                    <Footer />
+                  </motion.div>
+                )}
+              </AnimatePresence>
+            } />
+          </Routes>
+        </div>
+      </Router>
+    </AuthProvider>
   );
 }