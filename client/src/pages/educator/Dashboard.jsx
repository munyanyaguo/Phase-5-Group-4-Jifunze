// src/pages/educator/Dashboard.jsx
import React, { useEffect, useState } from "react";
import DashboardCard from "../../components/common/DashboardCard";
import { Users, BookOpen, MessageSquare } from "lucide-react";
import { fetchEducatorCourses } from "../../services/courseService";

export default function EducatorDashboard() {
  const [stats, setStats] = useState({ students: 0, classes: 0, resources: 0, sessions: 0 });
  const API_URL = "http://127.0.0.1:5000/api";

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // 1) Courses assigned to educator
        const coursesRes = await fetchEducatorCourses();
        const courses = Array.isArray(coursesRes?.data) ? coursesRes.data : [];
        const courseIds = courses.map((c) => c.id);

        // 2) Aggregate unique students from enrollments per course
        const enrollmentPromises = courseIds.map(async (courseId) => {
          const res = await fetch(`${API_URL}/enrollments?course_id=${courseId}&page=1&per_page=1`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
          const body = await res.json();
          const total = (res.ok && body.success && body?.data?.meta?.total) ? body.data.meta.total : 0;
          return total;
        });
        const perCourseTotals = await Promise.all(enrollmentPromises);
        const studentsTotal = perCourseTotals.reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0);

        // 3) Count resources across educator's courses using meta.total per course
        const claims = (() => {
          try {
            const payload = token.split(".")[1];
            let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
            const pad = base64.length % 4; if (pad) base64 += "=".repeat(4 - pad);
            return JSON.parse(atob(base64));
          } catch { return {}; }
        })();
        const resourceCountPromises = courseIds.map(async (courseId) => {
          try {
            const rr = await fetch(`${API_URL}/courses/${courseId}/resources?page=1&per_page=1`, {
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            const rb = await rr.json();
            const total = (rr.ok && rb.success && rb?.data?.meta?.total) ? rb.data.meta.total : 0;
            return total;
          } catch {
            return 0;
          }
        });
        const perCourseResourceTotals = await Promise.all(resourceCountPromises);
        const resourcesCount = perCourseResourceTotals.reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0);

        // Unread messages best-effort: teacher's courses messages count (no read state in API yet)
        const unreadApprox = 0;

        setStats({
          students: studentsTotal,
          classes: courses.length,
          resources: resourcesCount,
          sessions: unreadApprox,
        });
      } catch (e) {
        console.error("Failed to load educator dashboard stats", e);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Educator Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard title="Students" value={stats.students} icon={<Users />} />
        <DashboardCard title="Classes" value={stats.classes} icon={<BookOpen />} />
        <DashboardCard title="Resources" value={stats.resources} icon={<BookOpen />} />
        <DashboardCard title="Unread" value={stats.sessions} icon={<MessageSquare />} />
      </div>
    </div>
  );
}
