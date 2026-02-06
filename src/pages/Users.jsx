import { useMemo, useState } from "react";
import { Search } from "lucide-react";

const DUMMY_USERS = [
  {
    id: "U-1021",
    email: "nurse1021@mentora.app",
    name: "Dilani Perera",
    role: "Nurse",
    status: "Active",
    registeredOn: "Jan 18, 2026",
  },
  {
    id: "U-0884",
    email: "nurse0884@mentora.app",
    name: "Sewmi Jayasinghe",
    role: "Nurse",
    status: "Active",
    registeredOn: "Dec 29, 2025",
  },
  {
    id: "U-0640",
    email: "nurse0640@mentora.app",
    name: "Nethmi Fernando",
    role: "Nurse",
    status: "Disabled",
    registeredOn: "Dec 12, 2025",
  },
  {
    id: "A-0001",
    email: "admin@mentora.app",
    name: "Mentora Admin",
    role: "Admin",
    status: "Active",
    registeredOn: "Nov 10, 2025",
  },
];

function statusPillClasses(status) {
  return status === "Active"
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-7 w-12 items-center rounded-full transition",
        checked ? "bg-[#8B5CF6]" : "bg-[#D7D7DD]",
      ].join(" ")}
      aria-pressed={checked}
      aria-label="Toggle active status"
    >
      <span
        className={[
          "inline-block h-5 w-5 transform rounded-full bg-white transition shadow",
          checked ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

export default function Users() {
  const [users, setUsers] = useState(DUMMY_USERS);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.id.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.status.toLowerCase().includes(q)
    );
  }, [users, query]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "Active").length;
    return { total, active };
  }, [users]);

  function toggleUserStatus(userId, nextActive) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: nextActive ? "Active" : "Disabled" }
          : u
      )
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F6F6F7] px-10 py-10 font-[Poppins]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full border-[5px] border-[#8B5CF6] bg-white" />
          <div>
            <h1 className="text-[40px] font-semibold text-[#3A3A3A]">
              Mentora Users
            </h1>

            {/* subtle stats */}
            <div className="mt-4 grid grid-cols-2 gap-4 max-w-[420px]">
              {[
                { label: "Total Users", value: stats.total },
                { label: "Active Users", value: stats.active },
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

          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        className="mt-10 w-full rounded-2xl bg-white px-10 py-8
                   shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
      >
        {/* Search */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[18px] font-semibold text-[#3A3A3A]">
            Users List
          </h2>

          <div className="relative w-[520px] max-w-full">
            <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#8B8B92]">
              <Search size={18} />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, email, name..."
              className="w-full rounded-full border border-[#E5E5EA] bg-white pl-12 pr-6 py-3
                         text-[15px] outline-none placeholder:text-[#A0A0A6]
                         shadow-[0_10px_25px_rgba(0,0,0,0.06)]"
            />
          </div>
        </div>

        {/* Table header */}
        <div className="mt-7 grid grid-cols-[170px_220px_170px_120px_160px_140px] items-center text-[14px] font-semibold text-[#5A5A5A]">
          <div>User ID / Email</div>
          <div>Name</div>
          <div>Role</div>
          <div>Status</div>
          <div>Registered On</div>
          <div>Activate/Deactivate</div>
        </div>

        {/* Rows */}
        <div className="mt-5 space-y-4">
          {filtered.map((u) => {
            const isActive = u.status === "Active";
            return (
              <div
                key={u.id}
                className="grid grid-cols-[170px_220px_170px_120px_160px_100px] items-center
                           rounded-xl bg-[#F3F3F5] px-5 py-4 text-[15px] text-[#2E2E2E]"
              >
                <div className="font-medium leading-tight">
                  <div className="text-[14px]">{u.id}</div>
                  <div className="text-[12px] text-[#6F6F76]">{u.email}</div>
                </div>

                <div className="font-medium">{u.name}</div>
                <div className="font-medium">{u.role}</div>

                <div>
                  <span
                    className={`inline-flex rounded-full px-4 py-1 text-[13px] font-medium ${statusPillClasses(
                      u.status
                    )}`}
                  >
                    {u.status}
                  </span>
                </div>

                <div className="font-medium text-[#4A4A4A]">{u.registeredOn}</div>

                <div className="flex justify-end">
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-[#6F6F76]">
                      {isActive ? "Deactivate" : "Activate"}
                    </span>
                    <Toggle
                      checked={isActive}
                      onChange={(next) => toggleUserStatus(u.id, next)}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-xl bg-[#F3F3F5] px-6 py-10 text-center text-[#6B6B6B]">
              No users found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
