import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Layout() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="ml-[290px] w-full min-h-screen bg-[#FAF8FF]">
        <Outlet />
      </main>
    </div>
  );
}