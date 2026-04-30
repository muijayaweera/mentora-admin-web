import { LayoutDashboard, BookOpen, Image, Users, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function Sidebar() {
  const navigate = useNavigate();

  const items = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Courses", icon: BookOpen, path: "/courses" },
    { name: "Image Review", icon: Image, path: "/imagereview" },
    { name: "Users", icon: Users, path: "/users" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[270px] bg-[#FBFAFF] border-r border-[#EEE7F8] flex flex-col px-6 py-8 z-40">
      {/* Logo */}
      <div className="mb-12">
        <h1 className="text-[30px] leading-none font-semibold tracking-tight text-[#C026D3]">
          mentora.
        </h1>
        <p className="text-[13px] text-gray-400 mt-2">
          Admin Management
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2">
        {items.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={name}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              [
                "no-underline flex items-center gap-3 px-4 py-3 rounded-2xl text-[15px] font-medium transition-all duration-200",
                isActive
                  ? "bg-white text-[#A21CAF] shadow-[0_10px_30px_rgba(168,85,247,0.10)] border border-[#F0E4FF]"
                  : "text-gray-500 hover:text-[#A21CAF] hover:bg-white/70",
              ].join(" ")
            }
          >
            <Icon size={19} strokeWidth={2} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-6 border-t border-[#EEE7F8]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-white hover:text-red-500 transition-all duration-200"
        >
          <LogOut size={19} strokeWidth={2} />
          <span className="text-[15px] font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
}