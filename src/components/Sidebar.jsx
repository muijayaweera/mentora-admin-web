import { LayoutDashboard, BookOpen, Image, Users, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const items = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Courses", icon: BookOpen, path: "/courses" },
    { name: "Image Review", icon: Image, path: "/imagereview" },
    { name: "Users", icon: Users, path: "/users" },
  ];

  return (
    <aside className="h-screen w-[290px] bg-gradient-to-b from-[#D393E8] to-[#CA9DF2] flex flex-col px-6 py-8">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-[#C613C1] to-[#902FED] bg-clip-text text-transparent">
          mentora.
        </h1>
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
                "group no-underline relative",
                "flex items-center gap-4",
                "px-5 py-3 rounded-xl",
                "text-[18px] font-medium",
                "transition",
                isActive
                  ? "bg-white/35 text-[#1F1F1F]"
                  : "text-[#2E2E2E] hover:bg-white/25",
              ].join(" ")
            }
          >
            {/* left indicator bar */}
            <span className="absolute left-0 top-2 bottom-2 w-[4px] rounded-full bg-[#8B5CF6] opacity-0 group-[.active]:opacity-100" />

            <Icon size={22} className="opacity-80" />
            <span className="tracking-wide">{name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Logout (slightly higher + modern) */}
      <button className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl text-[#2E2E2E] hover:bg-white/25 transition">
        <LogOut size={20} className="opacity-80" />
        <span className="text-[16px] font-medium">Log Out</span>
      </button>
    </aside>
  );
}
