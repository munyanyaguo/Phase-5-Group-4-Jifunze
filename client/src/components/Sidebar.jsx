export default function Sidebar({ role }) {
  const links = {
    owner: ["Dashboard", "School Management", "Users", "Reports"],
    educator: ["Dashboard", "Attendance", "Resources", "Exams"],
    student: ["Dashboard", "Resources", "Attendance", "Exams"],
  };

  return (
    <aside className="w-64 bg-white shadow-md p-4">
      <h2 className="text-xl font-bold text-blue-600 mb-6">Jifunze</h2>
      <ul className="space-y-3">
        {links[role].map((link, i) => (
          <li key={i} className="text-gray-700 hover:text-blue-600 cursor-pointer">
            {link}
          </li>
        ))}
      </ul>
    </aside>
  );
}
