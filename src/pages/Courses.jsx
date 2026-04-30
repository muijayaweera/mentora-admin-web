import { useEffect, useMemo, useState } from "react";
import { Search, Plus, BookOpen, Eye, Loader2 } from "lucide-react";
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

  const formatStatus = (status) => {
    if (!status) return "Draft";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusStyle = (status) => {
    const value = (status || "draft").toLowerCase();

    if (value === "published") {
      return "bg-green-50 text-green-700 border-green-100";
    }

    if (value === "draft") {
      return "bg-[#F7EAFE] text-[#B72AD7] border-[#F0D8FA]";
    }

    return "bg-gray-50 text-gray-600 border-gray-100";
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] px-8 py-8 font-[Poppins]">
      <div className="space-y-7">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div>
            <h1 className="text-[36px] sm:text-[42px] font-semibold text-gray-950 tracking-tight leading-tight">
              Manage Courses
            </h1>
            <p className="text-[15px] text-gray-400 mt-2">
              Create, review, and manage learning content for Mentora nurses.
            </p>
          </div>

          <button
            onClick={() => navigate("/courses/new")}
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-[#D946EF] to-[#9333EA] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_16px_35px_rgba(168,85,247,0.20)] hover:opacity-95 transition"
          >
            <Plus size={18} strokeWidth={2.2} />
            Add Course
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-[28px] border border-[#F0EAF7] shadow-[0_12px_35px_rgba(30,20,60,0.04)] p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[#F7EAFE] flex items-center justify-center">
                <BookOpen size={20} className="text-[#B72AD7]" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-gray-950">
                  Course Library
                </p>
                <p className="text-[13px] text-gray-400">
                  {filtered.length} course{filtered.length === 1 ? "" : "s"} found
                </p>
              </div>
            </div>

            <div className="relative w-full lg:w-[430px]">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses, codes, or status"
                className="w-full rounded-[18px] border border-[#F0EAF7] bg-[#FCFBFE] py-3 pl-11 pr-4 text-[14px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#E9C8F7] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Course Table */}
        <div className="bg-white rounded-[30px] border border-[#F0EAF7] shadow-[0_12px_35px_rgba(30,20,60,0.04)] overflow-hidden">
          <div className="grid grid-cols-[120px_1fr_120px_150px_150px_110px] items-center px-10 py-4 border-b border-[#F3EEF8] text-[13px] font-semibold text-gray-400">
            <div>Code</div>
            <div>Course Title</div>
            <div>Modules</div>
            <div>Status</div>
            <div>Last Update</div>
            <div className="text-right">Action</div>
          </div>

          <div className="px-4 py-4 space-y-3">
            {loading && (
              <div className="rounded-[24px] bg-[#FCFBFE] border border-[#F2EDF8] px-6 py-12 text-center">
                <Loader2 className="mx-auto mb-3 animate-spin text-[#B72AD7]" size={26} />
                <p className="text-[15px] font-medium text-gray-500">
                  Loading courses...
                </p>
              </div>
            )}

            {!loading &&
              filtered.map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-[120px_1fr_120px_150px_150px_110px] items-center rounded-[22px] bg-[#FCFBFE] border border-[#F2EDF8] px-6 py-4 text-[14px] text-gray-700 hover:bg-white hover:shadow-[0_12px_30px_rgba(30,20,60,0.05)] transition-all duration-200"
                >
                  <div className="font-semibold text-gray-800">
                    {c.code || "-"}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-950">
                      {c.title || "-"}
                    </p>
                    <p className="text-[12px] text-gray-400 mt-1">
                      Mentora learning course
                    </p>
                  </div>

                  <div className="font-semibold text-gray-800">
                    {c.modulesCount ?? 0}
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold ${getStatusStyle(
                        c.status
                      )}`}
                    >
                      {formatStatus(c.status)}
                    </span>
                  </div>

                  <div className="font-medium text-gray-400">—</div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => navigate(`/courses/${c.id}`)}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-[#F0EAF7] bg-white px-4 py-2 text-[13px] font-semibold text-gray-600 hover:border-[#E9C8F7] hover:text-[#B72AD7] hover:bg-[#FFF9FF] transition"
                    >
                      <Eye size={15} />
                      View
                    </button>
                  </div>
                </div>
              ))}

            {!loading && filtered.length === 0 && (
              <div className="rounded-[24px] bg-[#FCFBFE] border border-[#F2EDF8] px-6 py-14 text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-[#F7EAFE] flex items-center justify-center">
                  <Search size={22} className="text-[#B72AD7]" />
                </div>
                <p className="text-[16px] font-semibold text-gray-800">
                  No courses found
                </p>
                <p className="text-[14px] text-gray-400 mt-1">
                  Try searching with another course title, code, or status.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}