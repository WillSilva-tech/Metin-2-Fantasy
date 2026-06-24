import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = firebase.apps.length === 0 ? firebase.initializeApp(firebaseConfig) : firebase.app();

export const auth = app.auth();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
