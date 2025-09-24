export default function Courses({ courses }) {
  return (
    <div>
      <h2>Courses</h2>
      <ul>
        {courses.map(c => (
          <li key={c.id}>{c.title} - Educator: {c.educator}</li>
        ))}
      </ul>
    </div>
  );
}
