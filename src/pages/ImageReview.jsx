import { useMemo, useState } from "react";
import { ChevronDown, Filter, Search, X } from "lucide-react";

const DUMMY_IMAGES = [
  {
    id: "IMG001",
    thumbUrl:
      "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=200&q=60",
    uploadedBy: "Nurse #1021",
    prediction: "Healthy Stoma",
    confidence: 82,
    status: "Pending Review",
    uploadedOn: "Feb 4, 2026",
    notes: "Clear visibility, centered frame.",
  },
  {
    id: "IMG002",
    thumbUrl:
      "https://images.unsplash.com/photo-1580281657527-47f249e8f67b?auto=format&fit=crop&w=200&q=60",
    uploadedBy: "Nurse #0884",
    prediction: "Skin Irritation",
    confidence: 74,
    status: "Reviewed",
    uploadedOn: "Feb 2, 2026",
    notes: "Redness around peristomal region.",
    adminLabel: "Skin Irritation",
  },
  {
    id: "IMG003",
    thumbUrl:
      "https://images.unsplash.com/photo-1582719478148-bb2b7b14d245?auto=format&fit=crop&w=200&q=60",
    uploadedBy: "Nurse #1105",
    prediction: "Leakage",
    confidence: 68,
    status: "Approved for Retraining",
    uploadedOn: "Jan 30, 2026",
    notes: "Possible leakage around barrier ring.",
    adminLabel: "Leakage",
  },
  {
    id: "IMG004",
    thumbUrl:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=200&q=60",
    uploadedBy: "Nurse #0640",
    prediction: "Infection",
    confidence: 61,
    status: "Rejected",
    uploadedOn: "Jan 29, 2026",
    notes: "Low lighting / blurry capture.",
    adminLabel: "Other",
  },
];

const STATUS_FILTERS = [
  "All",
  "Pending Review",
  "Reviewed",
  "Approved for Retraining",
  "Rejected",
];

const LABEL_OPTIONS = [
  "Healthy Stoma",
  "Infection",
  "Leakage",
  "Skin Irritation",
  "Other",
];

function statusPillClasses(status) {
  switch (status) {
    case "Approved for Retraining":
      return "bg-green-100 text-green-700";
    case "Rejected":
      return "bg-red-100 text-red-700";
    case "Reviewed":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-yellow-100 text-yellow-700"; // Pending
  }
}

