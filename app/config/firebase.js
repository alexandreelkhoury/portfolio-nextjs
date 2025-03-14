import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBrIA32eByfQtGNGnYabk8WDybgMcUKh-Q",
  authDomain: "portfolio-software-engineer.firebaseapp.com",
  projectId: "portfolio-software-engineer",
  storageBucket: "portfolio-software-engineer.firebasestorage.app",
  messagingSenderId: "360987397394",
  appId: "1:360987397394:web:a573cd3bff329598d2f7cb",
  measurementId: "G-EJJCET30K1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);