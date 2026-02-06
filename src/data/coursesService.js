// src/data/coursesService.js
const STORAGE_KEY = "mentora_admin_courses_v1";

const seedCourses = [
  {
    id: "OC01",
    code: "OC01",
    title: "Basics of Ostomy Care",
    description: "Intro to ostomy care basics and safe clinical handling.",
    status: "Published",
    modules: 4,
    updatedAt: "1 week ago",
    category: "Ostomy Care",
    targetAudience: "Nurses",
    estimatedDuration: "30 mins",
    thumbnailUrl: "",
  },
  {
    id: "OC02",
    code: "OC02",
    title: "Colostomy VS Ileastomy",
    description: "Key differences, care steps, and patient guidance.",
    status: "Draft",
    modules: 6,
    updatedAt: "3 week ago",
    category: "Ostomy Care",
    targetAudience: "Nurses",
    estimatedDuration: "2 hours",
    thumbnailUrl: "",
  },
];

function readStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedCourses));
    return seedCourses;
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedCourses));
    return seedCourses;
  }
}

function writeStore(courses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

function timeAgoNow() {
  // simple placeholder so UI looks like your design
  return "just now";
}

function makeIdFromCode(code) {
  return code.trim().toUpperCase();
}

export function getCourses() {
  return readStore();
}

export function createCourse(courseInput) {
  const courses = readStore();

  const cleanCode = courseInput.code.trim().toUpperCase();
  const id = makeIdFromCode(cleanCode);

  // prevent duplicates
  const exists = courses.some((c) => c.id === id || c.code === cleanCode);
  if (exists) {
    throw new Error("Course code already exists. Please use a unique code.");
  }

  const newCourse = {
    id,
    code: cleanCode,
    title: courseInput.title.trim(),
    description: courseInput.description.trim(),
    status: courseInput.status || "Draft",
    modules: 0,
    updatedAt: timeAgoNow(),
    category: courseInput.category || "Ostomy Care",
    targetAudience: courseInput.targetAudience || "Nurses",
    estimatedDuration: courseInput.estimatedDuration || "",
    thumbnailUrl: courseInput.thumbnailUrl || "",
  };

  const next = [newCourse, ...courses];
  writeStore(next);

  return newCourse; // later: return Firestore doc id + data
}

export function generateCourseCode(prefix = "OST") {
  // generates something like OST101, OST102...
  const courses = readStore();
  const numbers = courses
    .map((c) => c.code)
    .filter((code) => code.startsWith(prefix))
    .map((code) => parseInt(code.replace(prefix, ""), 10))
    .filter((n) => Number.isFinite(n));

  const nextNum = (numbers.length ? Math.max(...numbers) : 100) + 1;
  return `${prefix}${nextNum}`;
}