export default function ImageReview() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [images, setImages] = useState(DUMMY_IMAGES);

  const [openReviewId, setOpenReviewId] = useState(null);
  const active = useMemo(
    () => images.find((img) => img.id === openReviewId) || null,
    [images, openReviewId]
  );

  const [label, setLabel] = useState("Healthy Stoma");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return images.filter((img) => {
      const matchesStatus =
        statusFilter === "All" ? true : img.status === statusFilter;

      const matchesQuery = !q
        ? true
        : img.id.toLowerCase().includes(q) ||
          img.uploadedBy.toLowerCase().includes(q) ||
          img.prediction.toLowerCase().includes(q) ||
          (img.adminLabel || "").toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [images, statusFilter, query]);

  const stats = useMemo(() => {
    const total = images.length;
    const pending = images.filter((i) => i.status === "Pending Review").length;
    const approved = images.filter(
      (i) => i.status === "Approved for Retraining"
    ).length;
    const rejected = images.filter((i) => i.status === "Rejected").length;

    return { total, pending, approved, rejected };
  }, [images]);

  function openReview(img) {
    setOpenReviewId(img.id);
    setLabel(img.adminLabel || img.prediction || "Healthy Stoma");
  }

  function closeReview() {
    setOpenReviewId(null);
  }

  function saveReview(nextStatus) {
    if (!active) return;

    setImages((prev) =>
      prev.map((img) =>
        img.id === active.id
          ? {
              ...img,
              adminLabel: label,
              status: nextStatus || "Reviewed",
            }
          : img
      )
    );
    closeReview();
  }

  return (
    <div className="min-h-screen w-full bg-[#F6F6F7] px-10 py-10 font-[Poppins]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full border-[5px] border-[#8B5CF6] bg-white" />
          <div>
            <h1 className="text-[40px] font-semibold text-[#3A3A3A]">
              Image Review
            </h1>
            
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6F6F76]">
              <Filter size={16} />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-xl border border-[#E5E5EA] bg-white pl-11 pr-10 py-3
                         text-[15px] font-medium text-[#2E2E2E]
                         shadow-[0_10px_22px_rgba(0,0,0,0.06)] outline-none"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6F6F76]">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Images", value: stats.total },
          { label: "Pending Review", value: stats.pending },
          { label: "Approved", value: stats.approved },
          { label: "Rejected", value: stats.rejected },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-white px-5 py-4
                      shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[12px] text-[#7A7A7A]">{s.label}</p>
            <p className="mt-1 text-[20px] font-semibold text-[#3A3A3A]">
              {s.value}
            </p>
          </div>
        ))}
      </div>


      {/* Main Table Card */}
      <div
        className="mt-8 w-full rounded-2xl bg-white px-10 py-8
                   shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
      >
        {/* Search */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[18px] font-semibold text-[#3A3A3A]">
            Images
          </h2>

          <div className="relative w-[520px] max-w-full">
            <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#8B8B92]">
              <Search size={18} />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, nurse, prediction..."
              className="w-full rounded-full border border-[#E5E5EA] bg-white pl-12 pr-6 py-3
                         text-[15px] outline-none placeholder:text-[#A0A0A6]
                         shadow-[0_10px_25px_rgba(0,0,0,0.06)]"
            />
          </div>
        </div>

        {/* Table header */}
        <div className="mt-7 grid grid-cols-[100px_160px_180px_120px_150px_150px_140px] items-center text-[14px] font-semibold text-[#5A5A5A]">
          <div>Image</div>
          <div>Uploaded By</div>
          <div>Model Prediction</div>
          <div>Confidence</div>
          <div>Status</div>
          <div>Uploaded On</div>
          <div></div>
        </div>

        {/* Rows */}
        <div className="mt-5 space-y-4">
          {filtered.map((img) => (
            <div
              key={img.id}
              className="grid grid-cols-[90px_160px_180px_120px_150px_150px_90px] items-center
                         rounded-xl bg-[#F3F3F5] px-5 py-4 text-[15px] text-[#2E2E2E]"
            >
              <div>
                <img
                  src={img.thumbUrl}
                  alt={img.id}
                  className="h-12 w-12 rounded-xl object-cover border border-white"
                />
              </div>

              <div className="font-medium">{img.uploadedBy}</div>
              <div className="font-medium">{img.prediction}</div>
              <div className="font-medium">{img.confidence}%</div>

              <div>
                <span
                  className={`inline-flex rounded-full px-4 py-1 text-[13px] font-medium ${statusPillClasses(
                    img.status
                  )}`}
                >
                  {img.status}
                </span>
              </div>

              <div className="font-medium text-[#4A4A4A]">{img.uploadedOn}</div>

              <div className="flex justify-end">
                <button
                  className="rounded-full border border-[#DCDCE2] bg-white px-7 py-2
                             text-[13px] font-medium text-[#2E2E2E]
                             shadow-[0_10px_18px_rgba(0,0,0,0.06)]
                             hover:bg-[#FAFAFB] transition"
                  onClick={() => openReview(img)}
                >
                  Review
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-xl bg-[#F3F3F5] px-6 py-10 text-center text-[#6B6B6B]">
              No images found.
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {active && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-6">
          <div className="w-full max-w-5xl rounded-2xl bg-white shadow-[0_22px_60px_rgba(0,0,0,0.20)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EEE] px-8 py-6">
              <div>
                <h3 className="text-[20px] font-semibold text-[#3A3A3A]">
                  Review Image — {active.id}
                </h3>
                <p className="mt-1 text-[13px] text-[#7A7A7A]">
                  Uploaded by {active.uploadedBy} • {active.uploadedOn}
                </p>
              </div>

              <button
                onClick={closeReview}
                className="h-10 w-10 rounded-xl bg-[#F3F3F5] grid place-items-center hover:bg-[#ECECEF] transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-8 py-8">
              {/* A) Image Preview */}
              <div className="rounded-2xl bg-[#FAFAFB] border border-[#EEE] p-6">
                <p className="text-[14px] font-semibold text-[#3A3A3A]">
                  Image Preview
                </p>
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#EEE] bg-white">
                  <img
                    src={active.thumbUrl}
                    alt={active.id}
                    className="w-full h-[360px] object-cover"
                  />
                </div>
                
              </div>

              {/* B + C) AI Output + Admin Label */}
              <div className="space-y-6">
                {/* AI Output */}
                <div className="rounded-2xl bg-white border border-[#EEE] p-6">
                  <p className="text-[14px] font-semibold text-[#3A3A3A]">
                    AI Output
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-[14px] text-[#4A4A4A]">
                    <div className="rounded-xl bg-[#F3F3F5] px-4 py-3">
                      <p className="text-[12px] text-[#7A7A7A]">
                        Model Prediction
                      </p>
                      <p className="mt-1 font-medium text-[#2E2E2E]">
                        {active.prediction}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#F3F3F5] px-4 py-3">
                      <p className="text-[12px] text-[#7A7A7A]">Confidence</p>
                      <p className="mt-1 font-medium text-[#2E2E2E]">
                        {active.confidence}%
                      </p>
                    </div>

                    
                  </div>
                </div>

                {/* Admin Labeling */}
                <div className="rounded-2xl bg-white border border-[#EEE] p-6">
                  <p className="text-[14px] font-semibold text-[#3A3A3A]">
                    Admin Labeling
                  </p>

                  <div className="mt-4">
                    <label className="text-[13px] font-medium text-[#4A4A4A]">
                      Correct Label
                    </label>

                    <select
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-[#E5E5EA] bg-[#FAFAFB] px-4 py-3
                                 text-[15px] outline-none focus:border-[#8B5CF6]"
                    >
                      {LABEL_OPTIONS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                    
                  </div>
                </div>

                {/* Decisions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => saveReview("Approved for Retraining")}
                    className="flex-1 rounded-xl bg-[#8B5CF6] px-6 py-3 text-[15px] font-medium text-white
                               shadow-[0_12px_24px_rgba(139,92,246,0.20)] hover:opacity-95 transition"
                  >
                    Approve for Retraining
                  </button>

                  <button
                    onClick={() => saveReview("Rejected")}
                    className="flex-1 rounded-xl bg-white px-6 py-3 text-[15px] font-medium text-red-600
                               border border-red-200 hover:bg-red-50 transition"
                  >
                     Reject
                  </button>

                  <button
                    onClick={() => saveReview("Reviewed")}
                    className="flex-1 rounded-xl bg-[#CFA3F1] px-6 py-3 text-[15px] font-medium text-[#1F1F1F]
                               shadow-[0_12px_24px_rgba(139,92,246,0.12)] hover:opacity-95 transition"
                  >
                    Save Review
                  </button>
                </div>

                
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
