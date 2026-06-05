import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyB2Nqh4JenfPCm1nsyf7RIXJT6N3xzDiu8",
    authDomain: "jc-card-wars.firebaseapp.com",
    databaseURL: "https://jc-card-wars-default-rtdb.firebaseio.com/",
    projectId: "jc-card-wars",
    storageBucket: "jc-card-wars.firebasestorage.app",
    messagingSenderId: "783628984974",
    appId: "1:783628984974:web:519a9be3c102ee6c7f5fdf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
