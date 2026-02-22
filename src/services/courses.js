import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// ===== FETCH ALL COURSES =====
export async function fetchCourses() {
  const ref = collection(db, "courses");
  const q = query(ref, orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

// ===== CREATE COURSE =====
export async function createCourse(course) {
  const ref = collection(db, "courses");
  const docRef = await addDoc(ref, {
    code: course.code,
    title: course.title,
    description: course.description || "",
    status: course.status || "draft",
    modulesCount: course.modulesCount ?? 0,

    // optional meta
    estimatedDuration: course.estimatedDuration || "",
    category: course.category || "",
    targetAudience: course.targetAudience || "",
    thumbnailUrl: course.thumbnailUrl || "",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

// ===== FETCH SINGLE COURSE =====
export async function fetchCourseById(id) {
  const ref = doc(db, "courses", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

// ===== UPDATE COURSE =====
export async function updateCourse(id, updates) {
  const ref = doc(db, "courses", id);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCourse(id) {
  const ref = doc(db, "courses", id);
  await deleteDoc(ref);
}