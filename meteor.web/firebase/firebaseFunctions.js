// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth(); // To interact with Firebase Auth
const storage = admin.storage(); // To interact with Cloud Storage

// Helper function to get user email (more reliable than relying on Firestore document alone)
async
