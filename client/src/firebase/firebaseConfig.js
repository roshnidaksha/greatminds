import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDGtQ73FZPs8rtf3Odg4rz4duUOKSULgHM",
    authDomain: "greatminds-52fd1.firebaseapp.com",
    projectId: "greatminds-52fd1",
    storageBucket: "greatminds-52fd1.firebasestorage.app",
    messagingSenderId: "395788499346",
    appId: "1:395788499346:web:64fe68f3090c2b38a6a94b",
    measurementId: "G-C36N817DWZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);