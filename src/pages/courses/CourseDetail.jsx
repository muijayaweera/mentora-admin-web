import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getCourses,
} from "../../data/coursesService";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
} from "lucide-react";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleType, setNewModuleType] = useState("Text");

  useEffect(() => {
    const courses = getCourses();
    const found = courses.find((c) => c.id === id);
    if (!found) {
      navigate("/courses");
      return;
    }
    setCourse(found);
    setModules([]); // dummy for now
  }, [id, navigate]);

  if (!course) return null;

  const canPublish = modules.length > 0;

  return (
    <div className="min-h-screen bg-[#F6F6F7] px-10 py-10 font-[Poppins]">
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[36px] font-semibold text-[#3A3A3A]">
            {course.title}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-[14px] text-[#7A7A7A]">
              Code: {course.code}
            </span>
            <span
              className={`rounded-full px-4 py-1 text-[13px] font-medium ${
                course.status === "Published"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {course.status}
            </span>
          </div>
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
          >
            <CheckCircle size={18} />
            Publish
          </button>

          <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[15px] font-medium
                             border border-[#E5E5EA] shadow-sm hover:bg-[#FAFAFB]">
            <Pencil size={18} />
            Edit
          </button>

          <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[15px] font-medium
                             border border-red-200 text-red-600 hover:bg-red-50">
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
          <p className="col-span-2">{course.description}</p>
          <p>
            <span className="font-medium">Category:</span> {course.category}
          </p>
          <p>
            <span className="font-medium">Duration:</span>{" "}
            {course.estimatedDuration || "—"}
          </p>
          <p>
            <span className="font-medium">Target Audience:</span>{" "}
            {course.targetAudience}
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
          >
            <Plus size={18} />
            Add Module
          </button>
        </div>

        {/* Empty State */}
        {modules.length === 0 && (
          <div className="mt-8 rounded-xl bg-[#F3F3F5] px-6 py-10 text-center text-[#6B6B6B]">
            No modules added yet. Start by adding your first module.
          </div>
        )}
      </div>

      {/* ================= ADD MODULE MODAL ================= */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
          <div className="w-[420px] rounded-2xl bg-white px-6 py-6">
            <h3 className="text-[18px] font-semibold text-[#3A3A3A]">
              Add Module
            </h3>

            <div className="mt-5 space-y-4">
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
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModuleModal(false)}
                className="rounded-xl bg-white px-4 py-2 border"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setModules([
                    ...modules,
                    {
                      title: newModuleTitle,
                      type: newModuleType,
                    },
                  ]);
                  setShowModuleModal(false);
                  setNewModuleTitle("");
                }}
                className="rounded-xl bg-[#8B5CF6] px-4 py-2 text-white"
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
