import { useEffect, useState } from "react";
import { fetchSchools, fetchCourses, fetchHealth } from "./api";
import Schools from "./components/Schools";
import Courses from "./components/Courses";
import Health from "./components/Health";

export default function App() {
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [health, setHealth] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [schoolsData, coursesData, healthData] = await Promise.all([
        fetchSchools(),
        fetchCourses(),
        fetchHealth(),
      ]);
      setSchools(schoolsData.schools || []);
      setCourses(coursesData.courses || []);
      setHealth(healthData || {});
      setLoading(false);
    }
    fetchData();
  }, []);
  if (loading) return <p>Loading kindly wait...</p>;

  return (
    <div>
      <h1>Welcome to Jifunze 🎓 learning platform</h1>

      <Health data={health} />
      <Schools schools={schools} />
      <Courses courses={courses} />
    </div>
  );
}
