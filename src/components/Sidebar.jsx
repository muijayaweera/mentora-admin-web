import { LayoutDashboard, BookOpen, Image, Users, LogOut } from "lucide-react";

export default function Sidebar({ active = "Dashboard" }) {
  const items = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Courses", icon: BookOpen },
    { name: "Image Review", icon: Image },
    { name: "Users", icon: Users },
  ];

  return (
    <aside className="h-screen w-64 bg-gradient-to-b from-[#EED7FF] to-[#D9B6FF] font-['Poppins'] flex flex-col justify-between">
      <div>
        {/* Logo */}
        <div className="px-8 pt-8 pb-10">
          <h1 className="text-3xl font-medium text-[#B24BF3] tracking-wide">mentora.</h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 px-4">
          {items.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition \
                ${active === name 
                  ? "bg-[#C084FC] text-white shadow" 
                  : "text-[#2E2E2E] hover:bg-white/40"}`}
            >
              <Icon size={20} />
              <span className="text-base">{name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <div className="px-6 pb-8">
        <button className="flex items-center gap-3 text-[#2E2E2E] hover:text-black">
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

/*
Make sure Poppins is loaded globally:
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
*/
