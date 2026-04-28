import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { fetchCourseById, updateCourse, deleteCourse } from "../../services/courses";
import { Plus, Pencil, Trash2, CheckCircle, Save, X } from "lucide-react";
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

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // course inline edit state
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

  // modules
  const [modules, setModules] = useState([]);

  // ===== Big Module Editor Modal State (Add + Edit) =====
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [moduleModalMode, setModuleModalMode] = useState("add"); // "add" | "edit"
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
      <div className="p-10 text-center text-[#6B6B6B] font-[Poppins]">
        Loading course...
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

  // ===== Module modal handlers =====
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
      const nextOrder = modules.length + 1;

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
    if (questionMode === "add") {
      const payload = {
        questionText: questionText.trim(),
        options,
        correctAnswerIndex: Number(correctAnswerIndex),
        explanation: questionExplanation.trim(),
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
        order: existingQuestion?.order ?? 0,
      };

      await updateQuestion(id, activeModuleId, activeQuestionId, payload);

      setModuleQuestions((prev) =>
        prev
          .map((q) =>
            q.id === activeQuestionId ? { ...q, ...payload } : q
          )
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
    <div className="min-h-screen bg-[#F6F6F7] px-10 py-10 font-[Poppins]">
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between">
        <div className="w-full max-w-[720px]">
          {isEditing ? (
            <input
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              className="w-full rounded-xl border border-[#E5E5EA] bg-white px-4 py-3 text-[22px] font-semibold text-[#3A3A3A] outline-none focus:border-[#8B5CF6]"
              placeholder="Course title"
            />
          ) : (
            <h1 className="text-[36px] font-semibold text-[#3A3A3A]">
              {course.title}
            </h1>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#7A7A7A]">Code:</span>
                <input
                  value={form.code}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, code: e.target.value }))
                  }
                  className="w-[140px] rounded-lg border border-[#E5E5EA] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#8B5CF6]"
                  placeholder="OST101"
                />
              </div>
            ) : (
              <span className="text-[14px] text-[#7A7A7A]">
                Code: {course.code}
              </span>
            )}

            {isEditing ? (
              <div className="flex gap-2">
                {[
                  { label: "Draft", value: "draft" },
                  { label: "Published", value: "published" },
                ].map((s) => {
                  const active = form.status === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({ ...p, status: s.value }))
                      }
                      className={[
                        "rounded-full px-4 py-2 text-[13px] font-medium border transition",
                        active
                          ? "bg-[#EDE7FF] border-[#8B5CF6] text-[#2E2E2E]"
                          : "bg-white border-[#E5E5EA] text-[#6B6B6B] hover:bg-[#FAFAFB]",
                      ].join(" ")}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <span
                className={`rounded-full px-4 py-1 text-[13px] font-medium ${
                  course.status === "published"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {course.status === "published" ? "Published" : "Draft"}
              </span>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-[14px] text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            disabled={!canPublish}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-[15px] font-medium transition
              ${
                canPublish
                  ? "bg-[#8B5CF6] text-white hover:opacity-95"
                  : "bg-[#E5E5EA] text-[#9A9A9A] cursor-not-allowed"
              }`}
            type="button"
            onClick={handlePublish}
            title={!canPublish ? "Add at least 1 module to publish" : "Publish"}
          >
            <CheckCircle size={18} />
            Publish
          </button>

          {!isEditing ? (
            <button
              type="button"
              onClick={startEdit}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[15px] font-medium
                         border border-[#E5E5EA] shadow-sm hover:bg-[#FAFAFB]"
            >
              <Pencil size={18} />
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[15px] font-medium
                           border border-[#E5E5EA] shadow-sm hover:bg-[#FAFAFB] disabled:opacity-60"
              >
                <X size={18} />
                Cancel
              </button>

              <button
                type="button"
                onClick={saveEdit}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#CFA3F1] px-5 py-3 text-[15px] font-medium text-[#1F1F1F]
                           hover:opacity-95 disabled:opacity-60"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}

          <button
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[15px] font-medium
                       border border-red-200 text-red-600 hover:bg-red-50"
            type="button"
            onClick={handleDelete}
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      {/* ================= OVERVIEW ================= */}
      <div className="mt-8 rounded-2xl bg-white px-8 py-6 shadow-[0_16px_32px_rgba(0,0,0,0.08)]">
        <h2 className="text-[18px] font-semibold text-[#3A3A3A]">
          Course Overview
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-y-3 text-[15px] text-[#4A4A4A]">
          {isEditing ? (
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={4}
              className="col-span-2 w-full resize-none rounded-xl border border-[#E5E5EA] bg-[#FAFAFB] px-5 py-3 text-[15px] outline-none focus:border-[#8B5CF6]"
              placeholder="Write a short overview..."
            />
          ) : (
            <p className="col-span-2">{course.description}</p>
          )}

          <p>
            <span className="font-medium">Category:</span>{" "}
            {isEditing ? (
              <input
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
                className="ml-2 rounded-lg border border-[#E5E5EA] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#8B5CF6]"
                placeholder="Ostomy Care"
              />
            ) : (
              course.category
            )}
          </p>

          <p>
            <span className="font-medium">Duration:</span>{" "}
            {isEditing ? (
              <input
                value={form.estimatedDuration}
                onChange={(e) =>
                  setForm((p) => ({ ...p, estimatedDuration: e.target.value }))
                }
                className="ml-2 rounded-lg border border-[#E5E5EA] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#8B5CF6]"
                placeholder="30 mins"
              />
            ) : (
              course.estimatedDuration || "—"
            )}
          </p>

          <p>
            <span className="font-medium">Target Audience:</span>{" "}
            {isEditing ? (
              <input
                value={form.targetAudience}
                onChange={(e) =>
                  setForm((p) => ({ ...p, targetAudience: e.target.value }))
                }
                className="ml-2 rounded-lg border border-[#E5E5EA] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#8B5CF6]"
                placeholder="Nurses"
              />
            ) : (
              course.targetAudience
            )}
          </p>
        </div>
      </div>

      {/* ================= MODULES ================= */}
      <div className="mt-10 rounded-2xl bg-white px-8 py-6 shadow-[0_16px_32px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-[#3A3A3A]">Modules</h2>

          <button
            onClick={openAddModuleModal}
            className="flex items-center gap-2 rounded-xl bg-[#CFA3F1] px-5 py-3
                       text-[15px] font-medium text-[#1F1F1F] hover:opacity-95"
            type="button"
          >
            <Plus size={18} />
            Add Module
          </button>
        </div>

        {modules.length === 0 ? (
          <div className="mt-8 rounded-xl bg-[#F3F3F5] px-6 py-10 text-center text-[#6B6B6B]">
            No modules added yet. Start by adding your first module.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {modules.map((m, idx) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl bg-[#F3F3F5] px-5 py-4"
              >
                <div className="flex-1">
                  <p className="font-medium text-[#2E2E2E]">
                    {(m.order ?? idx + 1)}. {m.title}
                  </p>

                  <p className="text-[13px] text-[#6B6B6B]">
                    {m.preview || "—"}
                  </p>

                  {m.contentText && (
                    <p className="mt-1 text-[13px] text-[#6B6B6B] line-clamp-2">
                      {m.contentText}
                    </p>
                  )}
                </div>

                <div className="ml-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModuleModal(m)}
                    className="rounded-full border border-[#DCDCE2] bg-white px-5 py-2 text-[13px] font-medium hover:bg-[#FAFAFB] transition"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteModule(m.id)}
                    className="rounded-full border border-red-200 bg-white px-5 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODULE EDITOR MODAL (ADD + EDIT) ================= */}
      {moduleModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
          <div className="w-[820px] max-h-[85vh] overflow-y-auto rounded-2xl bg-white px-8 py-7">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[20px] font-semibold text-[#3A3A3A]">
                  {moduleModalMode === "add" ? "Add Module" : "Edit Module"}
                </h3>
                <p className="mt-1 text-[13px] text-[#6B6B6B]">
                  Text-only module (for now). You can paste URLs inside content.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModuleModal}
                className="rounded-xl border border-[#E5E5EA] bg-white px-4 py-2 text-[14px] hover:bg-[#FAFAFB]"
              >
                Close
              </button>
            </div>

            {moduleError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-700">
                {moduleError}
              </div>
            )}

            <div className="mt-6 space-y-5">
              <div>
                <label className="text-[14px] font-medium text-[#4A4A4A]">
                  Module Title
                </label>
                <input
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#E5E5EA] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#8B5CF6]"
                  placeholder="e.g., Stoma Assessment"
                />
              </div>

              <div>
                <label className="text-[14px] font-medium text-[#4A4A4A]">
                  Preview sentence (shown in module list)
                </label>
                <textarea
                  value={modulePreview}
                  onChange={(e) => setModulePreview(e.target.value)}
                  rows={2}
                  className="mt-2 w-full resize-none rounded-xl border border-[#E5E5EA] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#8B5CF6]"
                  placeholder="One short sentence explaining what this module covers..."
                />
              </div>

              <div>
                <label className="text-[14px] font-medium text-[#4A4A4A]">
                  Module Content
                </label>
                <textarea
                  value={moduleContent}
                  onChange={(e) => setModuleContent(e.target.value)}
                  rows={14}
                  className="mt-2 w-full resize-none rounded-xl border border-[#E5E5EA] bg-[#FAFAFB] px-4 py-3 text-[14px] leading-relaxed outline-none focus:border-[#8B5CF6]"
                  placeholder="Write the full lesson content here. You can include URLs in the text."
                />
                <p className="mt-2 text-[12px] text-[#7A7A7A]">
                  Tip: Use blank lines between paragraphs for better readability
                  on mobile.
                </p>
              </div>
              <div className="mt-8 border-t border-[#E5E5EA] pt-7">
  <div className="flex items-center justify-between">
    <div>
      <h4 className="text-[18px] font-semibold text-[#3A3A3A]">
        Quiz Questions
      </h4>
      <p className="mt-1 text-[13px] text-[#6B6B6B]">
        Add MCQ questions for this module. These will appear in the mobile app after the lesson.
      </p>
    </div>

    {questionMode === "edit" && (
      <button
        type="button"
        onClick={resetQuestionForm}
        className="rounded-xl border border-[#E5E5EA] bg-white px-4 py-2 text-[13px] hover:bg-[#FAFAFB]"
      >
        Cancel Edit
      </button>
    )}
  </div>

  {moduleModalMode === "add" && (
    <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-[14px] text-yellow-700">
      Save the module first. Then reopen it to add quiz questions.
    </div>
  )}

  {questionError && (
    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-700">
      {questionError}
    </div>
  )}

  {moduleModalMode === "edit" && (
    <>
      <div className="mt-6 rounded-2xl border border-[#E5E5EA] bg-[#FAFAFB] p-5">
        <label className="text-[14px] font-medium text-[#4A4A4A]">
          Question
        </label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={2}
          className="mt-2 w-full resize-none rounded-xl border border-[#E5E5EA] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#8B5CF6]"
          placeholder="e.g., What is an ostomy?"
        />

        <div className="mt-5 grid grid-cols-2 gap-4">
          {[optionA, optionB, optionC, optionD].map((value, index) => {
            const setters = [
              setOptionA,
              setOptionB,
              setOptionC,
              setOptionD,
            ];

            return (
              <div key={index}>
                <label className="text-[13px] font-medium text-[#4A4A4A]">
                  Option {index + 1}
                </label>
                <input
                  value={value}
                  onChange={(e) => setters[index](e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#E5E5EA] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#8B5CF6]"
                  placeholder={`Answer option ${index + 1}`}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-5">
          <label className="text-[14px] font-medium text-[#4A4A4A]">
            Correct Answer
          </label>
          <select
            value={correctAnswerIndex}
            onChange={(e) => setCorrectAnswerIndex(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-[#E5E5EA] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#8B5CF6]"
          >
            <option value={0}>Option 1</option>
            <option value={1}>Option 2</option>
            <option value={2}>Option 3</option>
            <option value={3}>Option 4</option>
          </select>
        </div>

        <div className="mt-5">
          <label className="text-[14px] font-medium text-[#4A4A4A]">
            Explanation
          </label>
          <textarea
            value={questionExplanation}
            onChange={(e) => setQuestionExplanation(e.target.value)}
            rows={2}
            className="mt-2 w-full resize-none rounded-xl border border-[#E5E5EA] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#8B5CF6]"
            placeholder="Explain why the answer is correct..."
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={saveQuestion}
            disabled={questionSaving}
            className="rounded-xl bg-[#8B5CF6] px-6 py-3 text-[14px] font-medium text-white hover:opacity-95 disabled:opacity-60"
          >
            {questionSaving
              ? "Saving..."
              : questionMode === "add"
              ? "Add Question"
              : "Update Question"}
          </button>
        </div>
      </div>

      <div className="mt-6">
        {moduleQuestions.length === 0 ? (
          <div className="rounded-xl bg-[#F3F3F5] px-5 py-6 text-center text-[14px] text-[#6B6B6B]">
            No quiz questions added yet.
          </div>
        ) : (
          <div className="space-y-3">
            {moduleQuestions.map((q, index) => (
              <div
                key={q.id}
                className="rounded-xl bg-[#F3F3F5] px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-[#2E2E2E]">
                      {index + 1}. {q.questionText}
                    </p>
                    <p className="mt-1 text-[13px] text-[#6B6B6B]">
                      Correct: Option {(q.correctAnswerIndex ?? 0) + 1}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditQuestion(q)}
                      className="rounded-full border border-[#DCDCE2] bg-white px-4 py-2 text-[13px] font-medium hover:bg-[#FAFAFB]"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="rounded-full border border-red-200 bg-white px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(q.options || []).map((opt, optIndex) => (
                    <div
                      key={optIndex}
                      className={`rounded-lg px-3 py-2 text-[12px] ${
                        optIndex === q.correctAnswerIndex
                          ? "bg-green-100 text-green-700"
                          : "bg-white text-[#6B6B6B]"
                      }`}
                    >
                      {optIndex + 1}. {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )}
</div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModuleModal}
                disabled={moduleSaving}
                className="rounded-xl border border-[#E5E5EA] bg-white px-5 py-3 text-[14px] hover:bg-[#FAFAFB] disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveModule}
                disabled={moduleSaving}
                className="rounded-xl bg-[#8B5CF6] px-6 py-3 text-[14px] font-medium text-white hover:opacity-95 disabled:opacity-60"
              >
                {moduleSaving ? "Saving..." : "Save Module"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}