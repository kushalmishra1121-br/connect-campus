// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDd_ai5U6LEVQU1QS_gDeixmxRGgzQNAuo",
    authDomain: "campus-connect-77ac7.firebaseapp.com",
    databaseURL: "https://campus-connect-77ac7-default-rtdb.asia-southeast1.firebaseio.com",
    projectId: "campus-connect-77ac7",
    storageBucket: "campus-connect-77ac7.firebasestorage.app",
    messagingSenderId: "713112695456",
    appId: "1:713112695456:web:ebea074605fd65500b0fc5",
    measurementId: "G-QDLD4XJ3KE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services (uncomment as needed)
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
// export const database = getDatabase(app);
// export const storage = getStorage(app);

export default app;
