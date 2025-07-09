// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCt2vJy7OpVXxx4bdEjiCoKWmgBrIQTGss",
  authDomain: "web-of-eusha.firebaseapp.com",
  projectId: "web-of-eusha",
  storageBucket: "web-of-eusha.firebasestorage.app",
  messagingSenderId: "548250895074",
  appId: "1:548250895074:web:2cfe5f75578ce8861554bb",
  measurementId: "G-W6D4YYRLM3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, analytics };
export default app;