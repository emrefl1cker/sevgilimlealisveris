import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDlLZ7hewfB12ov7lORQ49jXRD_PyE9NGY",
  authDomain: "sevgilimlealisveris.firebaseapp.com",
  databaseURL: "https://sevgilimlealisveris-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sevgilimlealisveris",
  storageBucket: "sevgilimlealisveris.firebasestorage.app",
  messagingSenderId: "220650343870",
  appId: "1:220650343870:web:4d097caa774001ba96bdef"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);