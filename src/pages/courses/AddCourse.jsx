import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse, generateCourseCode } from "../../data/coursesService";
import { ImagePlus } from "lucide-react";

export default function AddCourse() {
  const navigate = useNavigate();

  const defaultCode = useMemo(() => generateCourseCode("OST"), []);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState(defaultCode);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Draft");

  // meta (optional but professional)
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

  function handleSaveDraft(e) {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      const created = createCourse({
        title,
        code,
        description,
        status, // default Draft
        estimatedDuration,
        category,
        targetAudience,
        thumbnailUrl: "", // placeholder for now
      });

      // best flow: go to course detail page
      // (we’ll build it next: /courses/:id)
      navigate(`/courses/${created.id}`);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F6F6F7] px-10 py-10 font-[Poppins]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full border-[5px] border-[#8B5CF6] bg-white" />
          <div>
            <h1 className="text-[40px] font-semibold text-[#3A3A3A]">
              Add Course
            </h1>
            
          </div>
        </div>

        <button
          onClick={handleCancel}
          className="rounded-xl bg-white px-6 py-3 text-[16px] font-medium text-[#2E2E2E]
                     border border-[#E5E5EA] shadow-[0_10px_22px_rgba(0,0,0,0.06)]
                     hover:bg-[#FAFAFB] transition"
        >
          Cancel
        </button>
      </div>

      {/* Content Card */}
      <form
        onSubmit={handleSaveDraft}
        className="mt-10 w-full rounded-2xl bg-white px-10 py-10
                   shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
      >
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-12 gap-8">
          {/* Left column */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Section A: Basic Info */}
            <div>
              <h2 className="text-[18px] font-semibold text-[#3A3A3A]">
                Basic Course Information
              </h2>
             

              <div className="mt-6 grid grid-cols-12 gap-5">
                <div className="col-span-12">
                  <label className="text-[14px] font-medium text-[#4A4A4A]">
                    Course Title <span className="text-[#8B5CF6]">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Basics of Ostomy Care"
                    className="mt-2 w-full rounded-xl border border-[#E5E5EA] bg-[#FAFAFB]
                               px-5 py-3 text-[15px] outline-none
                               focus:border-[#8B5CF6]"
                  />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <label className="text-[14px] font-medium text-[#4A4A4A]">
                    Course Code <span className="text-[#8B5CF6]">*</span>
                  </label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g., OST101"
                    className="mt-2 w-full rounded-xl border border-[#E5E5EA] bg-[#FAFAFB]
                               px-5 py-3 text-[15px] outline-none
                               focus:border-[#8B5CF6]"
                  />
                  
                </div>

                <div className="col-span-12 md:col-span-6">
                  <label className="text-[14px] font-medium text-[#4A4A4A]">
                    Status
                  </label>
                  <div className="mt-2 flex gap-3">
                    {["Draft", "Published"].map((s) => {
                      const active = status === s;
                      return (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setStatus(s)}
                          className={[
                            "px-5 py-3 rounded-xl text-[15px] font-medium transition border",
                            active
                              ? "bg-[#EDE7FF] border-[#8B5CF6] text-[#2E2E2E]"
                              : "bg-[#FAFAFB] border-[#E5E5EA] text-[#5A5A5A] hover:bg-white",
                          ].join(" ")}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[12px] text-[#7A7A7A]">
                    Draft is recommended until modules are added.
                  </p>
                </div>

                <div className="col-span-12">
                  <label className="text-[14px] font-medium text-[#4A4A4A]">
                    Short Description <span className="text-[#8B5CF6]">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write a short overview for nurses..."
                    rows={4}
                    className="mt-2 w-full resize-none rounded-xl border border-[#E5E5EA] bg-[#FAFAFB]
                               px-5 py-3 text-[15px] outline-none
                               focus:border-[#8B5CF6]"
                  />
                </div>
              </div>
            </div>

            {/* Section C: Meta info */}
            <div>
              <h2 className="text-[18px] font-semibold text-[#3A3A3A]">
                Meta Information
              </h2>
              

              <div className="mt-6 grid grid-cols-12 gap-5">
                <div className="col-span-12 md:col-span-4">
                  <label className="text-[14px] font-medium text-[#4A4A4A]">
                    Estimated Duration
                  </label>
                  <input
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="e.g., 30 mins"
                    className="mt-2 w-full rounded-xl border border-[#E5E5EA] bg-[#FAFAFB]
                               px-5 py-3 text-[15px] outline-none
                               focus:border-[#8B5CF6]"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-[14px] font-medium text-[#4A4A4A]">
                    Category
                  </label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#E5E5EA] bg-[#FAFAFB]
                               px-5 py-3 text-[15px] outline-none
                               focus:border-[#8B5CF6]"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-[14px] font-medium text-[#4A4A4A]">
                    Target Audience
                  </label>
                  <input
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#E5E5EA] bg-[#FAFAFB]
                               px-5 py-3 text-[15px] outline-none
                               focus:border-[#8B5CF6]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="col-span-12 lg:col-span-4">
            {/* Section B: Thumbnail */}
            <div className="rounded-2xl border border-[#EEE] bg-[#FAFAFB] p-6">
              <h2 className="text-[18px] font-semibold text-[#3A3A3A]">
                Thumbnail / Cover
              </h2>
              

              <div className="mt-5 rounded-2xl border border-dashed border-[#D7D7DD] bg-white p-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-[#EDE7FF] grid place-items-center">
                    <ImagePlus className="text-[#8B5CF6]" />
                  </div>
                  <p className="text-[14px] font-medium text-[#4A4A4A]">
                    Upload coming soon
                  </p>
                  

                  <button
                    type="button"
                    className="mt-2 rounded-xl bg-white px-5 py-3 text-[14px] font-medium
                               border border-[#E5E5EA] shadow-[0_10px_18px_rgba(0,0,0,0.06)]
                               hover:bg-[#FAFAFB] transition"
                    onClick={() => console.log("upload placeholder")}
                  >
                    Choose Image
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-xl bg-white px-6 py-3 text-[16px] font-medium text-[#2E2E2E]
                           border border-[#E5E5EA] shadow-[0_10px_22px_rgba(0,0,0,0.06)]
                           hover:bg-[#FAFAFB] transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 rounded-xl bg-[#CFA3F1] px-6 py-3 text-[16px] font-medium text-[#1F1F1F]
                           shadow-[0_12px_24px_rgba(139,92,246,0.18)] hover:opacity-95 transition"
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
