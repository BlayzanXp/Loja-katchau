// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA0u9w69i1bflyVju3At_cVweU_zDf4WnI",
  authDomain: "katchau-86464.firebaseapp.com",
  databaseURL: "https://katchau-86464-default-rtdb.firebaseio.com",
  projectId: "katchau-86464",
  storageBucket: "katchau-86464.firebasestorage.app",
  messagingSenderId: "482704550968",
  appId: "1:482704550968:web:708a93ea7f1ca8898ecacd",
  measurementId: "G-KGMBEDPEV5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);