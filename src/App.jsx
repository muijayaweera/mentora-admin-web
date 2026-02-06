import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import ImageReview from "./pages/ImageReview";
import Users from "./pages/Users";

import AdminLayout from "./layouts/AdminLayout";
import AddCourse from "./pages/courses/AddCourse";
import CourseDetail from "./pages/courses/CourseDetail";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Area */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/new" element={<AddCourse />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/imagereview" element={<ImageReview />} />
          <Route path="/users" element={<Users />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
