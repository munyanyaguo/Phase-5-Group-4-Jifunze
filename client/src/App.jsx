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
import Students from "./pages/SchoolOwner/Students";
import Resources from "./pages/SchoolOwner/Resources";
import Educators from "./pages/SchoolOwner/Educators";

// Educator Pages
import Classes from "./pages/Educator/Classes";
import MyStudents from "./pages/Educator/Students";
import EducatorResources from "./pages/Educator/Resources";


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
          <Route path="students" element={<Students />} />
          <Route path="resources" element={<Resources />} />
          <Route path="educators" element={<Educators />} />
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
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
