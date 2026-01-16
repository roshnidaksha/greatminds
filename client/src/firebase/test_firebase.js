// Firebase core
import { initializeApp } from "firebase/app";

// Firestore
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Your Firebase config
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
const db = getFirestore(app);

// Test function
async function testDB() {
    try {
        const docRef = await addDoc(collection(db, "test"), {
            message: "Firestore is working 🎉",
            createdAt: serverTimestamp()
        });

        console.log("✅ Firestore connected. Doc ID:", docRef.id);
    } catch (error) {
        console.error("❌ Firestore error:", error);
    }
}

// Run test
testDB();