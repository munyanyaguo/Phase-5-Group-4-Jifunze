import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, ArrowLeft, BarChart3, Calendar } from "lucide-react";

const API_URL = "http://127.0.0.1:5000/api";

export default function StudentProfile() {
  const { id } = useParams(); // student's public_id
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Not authenticated. Please log in.");
          return;
        }

        // 1) Fetch enrollments for this student (provides nested user and course info)
        const enrRes = await fetch(`${API_URL}/enrollments?user_public_id=${encodeURIComponent(id)}&per_page=1000`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const enrBody = await enrRes.json();
        if (!enrRes.ok || !enrBody.success) {
          throw new Error(enrBody.message || "Failed to load enrollments");
        }
        const enrItems = enrBody?.data?.enrollments || [];
        setEnrollments(enrItems);
        const userFromEnroll = enrItems[0]?.user;

        // 2) Fetch attendance for this student
        const attRes = await fetch(`${API_URL}/attendance?user_id=${encodeURIComponent(id)}&per_page=1000`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const attBody = await attRes.json();
        if (attRes.ok && attBody.success) {
          setAttendance(attBody?.data?.items || []);
        } else {
          setAttendance([]);
        }

        // 3) Build student summary
        if (userFromEnroll) {
          setStudent({
            public_id: userFromEnroll.public_id,
            name: userFromEnroll.name,
            email: userFromEnroll.email,
          });
        } else {
          setStudent({ public_id: id, name: "Student", email: "" });
        }
      } catch (e) {
        console.error("Failed to load student profile:", e);
        setError(e.message || "Failed to load student profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const attendanceStats = useMemo(() => {
    const stats = { present: 0, absent: 0, late: 0, total: 0 };
    for (const rec of attendance) {
      if (rec?.status === "present") stats.present += 1;
      else if (rec?.status === "absent") stats.absent += 1;
      else if (rec?.status === "late") stats.late += 1;
      stats.total += 1;
    }
    return stats;
  }, [attendance]);

  if (loading) {
    return <p className="p-6 text-gray-600">Loading...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  if (!student) {
    return <p className="p-6 text-red-500">Student not found.</p>;
  }

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:underline mb-6"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Students
      </button>

      {/* Student Info */}
      <motion.div
        className="p-6 rounded-2xl shadow-md bg-white mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
          <User className="w-6 h-6 text-blue-600" />
          {student.name}
        </h1>
        <p className="text-gray-600 flex items-center gap-2">
          <Mail className="w-5 h-5" /> {student.email}
        </p>
        <p className={`mt-2 font-medium text-green-600`}>Active</p>
      </motion.div>

      {/* Attendance */}
      <motion.div
        className="p-6 rounded-2xl shadow-md bg-white mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-green-600" />
          Attendance
        </h2>
        <p className="text-gray-700">Present: <span className="font-bold">{attendanceStats.present}</span></p>
        <p className="text-gray-700">Late: <span className="font-bold">{attendanceStats.late}</span></p>
        <p className="text-gray-700">Absent: <span className="font-bold">{attendanceStats.absent}</span></p>
        <p className="text-gray-700">Total: <span className="font-bold">{attendanceStats.total}</span></p>
      </motion.div>

      {/* Enrollments */}
      <motion.div
        className="p-6 rounded-2xl shadow-md bg-white"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Enrollments
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Course</th>
                <th className="p-3">Description</th>
                <th className="p-3">Enrolled On</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enr) => (
                <tr key={enr.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{enr?.course?.title || enr.course_id}</td>
                  <td className="p-3">{enr?.course?.description || ""}</td>
                  <td className="p-3">{new Date(enr?.created_at || enr?.date_enrolled || Date.now()).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
