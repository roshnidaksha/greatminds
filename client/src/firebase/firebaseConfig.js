import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDQ-l6rvz_Z0yDIdhwEe3nxTPTEiSi_fTI",
    authDomain: "greatminds-d4d94.firebaseapp.com",
    projectId: "greatminds-d4d94",
    storageBucket: "greatminds-d4d94.firebasestorage.app",
    messagingSenderId: "814737238809",
    appId: "1:814737238809:web:6df18da40f47a08493b388",
    measurementId: "G-872B2F4FNL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);