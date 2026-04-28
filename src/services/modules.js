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
  const q = query(ref, orderBy("order", "asc"));
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
    title: module.title || "",
    type: "Text",
    preview: module.preview || "",
    contentText: module.contentText || "",
    order: module.order ?? 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

// ===== UPDATE MODULE =====
export async function updateModule(courseId, moduleId, updates) {
  const ref = doc(db, "courses", courseId, "modules", moduleId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// ===== DELETE MODULE =====
export async function deleteModule(courseId, moduleId) {
  const ref = doc(db, "courses", courseId, "modules", moduleId);
  await deleteDoc(ref);
}

// ===== FETCH QUESTIONS =====
export async function fetchQuestions(courseId, moduleId) {
  const ref = collection(
    db,
    "courses",
    courseId,
    "modules",
    moduleId,
    "questions"
  );

  const q = query(ref, orderBy("order", "asc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

// ===== ADD QUESTION =====
export async function addQuestion(courseId, moduleId, question) {
  const ref = collection(
    db,
    "courses",
    courseId,
    "modules",
    moduleId,
    "questions"
  );

  const docRef = await addDoc(ref, {
    questionText: question.questionText || "",
    options: question.options || [],
    correctAnswerIndex: question.correctAnswerIndex ?? 0,
    explanation: question.explanation || "",
    order: question.order ?? 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

// ===== UPDATE QUESTION =====
export async function updateQuestion(courseId, moduleId, questionId, updates) {
  const ref = doc(
    db,
    "courses",
    courseId,
    "modules",
    moduleId,
    "questions",
    questionId
  );

  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// ===== DELETE QUESTION =====
export async function deleteQuestion(courseId, moduleId, questionId) {
  const ref = doc(
    db,
    "courses",
    courseId,
    "modules",
    moduleId,
    "questions",
    questionId
  );

  await deleteDoc(ref);
}