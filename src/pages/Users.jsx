import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Shield,
  Loader2,
} from "lucide-react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query as firestoreQuery,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase"; // adjust if your firebase file path is different

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
  return status === "Active"
    ? "bg-green-50 text-green-700 border-green-100"
    : "bg-red-50 text-red-600 border-red-100";
}

function rolePillClasses(role) {
  return role === "admin" || role === "Admin"
    ? "bg-[#F7EAFE] text-[#B72AD7] border-[#F0D8FA]"
    : "bg-blue-50 text-blue-700 border-blue-100";
}

function StatCard({ label, value, icon: Icon, tone = "purple" }) {
  const styles = {
    purple: "bg-[#F7EAFE] text-[#B72AD7]",
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

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-7 w-12 items-center rounded-full transition",
        checked ? "bg-[#B72AD7]" : "bg-gray-300",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
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
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = firestoreQuery(usersRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userList = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();

          const isDisabled = data.disabled === true || data.status === "Disabled";

          return {
            id: docSnap.id,
            email: data.email || "No email",
            name: data.name || data.displayName || "Unnamed User",
            role: data.role || "nurse",
            status: isDisabled ? "Disabled" : "Active",
            registeredOn: formatDate(data.createdAt || data.registeredOn),
          };
        });

        setUsers(userList);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading users:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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
    const disabled = users.filter((u) => u.status === "Disabled").length;

    return { total, active, disabled };
  }, [users]);

  async function toggleUserStatus(userId, nextActive) {
    try {
      setUpdatingUserId(userId);

      await updateDoc(doc(db, "users", userId), {
        disabled: !nextActive,
        status: nextActive ? "Active" : "Disabled",
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Could not update user status. Please try again.");
    } finally {
      setUpdatingUserId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9FF] px-8 py-8 font-[Poppins]">
      <div className="space-y-7">
        <div>
          <h1 className="text-[36px] sm:text-[42px] font-semibold text-gray-950 tracking-tight leading-tight">
            Mentora Users
          </h1>
          <p className="text-[15px] text-gray-400 mt-2">
            Manage registered nurses and admin access for the Mentora platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard label="Total Users" value={stats.total} icon={UsersIcon} />
          <StatCard
            label="Active Users"
            value={stats.active}
            icon={UserCheck}
            tone="green"
          />
          <StatCard
            label="Disabled Users"
            value={stats.disabled}
            icon={UserX}
            tone="red"
          />
        </div>

        <div className="bg-white rounded-[30px] border border-[#F0EAF7] shadow-[0_12px_35px_rgba(30,20,60,0.04)] overflow-hidden">
          <div className="p-5 border-b border-[#F3EEF8]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-[#F7EAFE] flex items-center justify-center">
                  <Shield size={20} className="text-[#B72AD7]" />
                </div>

                <div>
                  <h2 className="text-[19px] font-semibold text-gray-950">
                    Users List
                  </h2>
                  <p className="text-[13px] text-gray-400">
                    {filtered.length} user{filtered.length === 1 ? "" : "s"} found
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
                  placeholder="Search by ID, email, name..."
                  className="w-full rounded-[18px] border border-[#F0EAF7] bg-[#FCFBFE] py-3 pl-11 pr-4 text-[14px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#E9C8F7] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1030px]">
              <div className="grid grid-cols-[230px_200px_130px_130px_160px_180px] items-center px-6 py-4 text-[13px] font-semibold text-gray-400 border-b border-[#F3EEF8]">
                <div>User Email</div>
                <div>Name</div>
                <div>Role</div>
                <div>Status</div>
                <div>Registered On</div>
                <div className="text-right">Access Control</div>
              </div>

              <div className="p-4 space-y-3">
                {loading && (
                  <div className="rounded-[24px] bg-[#FCFBFE] border border-[#F2EDF8] px-6 py-14 text-center">
                    <Loader2
                      size={28}
                      className="mx-auto mb-3 text-[#B72AD7] animate-spin"
                    />
                    <p className="text-[15px] font-semibold text-gray-700">
                      Loading users...
                    </p>
                  </div>
                )}

                {!loading &&
                  filtered.map((u) => {
                    const isActive = u.status === "Active";
                    const isUpdating = updatingUserId === u.id;

                    return (
                      <div
                        key={u.id}
                        className="grid grid-cols-[230px_200px_130px_130px_160px_180px] items-center rounded-[22px] bg-[#FCFBFE] border border-[#F2EDF8] px-6 py-4 text-[14px] text-gray-700 hover:bg-white hover:shadow-[0_12px_30px_rgba(30,20,60,0.05)] transition-all duration-200"
                      >
                       <div className="leading-tight">
                          <p className="font-semibold text-gray-950 truncate">
                            {u.name}
                          </p>
                        </div>

                        <div className="text-gray-500 truncate">
                          {u.email}
                        </div>

                        <div>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-semibold capitalize ${rolePillClasses(
                              u.role
                            )}`}
                          >
                            {u.role}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-semibold ${statusPillClasses(
                              u.status
                            )}`}
                          >
                            {u.status}
                          </span>
                        </div>

                        <div className="font-medium text-gray-400">
                          {u.registeredOn}
                        </div>

                        <div className="flex justify-end">
                          <div className="flex items-center gap-3">
                            <span className="text-[12px] font-medium text-gray-400">
                              {isActive ? "Deactivate" : "Activate"}
                            </span>

                            <Toggle
                              checked={isActive}
                              disabled={isUpdating}
                              onChange={(next) => toggleUserStatus(u.id, next)}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {!loading && filtered.length === 0 && (
                  <div className="rounded-[24px] bg-[#FCFBFE] border border-[#F2EDF8] px-6 py-14 text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-[#F7EAFE] flex items-center justify-center">
                      <Search size={22} className="text-[#B72AD7]" />
                    </div>

                    <p className="text-[16px] font-semibold text-gray-800">
                      No users found
                    </p>
                    <p className="text-[14px] text-gray-400 mt-1">
                      Try searching with another ID, name, email, role, or status.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}