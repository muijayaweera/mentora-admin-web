import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: "220px", background: "#1e293b", color: "#fff", padding: "20px" }}>
        <h3>Mentora Admin</h3>
        <nav>
          <p><Link to="/" style={{ color: "#fff" }}>Dashboard</Link></p>
          <p><Link to="/courses" style={{ color: "#fff" }}>Courses</Link></p>
          <p><Link to="/images" style={{ color: "#fff" }}>Image Review</Link></p>
          <p><Link to="/users" style={{ color: "#fff" }}>Users</Link></p>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: "20px" }}>
        {children}
      </main>
    </div>
  );
}
