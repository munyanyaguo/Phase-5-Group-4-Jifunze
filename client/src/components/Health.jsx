export default function Health({ data }) {
  return (
    <div>
      <h2>API Health</h2>
      <p>Status: {data.status || "loading..."}</p>
      <p>Database: {data.database}</p>
    </div>
  );
}
