export default function Schools({ schools }) {
  return (
    <div>
      <h2>Schools</h2>
      <ul>
        {schools.map(s => (
          <li key={s.id}>{s.name} - Students: {s.students}</li>
        ))}
      </ul>
    </div>
  );
}
