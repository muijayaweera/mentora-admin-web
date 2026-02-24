import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { fetchCourseById, updateCourse, deleteCourse } from "../../services/courses";
import { Plus, Pencil, Trash2, CheckCircle, Save, X } from "lucide-react";
import { fetchModules, addModule, deleteModule, updateModule } from "../../services/modules";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // inline edit state
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

  // modules still local for now
  const [modules, setModules] = useState([]);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleType, setNewModuleType] = useState("Text");
  const [moduleError, setModuleError] = useState("");

  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editModuleTitle, setEditModuleTitle] = useState("");
  const [editModuleType, setEditModuleType] = useState("Text");
  const [moduleSaving, setModuleSaving] = useState(false);
  const [newModuleContent, setNewModuleContent] = useState("");

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

  const statusLabel = form.status === "published" ? "Published" : "Draft";

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

      // update local course state too (so UI updates instantly)
      const updated = {
        ...course,
        ...form,
      };
      setCourse(updated);
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

async function handleAddModule() {
  setModuleError("");

  if (!newModuleTitle.trim()) {
    setModuleError("Module title is required.");
    return;
  }

  // ✅ if Text, content is required (optional rule; you can remove this if you want)
  if (newModuleType === "Text" && !newModuleContent.trim()) {
    setModuleError("Please add content for this text module.");
    return;
  }

  try {
    const payload = {
      title: newModuleTitle.trim(),
      type: newModuleType,
    };

    // ✅ only store text content for Text modules
    if (newModuleType === "Text") {
      payload.contentText = newModuleContent.trim();
    }

    const newId = await addModule(id, payload);

    await updateCourse(id, {
      modulesCount: modules.length + 1,
    });

    setModules((prev) => [
      ...prev,
      {
        id: newId,
        title: payload.title,
        type: payload.type,
        contentText: payload.contentText || "", // keep in UI state too
      },
    ]);

    setShowModuleModal(false);
    setNewModuleTitle("");
    setNewModuleType("Text");
    setNewModuleContent("");
  } catch (e) {
    console.error(e);
    setModuleError(e?.message || "Failed to add module.");
  }
}

async function handleDeleteModule(moduleId) {
  const ok = window.confirm("Delete this module? This cannot be undone.");
  if (!ok) return;

  try {
    await deleteModule(id, moduleId);
    await updateCourse(id, {
      modulesCount: modules.length - 1,
    });
    setModules((prev) => prev.filter((m) => m.id !== moduleId));
  } catch (e) {
    console.error(e);
    setError("Failed to delete module.");
  }
}

async function handlePublish() {
  if (modules.length === 0) {
    setError("Add at least one module before publishing.");
    return;
  }

  try {
    await updateCourse(id, { status: "published" });

    setCourse((prev) => ({
      ...prev,
      status: "published",
    }));

    setForm((prev) => ({
      ...prev,
      status: "published",
    }));
  } catch (e) {
    console.error(e);
    setError("Failed to publish course.");
  }
}

function startEditModule(m) {
  setModuleError("");
  setEditingModuleId(m.id);
  setEditModuleTitle(m.title || "");
  setEditModuleType(m.type || "Text");
}

function cancelEditModule() {
  setModuleError("");
  setEditingModuleId(null);
  setEditModuleTitle("");
  setEditModuleType("Text");
}

