// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGwNICLZst21EC0CDhRsfxDnTtri_nKWM",
  authDomain: "clearfeed-32c81.firebaseapp.com",
  projectId: "clearfeed-32c81",
  storageBucket: "clearfeed-32c81.firebasestorage.app",
  messagingSenderId: "997694264279",
  appId: "1:997694264279:web:31a5855ce59279fd537192"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);