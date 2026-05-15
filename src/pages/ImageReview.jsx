import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Filter,
  Search,
  X,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  XCircle,
  Brain,
  Loader2,
  Eye,
} from "lucide-react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query as firestoreQuery,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const STATUS_FILTERS = [
  "All",
  "Pending Review",
  "Reviewed",
  "Approved for Retraining",
  "Rejected",
];

const LABEL_OPTIONS = [
  "Healthy Stoma",
  "Ischemic",
  "Infection",
  "Leakage",
  "Skin Irritation",
  "Other",
];

function formatDate(value) {
  if (!value) return "Not available";

  if (value?.toDate) {
    return value.toDate().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (typeof value === "string") return value;

  return "Not available";
}

function statusPillClasses(status) {
  switch (status) {
    case "Approved for Retraining":
      return "bg-green-50 text-green-700 border-green-100";
    case "Rejected":
      return "bg-red-50 text-red-600 border-red-100";
    case "Reviewed":
      return "bg-blue-50 text-blue-700 border-blue-100";
    default:
      return "bg-orange-50 text-orange-600 border-orange-100";
  }
}

function StatCard({ label, value, icon: Icon, tone = "purple" }) {
  const styles = {
    purple: "bg-[#F7EAFE] text-[#B72AD7]",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-[28px] px-5 py-5 border border-[#F0EAF7] shadow-[0_12px_35px_rgba(30,20,60,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] text-gray-400">{label}</p>
          <p className="mt-1 text-[25px] font-semibold text-gray-950">
            {value}
          </p>
        </div>

        <div
          className={`h-11 w-11 rounded-2xl flex items-center justify-center ${styles[tone]}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function ImageReview() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [openReviewId, setOpenReviewId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [label, setLabel] = useState("Healthy Stoma");

  const gridCols =
    "grid grid-cols-[100px_280px_minmax(230px,1fr)_125px_230px_155px_125px] items-center";

  const active = useMemo(
    () => images.find((img) => img.id === openReviewId) || null,
    [images, openReviewId]
  );

  useEffect(() => {
    const reviewsRef = collection(db, "imageReviews");
    const q = firestoreQuery(reviewsRef, orderBy("uploadedOn", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reviewList = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();

          return {
            id: docSnap.id,
            thumbUrl: data.imageUrl || data.thumbUrl || "",
            uploadedBy:
              data.uploadedByName ||
              data.uploadedBy ||
              data.uploadedByEmail ||
              "Unknown user",
            uploadedByEmail: data.uploadedBy || data.uploadedByEmail || "",
            prediction: data.prediction || "Unknown",
            confidence: data.confidence || 0,
            status: data.status || "Pending Review",
            uploadedOn: formatDate(data.uploadedOn || data.createdAt),
            notes: data.notes || "No notes added.",
            adminLabel: data.adminLabel || "",
          };
        });

        setImages(reviewList);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading image reviews:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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

  async function saveReview(nextStatus) {
    if (!active) return;

    try {
      setSaving(true);

      await updateDoc(doc(db, "imageReviews", active.id), {
        adminLabel: label,
        status: nextStatus || "Reviewed",
        reviewedAt: serverTimestamp(),
      });

      closeReview();
    } catch (error) {
      console.error("Error saving review:", error);
      alert("Could not save review. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9FF] px-8 py-8 font-[Poppins]">
      <div className="space-y-7">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div>
            <h1 className="text-[36px] sm:text-[42px] font-semibold text-gray-950 tracking-tight leading-tight">
              Image Review
            </h1>
            <p className="text-[15px] text-gray-400 mt-2">
              Review AI predictions and approve useful images for model
              retraining.
            </p>
          </div>

          <div className="relative w-full sm:w-[280px]">
            <Filter
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-[18px] border border-[#F0EAF7] bg-white py-3 pl-11 pr-10 text-[14px] font-semibold text-gray-600 outline-none shadow-[0_12px_35px_rgba(30,20,60,0.04)] focus:border-[#E9C8F7] transition"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            label="Total Images"
            value={stats.total}
            icon={ImageIcon}
            tone="purple"
          />
          <StatCard
            label="Pending Review"
            value={stats.pending}
            icon={Clock}
            tone="orange"
          />
          <StatCard
            label="Approved"
            value={stats.approved}
            icon={CheckCircle2}
            tone="green"
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon={XCircle}
            tone="red"
          />
        </div>

        <div className="bg-white rounded-[30px] border border-[#F0EAF7] shadow-[0_12px_35px_rgba(30,20,60,0.04)] overflow-hidden">
          <div className="p-5 border-b border-[#F3EEF8]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-[#F7EAFE] flex items-center justify-center">
                  <Brain size={20} className="text-[#B72AD7]" />
                </div>
                <div>
                  <h2 className="text-[19px] font-semibold text-gray-950">
                    Submitted Images
                  </h2>
                  <p className="text-[13px] text-gray-400">
                    {filtered.length} image
                    {filtered.length === 1 ? "" : "s"} found
                  </p>
                </div>
              </div>

              <div className="relative w-full lg:w-[430px]">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by ID, nurse, prediction..."
                  className="w-full rounded-[18px] border border-[#F0EAF7] bg-[#FCFBFE] py-3 pl-11 pr-4 text-[14px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#E9C8F7] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1260px]">
              <div
                className={`${gridCols} px-8 py-4 text-[13px] font-semibold text-gray-400 border-b border-[#F3EEF8]`}
              >
                <div>Image</div>
                <div>Uploaded By</div>
                <div>Model Prediction</div>
                <div className="text-center">Confidence</div>
                <div>Status</div>
                <div>Uploaded On</div>
                <div className="text-right">Action</div>
              </div>

              <div className="px-4 py-4 space-y-3">
                {loading && (
                  <div className="rounded-[24px] bg-[#FCFBFE] border border-[#F2EDF8] px-6 py-14 text-center">
                    <Loader2
                      size={28}
                      className="mx-auto mb-3 text-[#B72AD7] animate-spin"
                    />
                    <p className="text-[15px] font-semibold text-gray-700">
                      Loading image reviews...
                    </p>
                  </div>
                )}

                {!loading &&
                  filtered.map((img) => (
                    <div
                      key={img.id}
                      className={`${gridCols} rounded-[24px] bg-[#FCFBFE] border border-[#F2EDF8] px-8 py-4 text-[14px] text-gray-700 hover:bg-white hover:shadow-[0_12px_30px_rgba(30,20,60,0.05)] transition-all duration-200`}
                    >
                      <div>
                        {img.thumbUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(img)}
                            className="group relative h-16 w-16 overflow-hidden rounded-2xl border border-white shadow-sm"
                          >
                            <img
                              src={img.thumbUrl}
                              alt={img.id}
                              className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 hidden items-center justify-center bg-black/35 text-white group-hover:flex">
                              <Eye size={18} />
                            </div>
                          </button>
                        ) : (
                          <div className="h-16 w-16 rounded-2xl bg-[#F7EAFE] flex items-center justify-center">
                            <ImageIcon size={20} className="text-[#B72AD7]" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 pr-6">
                        <p
                          className="font-semibold text-gray-950 truncate"
                          title={img.uploadedBy}
                        >
                          {img.uploadedBy}
                        </p>
                        <p
                          className="text-[12px] text-gray-400 mt-1 truncate"
                          title={img.uploadedByEmail || img.id}
                        >
                          {img.uploadedByEmail || img.id}
                        </p>
                      </div>

                      <div className="min-w-0 pr-6">
                        <p
                          className="font-semibold text-gray-950 truncate"
                          title={img.prediction}
                        >
                          {img.prediction}
                        </p>
                        <p className="text-[12px] text-gray-400 mt-1">
                          AI generated result
                        </p>
                      </div>

                      <div className="text-center">
                        <span className="inline-flex min-w-[62px] justify-center rounded-full bg-[#F7EAFE] px-3 py-1.5 text-[13px] font-semibold text-[#B72AD7]">
                          {img.confidence}%
                        </span>
                      </div>

                      <div className="pr-5">
                        <span
                          className={`inline-flex max-w-[190px] rounded-full border px-3 py-1.5 text-[12px] font-semibold truncate ${statusPillClasses(
                            img.status
                          )}`}
                          title={img.status}
                        >
                          {img.status}
                        </span>
                      </div>

                      <div className="font-medium text-gray-500">
                        {img.uploadedOn}
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => openReview(img)}
                          className="rounded-full border border-[#F0EAF7] bg-white px-5 py-2.5 text-[13px] font-semibold text-gray-600 hover:border-[#E9C8F7] hover:text-[#B72AD7] hover:bg-[#FFF9FF] transition"
                        >
                          Review
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
                      No images found
                    </p>
                    <p className="text-[14px] text-gray-400 mt-1">
                      Try changing the filter or search keyword.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {active && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/35 px-4 backdrop-blur-sm">
            <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[32px] bg-white border border-[#F0EAF7] shadow-[0_30px_80px_rgba(30,20,60,0.18)]">
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[#F3EEF8] px-7 py-5">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[13px] font-medium text-[#B72AD7]">
                      Image Review
                    </p>
                    <h3 className="text-[24px] font-semibold text-gray-950 mt-1">
                      Review Image
                    </h3>
                    <p className="text-[14px] text-gray-400 mt-1">
                      Uploaded by {active.uploadedBy} • {active.uploadedOn}
                    </p>
                  </div>

                  <button
                    onClick={closeReview}
                    className="h-10 w-10 rounded-full border border-[#F0EAF7] bg-white text-gray-400 hover:text-gray-900 hover:bg-[#FCFBFE] transition flex items-center justify-center"
                    aria-label="Close"
                    type="button"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="max-h-[calc(90vh-92px)] overflow-y-auto px-7 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-[28px] bg-[#FCFBFE] border border-[#F2EDF8] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-[18px] font-semibold text-gray-950">
                          Image Preview
                        </h4>
                        <p className="text-[13px] text-gray-400 mt-1">
                          Click the image to view it larger.
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-semibold ${statusPillClasses(
                          active.status
                        )}`}
                      >
                        {active.status}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewImage(active)}
                      className="mt-5 w-full overflow-hidden rounded-[26px] border border-[#F2EDF8] bg-white group"
                    >
                      {active.thumbUrl ? (
                        <img
                          src={active.thumbUrl}
                          alt={active.id}
                          className="w-full h-[380px] object-cover transition duration-200 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="w-full h-[380px] flex flex-col items-center justify-center bg-[#F7EAFE] text-[#B72AD7]">
                          <ImageIcon size={42} />
                          <p className="mt-3 text-[14px] font-semibold">
                            No image available
                          </p>
                        </div>
                      )}
                    </button>

                    <p className="mt-4 text-[14px] text-gray-500 leading-relaxed">
                      {active.notes}
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[28px] bg-white border border-[#F2EDF8] p-5">
                      <h4 className="text-[18px] font-semibold text-gray-950">
                        AI Output
                      </h4>
                      <p className="text-[13px] text-gray-400 mt-1">
                        Prediction generated by the image recognition model.
                      </p>

                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-[22px] bg-[#FCFBFE] border border-[#F2EDF8] p-4">
                          <p className="text-[13px] text-gray-400">
                            Model Prediction
                          </p>
                          <p className="mt-1 text-[17px] font-semibold text-gray-950">
                            {active.prediction}
                          </p>
                        </div>

                        <div className="rounded-[22px] bg-[#FCFBFE] border border-[#F2EDF8] p-4">
                          <p className="text-[13px] text-gray-400">
                            Confidence
                          </p>
                          <p className="mt-1 text-[17px] font-semibold text-gray-950">
                            {active.confidence}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="flex justify-between text-[13px] mb-2">
                          <span className="text-gray-400">
                            Confidence Score
                          </span>
                          <span className="font-semibold text-gray-950">
                            {active.confidence}%
                          </span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#D946EF] to-[#9333EA]"
                            style={{ width: `${active.confidence}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] bg-white border border-[#F2EDF8] p-5">
                      <h4 className="text-[18px] font-semibold text-gray-950">
                        Admin Labeling
                      </h4>
                      <p className="text-[13px] text-gray-400 mt-1">
                        Confirm or correct the model prediction.
                      </p>

                      <div className="mt-5">
                        <label className="text-[13px] font-semibold text-gray-500">
                          Correct Label
                        </label>

                        <select
                          value={label}
                          onChange={(e) => setLabel(e.target.value)}
                          className="mt-2 w-full rounded-[18px] border border-[#F0EAF7] bg-[#FCFBFE] px-4 py-3 text-[14px] text-gray-800 outline-none focus:border-[#E9C8F7] focus:bg-white transition"
                        >
                          {LABEL_OPTIONS.map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="rounded-[28px] bg-[#FCFBFE] border border-[#F2EDF8] p-5">
                      <h4 className="text-[18px] font-semibold text-gray-950">
                        Review Decision
                      </h4>
                      <p className="text-[13px] text-gray-400 mt-1">
                        Choose how this image should be handled.
                      </p>

                      <div className="mt-5 grid grid-cols-1 gap-3">
                        <button
                          disabled={saving}
                          onClick={() => saveReview("Approved for Retraining")}
                          className="rounded-[18px] bg-gradient-to-r from-[#D946EF] to-[#9333EA] px-5 py-3.5 text-[14px] font-semibold text-white shadow-[0_16px_35px_rgba(168,85,247,0.20)] hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
                          type="button"
                        >
                          {saving ? "Saving..." : "Approve for Retraining"}
                        </button>

                        <button
                          disabled={saving}
                          onClick={() => saveReview("Reviewed")}
                          className="rounded-[18px] bg-[#F7EAFE] px-5 py-3.5 text-[14px] font-semibold text-[#B72AD7] hover:bg-[#F2DDFB] transition disabled:opacity-60 disabled:cursor-not-allowed"
                          type="button"
                        >
                          {saving ? "Saving..." : "Save Review"}
                        </button>

                        <button
                          disabled={saving}
                          onClick={() => saveReview("Rejected")}
                          className="rounded-[18px] bg-white px-5 py-3.5 text-[14px] font-semibold text-red-600 border border-red-100 hover:bg-red-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                          type="button"
                        >
                          {saving ? "Saving..." : "Reject Image"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 mt-7 -mx-7 -mb-6 bg-white/95 backdrop-blur border-t border-[#F3EEF8] px-7 py-5 flex justify-end">
                  <button
                    onClick={closeReview}
                    className="rounded-[18px] border border-[#F0EAF7] bg-white px-5 py-3 text-[14px] font-semibold text-gray-500 hover:bg-[#FCFBFE] transition"
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {previewImage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/70 px-5 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl rounded-[30px] bg-white p-4 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute -right-3 -top-3 h-10 w-10 rounded-full bg-white border border-[#F0EAF7] flex items-center justify-center text-gray-500 hover:text-gray-950 transition"
              >
                <X size={18} />
              </button>

              <div className="mb-4 flex items-center justify-between gap-4 px-1">
                <div>
                  <p className="text-[13px] font-semibold text-[#B72AD7]">
                    Larger Preview
                  </p>
                  <p className="text-[15px] font-semibold text-gray-950">
                    {previewImage.prediction} • {previewImage.confidence}%
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full border px-3 py-1.5 text-[12px] font-semibold ${statusPillClasses(
                    previewImage.status
                  )}`}
                >
                  {previewImage.status}
                </span>
              </div>

              {previewImage.thumbUrl ? (
                <img
                  src={previewImage.thumbUrl}
                  alt={previewImage.id}
                  className="max-h-[72vh] w-full rounded-[24px] object-contain bg-[#FCFBFE]"
                />
              ) : (
                <div className="h-[60vh] rounded-[24px] bg-[#F7EAFE] flex flex-col items-center justify-center text-[#B72AD7]">
                  <ImageIcon size={46} />
                  <p className="mt-3 text-[14px] font-semibold">
                    No image available
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}