import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDC_Ir_2kFqVNV6ka_njVOXcCH56BBcFQc",
  authDomain: "mentora-b835c.firebaseapp.com",
  projectId: "mentora-b835c",
  storageBucket: "mentora-b835c.firebasestorage.app",
  messagingSenderId: "392838010448",
  appId: "1:392838010448:web:c14254dcdf8c447762a355",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
