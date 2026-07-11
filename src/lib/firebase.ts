import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2rErWOHsMLsUEoCrINJ2DzKv9WLC7fy8",
  authDomain: "app-barbeiros-93ebb.firebaseapp.com",
  projectId: "app-barbeiros-93ebb",
  storageBucket: "app-barbeiros-93ebb.firebasestorage.app",
  messagingSenderId: "634674722638",
  appId: "1:634674722638:web:1e1c0983d7587b75e7901f",
  measurementId: "G-06T6TV2WLC",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
