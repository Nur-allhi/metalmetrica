// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "metalmetrica",
  "appId": "1:147093856086:web:e16dabb0291805e9ddc0f7",
  "storageBucket": "metalmetrica.firebasestorage.app",
  "apiKey": "AIzaSyD6JyjwtLk7GdG8w4fPQn3XBSfjt2YxI2M",
  "authDomain": "metalmetrica.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "147093856086"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
