import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "INSIRA SUAS CREDENCIAIS",
  authDomain: "INSIRA SUAS CREDENCIAIS",
  projectId: "INSIRA SUAS CREDENCIAIS",
  storageBucket: "INSIRA SUAS CREDENCIAIS",
  messagingSenderId: "INSIRA SUAS CREDENCIAIS",
  appId: "INSIRA SUAS CREDENCIAIS",
  measurementId: "INSIRA SUAS CREDENCIAIS"
};

// Inicializa o aplicativo do Firebase
const app = initializeApp(firebaseConfig);

// Inicializa e exporta o banco de dados (Firestore) para usarmos no App.jsx
export const db = getFirestore(app);
