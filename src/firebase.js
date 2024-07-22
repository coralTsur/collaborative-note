// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCtMFFejz8lulVR1xxWh9jN0H1lVJS595M",
    authDomain: "project-af54e.firebaseapp.com",
    projectId: "project-af54e",
    storageBucket: "project-af54e.appspot.com",
    messagingSenderId: "1048190766780",
    appId: "1:1048190766780:web:f7f6ef15177bcf9418cab9",
    measurementId: "G-5D1VDSDGT4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
export { app, auth, firestore };
