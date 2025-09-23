
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-7505174013-b6eb1",
  "appId": "1:798364226425:web:6165f14cc1d66c2b6915a8",
  "apiKey": "AIzaSyBDwhUhsVe6g4ymn1PvP7IQauj-9ha3UfE",
  "authDomain": "studio-7505174013-b6eb1.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "798364226425"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Auth functions
const signup = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

const login = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

const logout = () => {
  return signOut(auth);
};

export { auth, db, signup, login, logout };
