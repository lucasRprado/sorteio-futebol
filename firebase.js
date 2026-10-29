import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSuZcvXdNHPdZrbH1kmZN4AShZrDOVC4I",
  authDomain: "sorteio-de-times-e5e7e.firebaseapp.com",
  projectId: "sorteio-de-times-e5e7e",
  storageBucket: "sorteio-de-times-e5e7e.firebasestorage.app",
  messagingSenderId: "339004964423",
  appId: "1:339004964423:web:5906d069920831d3153b62",
  measurementId: "G-9WEGQ1EXK6"
};

// Inicializa o aplicativo do Firebase
const app = initializeApp(firebaseConfig);

// Inicializa e exporta o banco de dados (Firestore) para usarmos no App.jsx
export const db = getFirestore(app);