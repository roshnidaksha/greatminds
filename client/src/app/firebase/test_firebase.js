// Firebase core
import { initializeApp } from "firebase/app";

// Firestore
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Your Firebase config
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