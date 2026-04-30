import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, ArrowLeft, BookOpen, Info, Clock, Users } from "lucide-react";
import { createCourse } from "../../services/courses";

function generateCourseCode(prefix = "OST") {
  const n = Math.floor(100 + Math.random() * 900);
  return `${prefix}${n}`;
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-[14px] font-medium text-gray-600">
        {label} {required && <span className="text-[#B72AD7]">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function AddCourse() {
  const navigate = useNavigate();

  const defaultCode = useMemo(() => generateCourseCode("OST"), []);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState(defaultCode);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Draft");

  const [estimatedDuration, setEstimatedDuration] = useState("30 mins");
  const [category, setCategory] = useState("Ostomy Care");
  const [targetAudience, setTargetAudience] = useState("Nurses");

  const [error, setError] = useState("");

  function handleCancel() {
    navigate("/courses");
  }

  function validate() {
    if (!title.trim()) return "Course Title is required.";
    if (!code.trim()) return "Course Code is required.";
    if (!description.trim()) return "Short Description is required.";
    return "";
  }

  async function handleContinue(e) {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      const id = await createCourse({
        title,
        code,
        description,
        status: status.toLowerCase() === "published" ? "published" : "draft",
        modulesCount: 0,
        estimatedDuration,
        category,
        targetAudience,
        thumbnailUrl: "",
      });

      navigate(`/courses/${id}`);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Something went wrong. Please try again.");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-[18px] border border-[#F0EAF7] bg-[#FCFBFE] px-5 py-3 text-[15px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#E9C8F7] focus:bg-white transition";

  return (
    <div className="min-h-screen bg-[#FAF9FF] px-8 py-8 font-[Poppins]">
      <div className="space-y-7">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div>
            <button
              type="button"
              onClick={handleCancel}
              className="mb-5 inline-flex items-center gap-2 text-[14px] font-medium text-gray-400 hover:text-[#B72AD7] transition"
            >
              <ArrowLeft size={17} />
              Back to Courses
            </button>

            <h1 className="text-[36px] sm:text-[42px] font-semibold text-gray-950 tracking-tight leading-tight">
              Add Course
            </h1>
            <p className="text-[15px] text-gray-400 mt-2">
              Create a new Mentora learning course and add modules next.
            </p>
          </div>

          <button
            onClick={handleCancel}
            type="button"
            className="rounded-[18px] bg-white px-5 py-3 text-[14px] font-semibold text-gray-500 border border-[#F0EAF7] hover:text-gray-900 hover:bg-[#FCFBFE] transition"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleContinue}>
          {error && (
            <div className="mb-5 rounded-[20px] border border-red-100 bg-red-50 px-5 py-4 text-[14px] font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 lg:col-span-8 space-y-5">
              <section className="bg-white rounded-[30px] border border-[#F0EAF7] shadow-[0_12px_35px_rgba(30,20,60,0.04)] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-11 w-11 rounded-2xl bg-[#F7EAFE] flex items-center justify-center">
                    <BookOpen size={20} className="text-[#B72AD7]" />
                  </div>
                  <div>
                    <h2 className="text-[19px] font-semibold text-gray-950">
                      Basic Course Information
                    </h2>
                    <p className="text-[13px] text-gray-400">
                      Main details shown to nurses inside the app.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-5">
                  <div className="col-span-12">
                    <Field label="Course Title" required>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Basics of Ostomy Care"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="col-span-12 md:col-span-6">
                    <Field label="Course Code" required>
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="e.g., OST101"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="col-span-12 md:col-span-6">
                    <Field label="Status">
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        {["Draft", "Published"].map((s) => {
                          const active = status === s;
                          return (
                            <button
                              type="button"
                              key={s}
                              onClick={() => setStatus(s)}
                              className={[
                                "px-5 py-3 rounded-[18px] text-[14px] font-semibold transition border",
                                active
                                  ? "bg-[#F7EAFE] border-[#E9C8F7] text-[#B72AD7]"
                                  : "bg-[#FCFBFE] border-[#F0EAF7] text-gray-400 hover:bg-white",
                              ].join(" ")}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-[12px] text-gray-400">
                        Draft is recommended until modules are added.
                      </p>
                    </Field>
                  </div>

                  <div className="col-span-12">
                    <Field label="Short Description" required>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Write a short overview for nurses..."
                        rows={4}
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-[30px] border border-[#F0EAF7] shadow-[0_12px_35px_rgba(30,20,60,0.04)] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-11 w-11 rounded-2xl bg-[#F7EAFE] flex items-center justify-center">
                    <Info size={20} className="text-[#B72AD7]" />
                  </div>
                  <div>
                    <h2 className="text-[19px] font-semibold text-gray-950">
                      Meta Information
                    </h2>
                    <p className="text-[13px] text-gray-400">
                      Helpful course details for display and organization.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-5">
                  <div className="col-span-12 md:col-span-4">
                    <Field label="Estimated Duration">
                      <input
                        value={estimatedDuration}
                        onChange={(e) => setEstimatedDuration(e.target.value)}
                        placeholder="e.g., 30 mins"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="col-span-12 md:col-span-4">
                    <Field label="Category">
                      <input
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="col-span-12 md:col-span-4">
                    <Field label="Target Audience">
                      <input
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              </section>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-5">
              <section className="bg-white rounded-[30px] border border-[#F0EAF7] shadow-[0_12px_35px_rgba(30,20,60,0.04)] p-6">
                <h2 className="text-[19px] font-semibold text-gray-950">
                  Course Cover
                </h2>
                <p className="text-[13px] text-gray-400 mt-1">
                  Thumbnail upload can be connected later.
                </p>

                <div className="mt-5 rounded-[26px] border border-dashed border-[#E9C8F7] bg-[#FCFBFE] p-7">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-[#F7EAFE] flex items-center justify-center">
                      <ImagePlus className="text-[#B72AD7]" />
                    </div>
                    <p className="text-[14px] font-semibold text-gray-700">
                      Upload coming soon
                    </p>
                    <p className="text-[12px] text-gray-400 max-w-[220px]">
                      A course image can make the mobile course card more engaging.
                    </p>

                    <button
                      type="button"
                      className="mt-2 rounded-[16px] bg-white px-5 py-3 text-[14px] font-semibold text-gray-500 border border-[#F0EAF7] hover:text-[#B72AD7] transition"
                      onClick={() => console.log("upload placeholder")}
                    >
                      Choose Image
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-[30px] bg-gradient-to-br from-[#D946EF] to-[#9333EA] p-6 text-white shadow-[0_16px_35px_rgba(168,85,247,0.18)]">
                <p className="text-[14px] text-white/75">Preview Summary</p>
                <h3 className="text-[21px] font-semibold mt-2">
                  {title || "New Course"}
                </h3>
                <p className="text-[14px] text-white/80 mt-2">
                  {description || "Course description will appear here."}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 text-[13px]">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    {estimatedDuration || "30 mins"}
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} />
                    {category || "Ostomy Care"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    {targetAudience || "Nurses"}
                  </div>
                </div>
              </section>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 rounded-[18px] bg-white px-5 py-3.5 text-[15px] font-semibold text-gray-500 border border-[#F0EAF7] hover:bg-[#FCFBFE] transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-[18px] bg-gradient-to-r from-[#D946EF] to-[#9333EA] px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_16px_35px_rgba(168,85,247,0.20)] hover:opacity-95 transition"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}