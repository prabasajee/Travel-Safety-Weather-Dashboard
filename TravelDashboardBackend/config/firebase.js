// Firebase Admin SDK initialization
const admin = require('firebase-admin');
const serviceAccount = require('../config/travel-safety-weatherdashboard-firebase-adminsdk-fbsvc-a68e1a00ba.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = admin;
