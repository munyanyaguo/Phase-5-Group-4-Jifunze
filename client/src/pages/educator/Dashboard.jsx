// src/pages/educator/Dashboard.jsx
import React, { useEffect, useState } from "react";
import DashboardCard from "../../components/common/DashboardCard";
import { Users, BookOpen, Video } from "lucide-react";
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
          const res = await fetch(`${API_URL}/enrollments?course_id=${courseId}&per_page=1000`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
          const body = await res.json();
          const items = res.ok && body.success ? (body?.data?.enrollments || []) : [];
          return items.map((e) => e.user_public_id || e?.user?.public_id).filter(Boolean);
        });
        const enrolled = (await Promise.all(enrollmentPromises)).flat();
        const uniqueStudents = new Set(enrolled);

        // 3) Count resources uploaded by this educator or in their courses
        // We’ll count all resources and then filter client-side
        const resResources = await fetch(`${API_URL}/resources?per_page=1000`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const resBody = await resResources.json();
        const allResources = resResources.ok && resBody.success ? (resBody?.data?.resources || []) : [];

        const claims = (() => {
          try {
            const payload = token.split(".")[1];
            let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
            const pad = base64.length % 4; if (pad) base64 += "=".repeat(4 - pad);
            return JSON.parse(atob(base64));
          } catch { return {}; }
        })();
        const educatorPublicId = claims?.sub;

        const resourcesCount = allResources.filter((r) => {
          if (educatorPublicId && r.uploaded_by_public_id) return r.uploaded_by_public_id === educatorPublicId;
          if (courseIds.length && typeof r.course_id !== 'undefined') return courseIds.includes(r.course_id);
          return false;
        }).length;

        setStats({
          students: uniqueStudents.size,
          classes: courses.length,
          resources: resourcesCount,
          sessions: 0,
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
        <DashboardCard title="Sessions" value={stats.sessions} icon={<Video />} />
      </div>
    </div>
  );
}
