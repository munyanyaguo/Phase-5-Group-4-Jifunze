// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import OwnerLayout from "./layouts/OwnerLayout";
import EducatorLayout from "./layouts/EducatorLayout";
import StudentLayout from "./layouts/StudentLayout";

// Public pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ResetPassword from "./pages/Auth/ResetPassword";
import LandingPage from "./pages/LandingPage";

// Owner pages
import OwnerDashboard from "./pages/owner/Dashboard";
import Schools from "./pages/owner/Schools";
import OwnerStudents from "./pages/owner/Students";
import Educators from "./pages/owner/Educators";
import ResourcesOwner from "./pages/owner/Resources";
import Reports from "./pages/owner/Reports";
import Users from "./pages/owner/Users";

// Educator pages
import EducatorDashboard from "./pages/educator/Dashboard";
import EducatorStudents from "./pages/educator/Students";
import EducatorResources from "./pages/educator/Resources";
import Attendance from "./pages/educator/Attendance";
import Classes from "./pages/educator/Classes";
import ClassDetails from "./pages/educator/ClassDetails";
import StudentProfile from "./pages/educator/StudentProfile";

// Student pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentResources from "./pages/student/Resources";
import StudentExams from "./pages/student/Exams";
import ExamAttempt from "./pages/student/ExamAttempt";
import StudentResults from "./pages/student/Results";
import ResultDetail from "./pages/student/ResultDetails";

// Utils
import { isAuthenticated, getRole } from "./services/authServices";

// 🔹 PrivateRoute wrapper
const PrivateRoute = ({ children, role }) => {
  let userRole = getRole();


   // normalize backend → frontend
  if (userRole === "manager") {
    userRole = "owner";
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (role && role !== userRole) {
    // role mismatch → redirect to that role’s dashboard
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Owner routes */}
        <Route
          path="/owner/*"
          element={
            <PrivateRoute role="owner">
              <OwnerLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<OwnerDashboard />} />
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="schools" element={<Schools />} />
          <Route path="students" element={<OwnerStudents />} />
          <Route path="educators" element={<Educators />} />
          <Route path="resources" element={<ResourcesOwner />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
        </Route>

        {/* Educator routes */}
        <Route
          path="/educator/*"
          element={
            <PrivateRoute role="educator">
              <EducatorLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<EducatorDashboard />} />
          <Route path="dashboard" element={<EducatorDashboard />} />
          <Route path="students" element={<EducatorStudents />} />
          <Route path="resources" element={<EducatorResources />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="classes" element={<Classes />} />
          <Route path="classes/:id" element={<ClassDetails />} />
          <Route path="students/:id" element={<StudentProfile />} />
        </Route>

        {/* Student routes */}
        <Route
          path="/student/*"
          element={
            <PrivateRoute role="student">
              <StudentLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="resources" element={<StudentResources />} />
          <Route path="exams" element={<StudentExams />} />
          <Route path="exams/:id/attempt" element={<ExamAttempt />} />
          <Route path="results" element={<StudentResults />} />
          <Route path="results/:id" element={<ResultDetail />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
