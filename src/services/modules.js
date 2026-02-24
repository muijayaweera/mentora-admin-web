import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// ===== FETCH MODULES =====
export async function fetchModules(courseId) {
  const ref = collection(db, "courses", courseId, "modules");
  const q = query(ref, orderBy("createdAt", "asc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

// ===== ADD MODULE =====
export async function addModule(courseId, module) {
  const ref = collection(db, "courses", courseId, "modules");

  const docRef = await addDoc(ref, {
    title: module.title,
    type: module.type,

    // ✅ text content (optional)
    contentText: module.contentText || "",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function deleteModule(courseId, moduleId) {
  const ref = doc(db, "courses", courseId, "modules", moduleId);
  await deleteDoc(ref);
}

export async function updateModule(courseId, moduleId, updates) {
  const ref = doc(db, "courses", courseId, "modules", moduleId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}