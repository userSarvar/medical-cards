import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsnFomZsdQJroU1hhNMHas1tuQAjUMz28",
  authDomain: "medical-cards-a8480.firebaseapp.com",
  projectId: "medical-cards-a8480",
  storageBucket: "medical-cards-a8480.firebasestorage.app",
  messagingSenderId: "424784878283",
  appId: "1:424784878283:web:b8f1bf6a2bd5e6b66ad94e",
  measurementId: "G-RX8LLRVSMS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);