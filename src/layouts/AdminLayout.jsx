import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#F7F7FB]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#F7F7FB] px-12 py-8">
        {/* wider than max-w-6xl so it fills screen like your design */}
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
