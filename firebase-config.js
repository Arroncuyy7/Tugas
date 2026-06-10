// Shared Firebase configuration and initialization
var firebaseConfig = {
    apiKey: "AIzaSyBOIx7Q50yEQNnPmdN7OlzzGRaT30k2i1I",
    authDomain: "backup-80243.firebaseapp.com",
    projectId: "backup-80243",
    storageBucket: "backup-80243.appspot.com",
    messagingSenderId: "676376137159",
    appId: "1:676376137159:web:c717cb5f14ec5647b1dde2",
    measurementId: "G-WGCLG19BN5"
};

firebase.initializeApp(firebaseConfig);

var database = firebase.database();
