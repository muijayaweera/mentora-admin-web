import { useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchCourses } from "../services/courses";

export default function Courses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCourses();
        setCourses(data);
      } catch (e) {
        console.error("Failed to fetch courses:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;

    return courses.filter((c) => {
      const code = (c.code || "").toLowerCase();
      const title = (c.title || "").toLowerCase();
      const status = (c.status || "").toLowerCase();
      return code.includes(q) || title.includes(q) || status.includes(q);
    });
  }, [search, courses]);

  return (
    <div className="min-h-screen w-full bg-[#F6F6F7] px-10 py-10 font-[Poppins]">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full border-[5px] border-[#8B5CF6] bg-white" />
        <h1 className="text-[40px] font-semibold text-[#3A3A3A]">
          Manage Courses
        </h1>
      </div>

      {/* Top actions */}
      <div className="mt-10 flex items-center justify-between">
        <button
          className="rounded-xl bg-[#CFA3F1] px-8 py-3 text-[18px] font-medium text-[#1F1F1F]
                     shadow-[0_8px_18px_rgba(139,92,246,0.18)] hover:opacity-95 transition"
          onClick={() => navigate("/courses/new")}
        >
          + Add Course
        </button>

        {/* Search */}
        <div className="relative w-[520px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full rounded-full border border-[#E5E5EA] bg-white px-6 py-3 pr-16
                       text-[16px] outline-none placeholder:text-[#A0A0A6]
                       shadow-[0_10px_25px_rgba(0,0,0,0.06)]"
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full
                       bg-[#8B5CF6] grid place-items-center shadow-[0_10px_20px_rgba(139,92,246,0.25)]
                       hover:opacity-95 transition"
            onClick={() => console.log("Search submit:", search)}
            aria-label="Search"
            type="button"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div
        className="mt-10 w-full rounded-2xl bg-white px-10 py-8
                   shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
      >
        {/* Table header */}
        <div className="grid grid-cols-[120px_1fr_120px_140px_160px_120px] items-center text-[16px] font-semibold text-[#5A5A5A]">
          <div>Code</div>
          <div>Course Title</div>
          <div>Modules</div>
          <div>Status</div>
          <div>Last Update</div>
          <div></div>
        </div>

        <div className="mt-5 space-y-4">
          {loading && (
            <div className="rounded-xl bg-[#F3F3F5] px-6 py-10 text-center text-[#6B6B6B]">
              Loading courses...
            </div>
          )}

          {!loading &&
            filtered.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[120px_1fr_120px_140px_160px_120px] items-center
                           rounded-xl bg-[#F3F3F5] px-6 py-4 text-[16px] text-[#2E2E2E]"
              >
                <div className="font-medium">{c.code || "-"}</div>
                <div className="font-medium">{c.title || "-"}</div>
                <div className="font-medium">{c.modulesCount ?? 0}</div>
                <div className="font-medium">
                  {c.status
                    ? c.status.charAt(0).toUpperCase() + c.status.slice(1)
                    : "Draft"}
                </div>
                <div className="font-medium">
                  {/* simple placeholder until we format timestamps */}
                  —
                </div>

                <div className="flex justify-end">
                  <button
                    className="rounded-full border border-[#DCDCE2] bg-white px-8 py-2
                               text-[14px] font-medium text-[#2E2E2E]
                               shadow-[0_10px_18px_rgba(0,0,0,0.06)]
                               hover:bg-[#FAFAFB] transition"
                    onClick={() => navigate(`/courses/${c.id}`)}
                    type="button"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}

          {!loading && filtered.length === 0 && (
            <div className="rounded-xl bg-[#F3F3F5] px-6 py-10 text-center text-[#6B6B6B]">
              No courses found.
            </div>
          )}
        </div>

        {/* bottom space (like the design empty area) */}
        <div className="h-[260px]" />
      </div>
    </div>
  );
}