async function saveModuleEdit(moduleId) {
  setModuleError("");

  if (!editModuleTitle.trim()) {
    setModuleError("Module title is required.");
    return;
  }

  setModuleSaving(true);
  try {
    await updateModule(id, moduleId, {
      title: editModuleTitle.trim(),
      type: editModuleType,
    });

    // update UI instantly
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, title: editModuleTitle.trim(), type: editModuleType }
          : m
      )
    );

    cancelEditModule();
  } catch (e) {
    console.error(e);
    setModuleError(e?.message || "Failed to update module.");
  } finally {
    setModuleSaving(false);
  }
}

  return (
    <div className="min-h-screen bg-[#F6F6F7] px-10 py-10 font-[Poppins]">
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between">
        <div className="w-full max-w-[720px]">
          {/* Title */}
          {isEditing ? (
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full rounded-xl border border-[#E5E5EA] bg-white px-4 py-3 text-[22px] font-semibold text-[#3A3A3A] outline-none focus:border-[#8B5CF6]"
              placeholder="Course title"
            />
          ) : (
            <h1 className="text-[36px] font-semibold text-[#3A3A3A]">
              {course.title}
            </h1>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {/* Code */}
            {isEditing ? (
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#7A7A7A]">Code:</span>
                <input
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  className="w-[140px] rounded-lg border border-[#E5E5EA] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#8B5CF6]"
                  placeholder="OST101"
                />
              </div>
            ) : (
              <span className="text-[14px] text-[#7A7A7A]">Code: {course.code}</span>
            )}

            {/* Status */}
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
                      onClick={() => setForm((p) => ({ ...p, status: s.value }))}
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
          {/* description */}
          {isEditing ? (
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={4}
              className="col-span-2 w-full resize-none rounded-xl border border-[#E5E5EA] bg-[#FAFAFB] px-5 py-3 text-[15px] outline-none focus:border-[#8B5CF6]"
              placeholder="Write a short overview..."
            />
          ) : (
            <p className="col-span-2">{course.description}</p>
          )}

          {/* category */}
          <p>
            <span className="font-medium">Category:</span>{" "}
            {isEditing ? (
              <input
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="ml-2 rounded-lg border border-[#E5E5EA] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#8B5CF6]"
                placeholder="Ostomy Care"
              />
            ) : (
              course.category
            )}  
          </p>

          {/* duration */}
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

          {/* target audience */}
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
          <h2 className="text-[18px] font-semibold text-[#3A3A3A]">
            Modules
          </h2>

          <button
            onClick={() => setShowModuleModal(true)}
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
          {modules.map((m, idx) => {
  const isEditingThis = editingModuleId === m.id;

  return (
    <div
      key={m.id}
      className="flex items-center justify-between rounded-xl bg-[#F3F3F5] px-5 py-4"
    >
      <div className="flex-1">
        {isEditingThis ? (
          <div className="flex flex-col gap-3">
            <input
              value={editModuleTitle}
              onChange={(e) => setEditModuleTitle(e.target.value)}
              className="w-full rounded-xl border border-[#E5E5EA] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#8B5CF6]"
              placeholder="Module title"
            />

            <select
              value={editModuleType}
              onChange={(e) => setEditModuleType(e.target.value)}
              className="w-full rounded-xl border border-[#E5E5EA] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#8B5CF6]"
            >
              <option>Text</option>
              <option>Video</option>
              <option>PDF</option>
            </select>

            {moduleError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                {moduleError}
              </div>
            )}
          </div>
        ) : (
          <>
            <p className="font-medium text-[#2E2E2E]">
              {idx + 1}. {m.title}
            </p>
            <p className="text-[13px] text-[#6B6B6B]">{m.type}</p>
          </>
        )}
      </div>

      <div className="ml-4 flex gap-2">
        {!isEditingThis ? (
          <>
            <button
              type="button"
              onClick={() => startEditModule(m)}
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
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={cancelEditModule}
              disabled={moduleSaving}
              className="rounded-full border border-[#DCDCE2] bg-white px-5 py-2 text-[13px] font-medium hover:bg-[#FAFAFB] disabled:opacity-60 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => saveModuleEdit(m.id)}
              disabled={moduleSaving}
              className="rounded-full bg-[#8B5CF6] px-5 py-2 text-[13px] font-medium text-white hover:opacity-95 disabled:opacity-60 transition"
            >
              {moduleSaving ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>
    </div>
  );
})}
        </div>
      )}
      </div>

      {/* ================= ADD MODULE MODAL ================= */}
{showModuleModal && (
  <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
    <div className="w-[520px] rounded-2xl bg-white px-6 py-6">
      <h3 className="text-[18px] font-semibold text-[#3A3A3A]">
        Add Module
      </h3>

      <div className="mt-5 space-y-4">
        {moduleError && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {moduleError}
          </div>
        )}

        <input
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          placeholder="Module title"
          className="w-full rounded-xl border border-[#E5E5EA] px-4 py-3"
        />

        <select
          value={newModuleType}
          onChange={(e) => setNewModuleType(e.target.value)}
          className="w-full rounded-xl border border-[#E5E5EA] px-4 py-3"
        >
          <option>Text</option>
          <option>Video</option>
          <option>PDF</option>
        </select>

        {/* ✅ TEXTAREA GOES HERE */}
        {newModuleType === "Text" && (
          <textarea
            value={newModuleContent}
            onChange={(e) => setNewModuleContent(e.target.value)}
            placeholder="Write module content here..."
            rows={7}
            className="w-full resize-none rounded-xl border border-[#E5E5EA] px-4 py-3"
          />
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => {
            setShowModuleModal(false);
            setModuleError("");
            setNewModuleTitle("");
            setNewModuleType("Text");
            setNewModuleContent("");
          }}
          className="rounded-xl bg-white px-4 py-2 border"
          type="button"
        >
          Cancel
        </button>

        <button
          onClick={handleAddModule}
          className="rounded-xl bg-[#8B5CF6] px-4 py-2 text-white"
          type="button"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}  
    </div>
  );
}