import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Landing Page
import LandingPage from "./pages/LandingPage";

// Layouts
import OwnerLayout from "./layouts/OwnerLayout";
import EducatorLayout from "./layouts/EducatorLayout";
import StudentLayout from "./layouts/StudentLayout";

// Auth Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ResetPassword from "./pages/Auth/ResetPassword";

// Dashboards
import OwnerDashboard from "./pages/SchoolOwner/Dashboard";
import EducatorDashboard from "./pages/Educator/Dashboard";
import StudentDashboard from "./pages/Student/Dashboard";

// Owner Pages 
import Schools from "./pages/SchoolOwner/Schools";
import StudentsPage from "./pages/SchoolOwner/Students";
import Resources from "./pages/SchoolOwner/Resources";
import Educators from "./pages/SchoolOwner/Educators";
import Attendance from "./pages/SchoolOwner/Attendance";

// Educator Pages
import Classes from "./pages/Educator/Classes";
import MyStudents from "./pages/Educator/Students";
import EducatorResources from "./pages/Educator/Resources";

// Student Pages
import StudentResources from "./pages/student/Resources";
import StudentExams from "./pages/student/Exams";
import ExamAttempt from "./pages/student/ExamAttempt";
import StudentResults from "./pages/student/Results";
import ResultDetail from "./pages/student/ResultDetail";




// Utils
import { getRole } from "./services/authServices";

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = getRole();

  if (!token) return <Navigate to="/login" />;
  if (role && role !== userRole) return <Navigate to="/login" />;

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* School Owner Routes */}
        <Route
          path="/owner/*"
          element={
            <PrivateRoute role="owner">
              <OwnerLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="schools" element={<Schools />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="resources" element={<Resources />} />
          <Route path="educators" element={<Educators />} />
          <Route path ="attendance" element={<Attendance />} />
        </Route>

        {/* Educator Routes */}
        <Route
          path="/educator/*"
          element={
            <PrivateRoute role="educator">
              <EducatorLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<EducatorDashboard />} />
          <Route path="classes" element={<Classes />} />
          <Route path="students" element={<MyStudents />} />
          <Route path="resources" element={<EducatorResources />} />
        </Route>

        {/* Student Routes */}
        <Route
          path="/student/*"
          element={
            <PrivateRoute role="student">
              <StudentLayout />
            </PrivateRoute>
          }
        >
          
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="resources" element={<StudentResources />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="exams/:id/attempt" element={<ExamAttempt />} />
            <Route path="results" element={<StudentResults />} />
            <Route path="results/:id" element={<ResultDetail />} />


        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
