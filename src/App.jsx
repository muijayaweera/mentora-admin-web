import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import ImageReview from "./pages/ImageReview";
import Users from "./pages/Users";
import AdminLayout from "./layouts/AdminLayout";
import AddCourse from "./pages/courses/AddCourse";

function App() {
  const isAuthenticated = true; // temporary

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {isAuthenticated ? (
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/imagereview" element={<ImageReview />} />
            <Route path="/users" element={<Users />} />
            <Route path="/courses/new" element={<AddCourse />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
