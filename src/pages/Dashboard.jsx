import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar active="Dashboard" />
      <main className="flex-1 p-8">

     <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
      </div>

      {/* Summary Cards */}
      <div className="card-grid">
        <div className="card">
          <p className="card-title">Total Users</p>
          <h3>102 Users</h3>
        </div>

        <div className="card">
          <p className="card-title">Total Courses</p>
          <h3>6 Courses</h3>
        </div>

        <div className="card">
          <p className="card-title">Total Images</p>
          <h3>212 Images</h3>
        </div>

        <div className="card">
          <p className="card-title">Pending Reviews</p>
          <h3>17 Pending</h3>
        </div>
      </div>

      {/* Image Recognition Status */}
      <div className="section">
        <h4>Image Recognition Status</h4>
        <div className="section-row">
          <p>Reviewed Images: <strong>325</strong></p>
          <p>Pending Review: <strong>17</strong></p>
          <p className="highlight">Last Model Update: Jan 2026</p>
        </div>
      </div>

      {/* Course Activity */}
      <div className="section-grid">
        <div className="section">
          <h4>Course Activity Overview</h4>
          <p>Total Courses: <strong>08</strong></p>
          <p>Total Modules: <strong>15</strong></p>
        </div>

        <div className="section">
          <h4 className="highlight">Latest Course Update</h4>
          <p><strong>Ostomy Care Basics</strong></p>
          <p>04 Modules</p>
          <p className="muted">02 Days Ago</p>
        </div>
      </div>

      {/* User Activity */}
      <div className="section">
        <h4>User Activity</h4>
        <div className="section-row">
          <p>New users this month: <strong>14</strong></p>
          <p>Active Users: <strong>03</strong></p>
        </div>
      </div>
    </div>
     </main>
    </div>
  );
}
