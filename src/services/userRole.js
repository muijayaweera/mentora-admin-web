import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export async function getUserRole(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data();
  return data?.role || null;
}
