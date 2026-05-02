import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  fetchCourseById,
  updateCourse,
  deleteCourse,
} from "../../services/courses";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Save,
  X,
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Layers,
  FileText,
  HelpCircle,
  Loader2,
} from "lucide-react";
import {
  fetchModules,
  addModule,
  deleteModule,
  updateModule,
  fetchQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../services/modules";

import { storage } from "../../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function StatusBadge({ status }) {
  const isPublished = status === "published";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold ${
        isPublished
          ? "bg-green-50 text-green-700 border-green-100"
          : "bg-[#F7EAFE] text-[#B72AD7] border-[#F0D8FA]"
      }`}
    >
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[22px] bg-[#FCFBFE] border border-[#F2EDF8] p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-[#F7EAFE] flex items-center justify-center">
          <Icon size={18} className="text-[#B72AD7]" />
        </div>
        <div>
          <p className="text-[13px] text-gray-400">{label}</p>
          <p className="text-[15px] font-semibold text-gray-950">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, right, children }) {
  return (
    <section className="bg-white rounded-[30px] border border-[#F0EAF7] shadow-[0_12px_35px_rgba(30,20,60,0.04)] p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="h-11 w-11 rounded-2xl bg-[#F7EAFE] flex items-center justify-center">
              <Icon size={20} className="text-[#B72AD7]" />
            </div>
          )}

          <div>
            <h2 className="text-[19px] font-semibold text-gray-950">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[13px] text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {right}
      </div>

      {children}
    </section>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    code: "",
    description: "",
    status: "draft",
    category: "",
    estimatedDuration: "",
    targetAudience: "",
  });

  const [modules, setModules] = useState([]);

  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [moduleModalMode, setModuleModalMode] = useState("add");
  const [activeModuleId, setActiveModuleId] = useState(null);

  const [moduleTitle, setModuleTitle] = useState("");
  const [modulePreview, setModulePreview] = useState("");
  const [moduleContent, setModuleContent] = useState("");

  const [moduleSaving, setModuleSaving] = useState(false);
  const [moduleError, setModuleError] = useState("");

  const [moduleQuestions, setModuleQuestions] = useState([]);

  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [questionExplanation, setQuestionExplanation] = useState("");

  const [questionMode, setQuestionMode] = useState("add");
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [questionSaving, setQuestionSaving] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [questionImageUrl, setQuestionImageUrl] = useState("");
  const [questionImageFile, setQuestionImageFile] = useState(null);

  const inputClass =
    "w-full rounded-[18px] border border-[#F0EAF7] bg-[#FCFBFE] px-4 py-3 text-[14px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#E9C8F7] focus:bg-white transition";

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const found = await fetchCourseById(id);

        if (!found) {
          navigate("/courses");
          return;
        }

        setCourse(found);
        setForm({
          title: found.title || "",
          code: found.code || "",
          description: found.description || "",
          status: found.status || "draft",
          category: found.category || "",
          estimatedDuration: found.estimatedDuration || "",
          targetAudience: found.targetAudience || "",
        });

        const mods = await fetchModules(id);
        setModules(mods);
      } catch (e) {
        console.error("Failed to load course:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, navigate]);

  const canPublish = useMemo(() => modules.length > 0, [modules]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9FF] px-8 py-8 font-[Poppins] flex items-center justify-center">
        <div className="rounded-[28px] bg-white border border-[#F0EAF7] px-8 py-7 text-center shadow-[0_12px_35px_rgba(30,20,60,0.04)]">
          <Loader2 className="mx-auto mb-3 animate-spin text-[#B72AD7]" size={28} />
          <p className="text-[15px] font-medium text-gray-500">
            Loading course...
          </p>
        </div>
      </div>
    );
  }

  if (!course) return null;

  function startEdit() {
    setError("");
    setIsEditing(true);
  }

  function cancelEdit() {
    setError("");
    setIsEditing(false);
    setForm({
      title: course.title || "",
      code: course.code || "",
      description: course.description || "",
      status: course.status || "draft",
      category: course.category || "",
      estimatedDuration: course.estimatedDuration || "",
      targetAudience: course.targetAudience || "",
    });
  }

  async function saveEdit() {
    setError("");

    if (!form.title.trim()) return setError("Course title is required.");
    if (!form.code.trim()) return setError("Course code is required.");
    if (!form.description.trim()) return setError("Description is required.");

    setSaving(true);

    try {
      await updateCourse(id, {
        title: form.title.trim(),
        code: form.code.trim(),
        description: form.description.trim(),
        status: form.status,
        category: form.category.trim(),
        estimatedDuration: form.estimatedDuration.trim(),
        targetAudience: form.targetAudience.trim(),
      });

      setCourse((prev) => ({ ...prev, ...form }));
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course? This cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await deleteCourse(id);
      navigate("/courses");
    } catch (e) {
      console.error(e);
      setError("Failed to delete course.");
    }
  }

  async function handlePublish() {
    if (modules.length === 0) {
      setError("Add at least one module before publishing.");
      return;
    }

    try {
      await updateCourse(id, { status: "published" });

      setCourse((prev) => ({ ...prev, status: "published" }));
      setForm((prev) => ({ ...prev, status: "published" }));
    } catch (e) {
      console.error(e);
      setError("Failed to publish course.");
    }
  }

  function openAddModuleModal() {
    setModuleError("");
    setQuestionError("");
    setModuleModalMode("add");
    setActiveModuleId(null);
    setModuleTitle("");
    setModulePreview("");
    setModuleContent("");
    setModuleQuestions([]);
    resetQuestionForm();
    setModuleModalOpen(true);
  }

    async function openEditModuleModal(m) {
      setModuleError("");
      setQuestionError("");
      setModuleModalMode("edit");
      setActiveModuleId(m.id);
      setModuleTitle(m.title || "");
      setModulePreview(m.preview || "");
      setModuleContent(m.contentText || "");
      setModuleQuestions([]);
      

      resetQuestionForm();

    try {
      const qs = await fetchQuestions(id, m.id);
      setModuleQuestions(qs);
    } catch (e) {
      console.error(e);
      setQuestionError("Failed to load questions.");
    }

    setModuleModalOpen(true);
  }

  function closeModuleModal() {
    setModuleModalOpen(false);
    setModuleError("");
  }

  async function saveModule() {
    setModuleError("");

    if (!moduleTitle.trim()) return setModuleError("Module title is required.");
    if (!modulePreview.trim()) {
      return setModuleError("Preview sentence is required.");
    }
    if (!moduleContent.trim()) return setModuleError("Content is required.");

    setModuleSaving(true);

    try {
      if (moduleModalMode === "add") {
        const payload = {
          title: moduleTitle.trim(),
          preview: modulePreview.trim(),
          contentText: moduleContent.trim(),
          type: "Text",
          order: modules.length + 1,
        };

        const newId = await addModule(id, payload);

        await updateCourse(id, { modulesCount: modules.length + 1 });

        setModules((prev) =>
          [...prev, { id: newId, ...payload }].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          )
        );
      } else {
        const existingModule = modules.find((m) => m.id === activeModuleId);

        const payload = {
          title: moduleTitle.trim(),
          preview: modulePreview.trim(),
          contentText: moduleContent.trim(),
          type: "Text",
          order: existingModule?.order ?? 0,
        };

        await updateModule(id, activeModuleId, payload);

        setModules((prev) =>
          prev
            .map((m) => (m.id === activeModuleId ? { ...m, ...payload } : m))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        );
      }

      closeModuleModal();
    } catch (e) {
      console.error(e);
      setModuleError(e?.message || "Failed to save module.");
    } finally {
      setModuleSaving(false);
    }
  }

  async function handleDeleteModule(moduleId) {
    const ok = window.confirm("Delete this module? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteModule(id, moduleId);
      await updateCourse(id, { modulesCount: Math.max(modules.length - 1, 0) });
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
    } catch (e) {
      console.error(e);
      setError("Failed to delete module.");
    }
  }

  function resetQuestionForm() {
  setQuestionMode("add");
  setActiveQuestionId(null);
  setQuestionText("");
  setOptionA("");
  setOptionB("");
  setOptionC("");
  setOptionD("");
  setCorrectAnswerIndex(0);
  setQuestionExplanation("");
  setQuestionImageUrl("");
  setQuestionImageFile(null);
}

  function startEditQuestion(q) {
    setQuestionError("");
    setQuestionMode("edit");
    setActiveQuestionId(q.id);
    setQuestionText(q.questionText || "");
    setOptionA(q.options?.[0] || "");
    setOptionB(q.options?.[1] || "");
    setOptionC(q.options?.[2] || "");
    setOptionD(q.options?.[3] || "");
    setCorrectAnswerIndex(q.correctAnswerIndex ?? 0);
    setQuestionExplanation(q.explanation || "");
    setQuestionImageUrl(q.imageUrl || "");
  }

  async function uploadQuestionImageIfNeeded() {
  if (!questionImageFile) {
    return questionImageUrl || "";
  }

  const safeFileName = questionImageFile.name.replace(/\s+/g, "_");
  const storageRef = ref(
    storage,
    `quizImages/${id}/${activeModuleId}/${Date.now()}_${safeFileName}`
  );

  await uploadBytes(storageRef, questionImageFile);
  return await getDownloadURL(storageRef);
}

async function saveQuestion() {
  setQuestionError("");

  if (moduleModalMode === "add" || !activeModuleId) {
    setQuestionError("Save the module first before adding questions.");
    return;
  }

  if (!questionText.trim()) {
    setQuestionError("Question text is required.");
    return;
  }

  const options = [
    optionA.trim(),
    optionB.trim(),
    optionC.trim(),
    optionD.trim(),
  ];

  if (options.some((opt) => !opt)) {
    setQuestionError("All 4 answer options are required.");
    return;
  }

  setQuestionSaving(true);

  try {
    const uploadedImageUrl = await uploadQuestionImageIfNeeded();

    if (questionMode === "add") {
      const payload = {
        questionText: questionText.trim(),
        options,
        correctAnswerIndex: Number(correctAnswerIndex),
        explanation: questionExplanation.trim(),
        imageUrl: uploadedImageUrl,
        order: moduleQuestions.length + 1,
      };

      const newId = await addQuestion(id, activeModuleId, payload);

      setModuleQuestions((prev) =>
        [...prev, { id: newId, ...payload }].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        )
      );
    } else {
      const existingQuestion = moduleQuestions.find(
        (q) => q.id === activeQuestionId
      );

      const payload = {
        questionText: questionText.trim(),
        options,
        correctAnswerIndex: Number(correctAnswerIndex),
        explanation: questionExplanation.trim(),
        imageUrl: uploadedImageUrl,
        order: existingQuestion?.order ?? 0,
      };

      await updateQuestion(id, activeModuleId, activeQuestionId, payload);

      setModuleQuestions((prev) =>
        prev
          .map((q) => (q.id === activeQuestionId ? { ...q, ...payload } : q))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      );
    }

    resetQuestionForm();
  } catch (e) {
    console.error(e);
    setQuestionError(e?.message || "Failed to save question.");
  } finally {
    setQuestionSaving(false);
  }
}

  async function handleDeleteQuestion(questionId) {
    const ok = window.confirm("Delete this question?");
    if (!ok) return;

    try {
      await deleteQuestion(id, activeModuleId, questionId);
      setModuleQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (e) {
      console.error(e);
      setQuestionError("Failed to delete question.");
    }
  }

  return (
  <div className="min-h-screen bg-[#FAF9FF] px-8 py-8 font-[Poppins]">
    <div className="space-y-7">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="max-w-[720px]">
          <button
            onClick={() => navigate("/courses")}
            className="mb-5 inline-flex items-center gap-2 text-[14px] text-gray-400 hover:text-[#B72AD7]"
          >
            <ArrowLeft size={17} />
            Back to Courses
          </button>

          {isEditing ? (
            <input
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full text-[36px] font-semibold text-gray-950 bg-transparent outline-none border-b border-[#E9C8F7] pb-1"
            />
          ) : (
            <h1 className="text-[36px] font-semibold text-gray-950">
              {course.title}
            </h1>
          )}

          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span className="text-[14px] text-gray-400">
              Code: {course.code}
            </span>

            <StatusBadge status={course.status} />
          </div>

          {error && (
            <div className="mt-4 rounded-[18px] bg-red-50 border border-red-100 px-4 py-3 text-[14px] text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePublish}
            disabled={!canPublish}
            className={`flex items-center gap-2 px-5 py-3 rounded-[18px] text-[14px] font-semibold transition
              ${canPublish
                ? "bg-gradient-to-r from-[#D946EF] to-[#9333EA] text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
          >
            <CheckCircle size={17} />
            Publish
          </button>

          {!isEditing ? (
            <button
              onClick={startEdit}
              className="px-5 py-3 rounded-[18px] bg-white border border-[#F0EAF7] text-gray-600 hover:bg-[#FCFBFE]"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={cancelEdit}
                className="px-5 py-3 rounded-[18px] bg-white border border-[#F0EAF7]"
              >
                Cancel
              </button>

              <button
                onClick={saveEdit}
                className="px-5 py-3 rounded-[18px] bg-[#F7EAFE] text-[#B72AD7]"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}

          <button
            onClick={handleDelete}
            className="px-5 py-3 rounded-[18px] bg-white border border-red-100 text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* ===== OVERVIEW ===== */}
      <SectionCard
        title="Course Overview"
        subtitle="General course information"
        icon={FileText}
      >
        {isEditing ? (
          <textarea
            value={form.description}
            onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
            rows={4}
            className={`${inputClass} resize-none`}
          />
        ) : (
          <p className="text-gray-700">{course.description}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <InfoPill icon={Layers} label="Category" value={course.category} />
          <InfoPill icon={Clock} label="Duration" value={course.estimatedDuration} />
          <InfoPill icon={Users} label="Audience" value={course.targetAudience} />
        </div>
      </SectionCard>

      {/* ===== MODULES ===== */}
      <SectionCard
        title="Modules"
        subtitle="Manage course content"
        icon={BookOpen}
        right={
          <button
            onClick={openAddModuleModal}
            className="flex items-center gap-2 px-5 py-3 rounded-[18px] bg-gradient-to-r from-[#D946EF] to-[#9333EA] text-white text-[14px] font-semibold"
          >
            <Plus size={16} />
            Add Module
          </button>
        }
      >
        {modules.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            No modules added yet.
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((m, idx) => (
              <div
                key={m.id}
                className="flex justify-between items-center rounded-[22px] bg-[#FCFBFE] border border-[#F2EDF8] px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {(m.order ?? idx + 1)}. {m.title}
                  </p>
                  <p className="text-[13px] text-gray-400 mt-1">
                    {m.preview}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModuleModal(m)}
                    className="px-4 py-2 rounded-full border border-[#F0EAF7] bg-white text-[13px]"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteModule(m.id)}
                    className="px-4 py-2 rounded-full border border-red-100 text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {moduleModalOpen && (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
    <div className="w-[900px] max-h-[90vh] overflow-y-auto bg-white rounded-[30px] p-7">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-[20px] font-semibold text-gray-900">
            {moduleModalMode === "add" ? "Add Module" : "Edit Module"}
          </h3>
          <p className="text-[13px] text-gray-400 mt-1">
            Add content and quiz questions for this module
          </p>
        </div>

        <button
          onClick={closeModuleModal}
          className="px-4 py-2 rounded-xl border border-[#F0EAF7]"
        >
          Close
        </button>
      </div>

      {/* Errors */}
      {moduleError && (
        <div className="mb-4 text-red-600 text-[14px]">{moduleError}</div>
      )}
      {questionError && (
        <div className="mb-4 text-red-600 text-[14px]">{questionError}</div>
      )}

      {/* Module Fields */}
      <div className="space-y-4">
        <input
          value={moduleTitle}
          onChange={(e) => setModuleTitle(e.target.value)}
          placeholder="Module title"
          className={inputClass}
        />

        <textarea
          value={modulePreview}
          onChange={(e) => setModulePreview(e.target.value)}
          placeholder="Preview sentence"
          rows={2}
          className={`${inputClass} resize-none`}
        />

        <textarea
          value={moduleContent}
          onChange={(e) => setModuleContent(e.target.value)}
          placeholder="Full module content..."
          rows={8}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* ================= QUIZ SECTION ================= */}
      <div className="mt-8 border-t border-[#F0EAF7] pt-6">
        <h4 className="text-[18px] font-semibold text-gray-900 mb-4">
          Quiz Questions
        </h4>

        {moduleModalMode === "add" && (
          <div className="mb-4 text-yellow-600 text-[14px]">
            Save module first before adding questions
          </div>
        )}

        {moduleModalMode === "edit" && (
          <>
            {/* Question Form */}
            <div className="space-y-4 bg-[#FCFBFE] border border-[#F2EDF8] p-5 rounded-[24px]">

              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Question"
                rows={2}
                className={`${inputClass} resize-none`}
              />

              <div>
                <label className="text-[14px] font-medium text-gray-600">
                  Question Image (optional)
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setQuestionImageFile(file);
                    }
                  }}
                  className="mt-2 w-full rounded-[18px] border border-[#F0EAF7] bg-white px-4 py-3 text-[13px] text-gray-500"
                />

                {(questionImageFile || questionImageUrl) && (
                  <div className="mt-3 h-[170px] w-full overflow-hidden rounded-[20px] border border-[#F2EDF8] bg-white">
                    <img
                      src={
                        questionImageFile
                          ? URL.createObjectURL(questionImageFile)
                          : questionImageUrl
                      }
                      alt="Question preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[optionA, optionB, optionC, optionD].map((val, i) => {
                  const setters = [
                    setOptionA,
                    setOptionB,
                    setOptionC,
                    setOptionD,
                  ];
                  return (
                    <input
                      key={i}
                      value={val}
                      onChange={(e) => setters[i](e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className={inputClass}
                    />
                  );
                })}
              </div>

              <select
                value={correctAnswerIndex}
                onChange={(e) => setCorrectAnswerIndex(Number(e.target.value))}
                className={inputClass}
              >
                <option value={0}>Correct: Option 1</option>
                <option value={1}>Correct: Option 2</option>
                <option value={2}>Correct: Option 3</option>
                <option value={3}>Correct: Option 4</option>
              </select>

              <textarea
                value={questionExplanation}
                onChange={(e) => setQuestionExplanation(e.target.value)}
                placeholder="Explanation"
                rows={2}
                className={`${inputClass} resize-none`}
              />

              <div className="flex justify-end">
                <button
                  onClick={saveQuestion}
                  disabled={questionSaving}
                  className="px-5 py-3 rounded-[18px] bg-[#B72AD7] text-white text-[14px]"
                >
                  {questionSaving
                    ? "Saving..."
                    : questionMode === "add"
                    ? "Add Question"
                    : "Update Question"}
                </button>
              </div>
            </div>

            {/* Question List */}
            <div className="mt-5 space-y-3">
              {moduleQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-[22px] bg-[#FCFBFE] border border-[#F2EDF8] p-4"
                >
                  <div className="flex justify-between">
                    <p className="font-semibold text-gray-900">
                      {idx + 1}. {q.questionText}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditQuestion(q)}
                        className="text-[13px] px-3 py-1 border rounded-full"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-[13px] px-3 py-1 border rounded-full text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(q.options || []).map((opt, i) => (
                      <div
                        key={i}
                        className={`px-3 py-2 rounded-lg text-[12px] ${
                          i === q.correctAnswerIndex
                            ? "bg-green-100 text-green-700"
                            : "bg-white text-gray-500"
                        }`}
                      >
                        {i + 1}. {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-7 flex justify-end gap-3">
        <button
          onClick={closeModuleModal}
          className="px-5 py-3 rounded-[18px] border border-[#F0EAF7]"
        >
          Cancel
        </button>

        <button
          onClick={saveModule}
          disabled={moduleSaving}
          className="px-5 py-3 rounded-[18px] bg-gradient-to-r from-[#D946EF] to-[#9333EA] text-white"
        >
          {moduleSaving ? "Saving..." : "Save Module"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  </div>
);
}