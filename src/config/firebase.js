// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCM495JbCv9D7E5Em06FwUSEivpWvCZaPI",
  authDomain: "newz-60631.firebaseapp.com",
  databaseURL: "https://newz-60631-default-rtdb.firebaseio.com",
  projectId: "newz-60631",
  storageBucket: "newz-60631.appspot.com",
  messagingSenderId: "785217104258",
  appId: "1:785217104258:web:14214059653761f1c5879b",
  measurementId: "G-XC9W8CGZ3T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
const analytics = getAnalytics(app);
