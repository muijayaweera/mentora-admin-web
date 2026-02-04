import { Circle, Users, BookOpen, Image as ImageIcon, Clock } from "lucide-react";

function StatCard({ title, value, Icon }) {
  return (
    <div className="bg-white rounded-2xl px-6 py-5 border border-black/5 shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[15px] text-gray-400 mb-3">{title}</p>
          <h3 className="text-2xl font-semibold text-[#1F1F1F]">{value}</h3>
        </div>
        <Icon size={22} className="text-black/60 mt-1" />
      </div>
    </div>
  );
}

function Card({ title, right, children }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-md">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[16px] font-semibold text-black/40">{title}</p>
        {right}
      </div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const cards = [
    { title: "Total Users", value: "102 Users", icon: Users },
    { title: "Total Courses", value: "6 Courses", icon: BookOpen },
    { title: "Total Images", value: "212 Images", icon: ImageIcon },
    { title: "Pending Reviews", value: "17 Pending", icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Header (top-right) */}
      <div className="flex items-center justify-end gap-3">
        <Circle className="text-[#8B5CF6]" size={34} />
        <h2 className="text-4xl font-semibold text-[#1F1F1F]">
          Admin Dashboard
        </h2>
      </div>

      {/* 12-col grid wrapper */}
      <div className="grid grid-cols-12 gap-6">
        {/* Row 1: 4 summary cards (each 3 cols) */}
        {cards.map((c) => (
          <div key={c.title} className="col-span-12 sm:col-span-6 lg:col-span-3">
            <StatCard title={c.title} value={c.value} Icon={c.icon} />
          </div>
        ))}

        {/* Row 2: Image status (7 cols) + User activity (5 cols) */}
        <div className="col-span-12 lg:col-span-7">
          <Card
            title="Image Recognition Status"
            right={
              <span className="text-green-600 font-medium text-[15px]">
                Last Model Update: Jan 2026
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-6 text-[15px]">
              <p className="text-black/70 leading-relaxed">
                Reviewed Images:{" "}
                <span className="font-semibold text-black">325</span>
              </p>
              <p className="text-black/70 leading-relaxed">
                Pending Review:{" "}
                <span className="font-semibold text-black">17</span>
              </p>
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <Card title="User Activity">
            <div className="grid grid-cols-2 gap-8 text-[15px]">
              <p className="text-black/70 leading-relaxed">
                New users this month:{" "}
                <span className="font-semibold text-black">14</span>
              </p>
              <p className="text-black/70 leading-relaxed">
                Active Users:{" "}
                <span className="font-semibold text-black">03</span>
              </p>
            </div>
          </Card>
        </div>

        {/* Row 3: One wide course activity card (full width) */}
        <div className="col-span-12">
          <Card
            title="Course Activity Overview"
            right={
              <span className="text-[15px]">
                <span className="text-green-600 font-semibold">
                  Latest Course Update:
                </span>{" "}
                <span className="text-gray-400 font-medium">02 Days Ago</span>
              </span>
            }
          >
            {/* Align items to a clean 12-col rhythm */}
            <div className="grid grid-cols-12 items-center gap-4 text-[15px]">
              <div className="col-span-12 md:col-span-3 text-black/70">
                Total courses:{" "}
                <span className="font-semibold text-black">08</span>
              </div>

              <div className="col-span-12 md:col-span-3 text-black/70">
                Total modules:{" "}
                <span className="font-semibold text-black">15</span>
              </div>

              <div className="col-span-12 md:col-span-6 flex items-center justify-between text-black/70">
                <span>Ostomy Care Basics</span>
                <span className="text-black/25 mx-4">|</span>
                <span>
                  <span className="font-semibold text-black">04</span> Modules
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
