// Firebase core
import { initializeApp } from "firebase/app";

// Firestore
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
    apiKey: your_api_key,
    authDomain: your_project_id.firebaseapp.com,
    projectId: your_project_id,
    storageBucket: your_project_id.firebasestorage.app,
    messagingSenderId: your_id,
    appId: your_app_id,
    measurementId: your_measurement_id
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
