// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layouts - Load immediately (needed for structure)
import OwnerLayout from "./layouts/OwnerLayout";
import EducatorLayout from "./layouts/EducatorLayout";
import StudentLayout from "./layouts/StudentLayout";

// Public pages - Load immediately (first interaction)
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import LandingPage from "./pages/LandingPage";

// Lazy load other pages for code splitting
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));

// Owner pages - Lazy loaded
const OwnerDashboard = lazy(() => import(/* webpackPrefetch: true */ "./pages/owner/Dashboard"));
const Schools = lazy(() => import("./pages/owner/Schools"));
const OwnerStudents = lazy(() => import("./pages/owner/Students"));
const Educators = lazy(() => import("./pages/owner/Educators"));
const Reports = lazy(() => import("./pages/owner/Reports"));
const Users = lazy(() => import("./pages/owner/Users"));
const ManagerCourses = lazy(() => import("./pages/owner/Courses"));
const Enrollments = lazy(() => import("./pages/owner/Enrollment"));
const OwnerProfile = lazy(() => import("./pages/owner/Profile"));

// Educator pages - Lazy loaded with preloading hints
const EducatorDashboard = lazy(() => import(/* webpackPrefetch: true */ "./pages/educator/Dashboard"));
const EducatorStudents = lazy(() => import("./pages/educator/Students"));
const EducatorResources = lazy(() => import("./pages/educator/Resources"));
const Attendance = lazy(() => import("./pages/educator/Attendance"));
const Classes = lazy(() => import(/* webpackPrefetch: true */ "./pages/educator/Courses"));
const ClassDetails = lazy(() => import("./pages/educator/CourseDetails"));
const StudentProfile = lazy(() => import("./pages/educator/StudentProfile"));
const EducatorMessages = lazy(() => import(/* webpackPrefetch: true */ "./pages/educator/Messages"));
const EducatorProfile = lazy(() => import("./pages/educator/Profile"));
const ChangePassword = lazy(() => import("./pages/educator/ChangePassword"));

// Student pages - Lazy loaded
const StudentDashboard = lazy(() => import("./pages/Student/StudentDashboard"));
const StudentCourses = lazy(() => import("./pages/Student/StudentCourses"));
const StudentResources = lazy(() => import("./pages/Student/StudentResources"));
const StudentEnrollments = lazy(() => import("./pages/Student/StudentEnrollments"));
const StudentAttendance = lazy(() => import("./pages/Student/StudentAttendance"));
const StudentMessages = lazy(() => import("./pages/Student/StudentMessages"));

// Utils
import { isAuthenticated, getRole } from "./services/authServices";
import { PageSkeleton } from "./components/common/SkeletonLoader";

// Loading fallback component
const PageLoader = () => <PageSkeleton />;

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
      <Suspense fallback={<PageLoader />}>
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
          {/* <Route path="resources" element={<ResourcesOwner />} /> */}
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="courses" element={<ManagerCourses />} />
          <Route path="enrollments" element={<Enrollments />} />
          <Route path="profile" element={<OwnerProfile />} />
       
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
          {/* Classes (primary) */}
          <Route path="classes" element={<Classes />} />
          <Route path="classes/:id" element={<ClassDetails />} />
          {/* Courses alias to support sidebar links */}
          <Route path="courses" element={<Classes />} />
          <Route path="courses/:id" element={<ClassDetails />} />
          {/* Messages */}
          <Route path="messages" element={<EducatorMessages />} />
          <Route path="students/:id" element={<StudentProfile />} />
          {/* Profile & Settings */}
          <Route path="profile" element={<EducatorProfile />} />
          <Route path="settings" element={<EducatorProfile />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        {/* Student routes (NEW) */}
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
          <Route path="courses" element={<StudentCourses />} />
          <Route path="resources" element={<StudentResources />} />
          <Route path="enrollments" element={<StudentEnrollments />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="messages" element={<StudentMessages />} />
        </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
