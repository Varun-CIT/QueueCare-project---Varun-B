export default function AnalyticsCard({
  patients,
  averageTime
}) {

  const waiting = patients.filter(
    p => p.status === "Waiting"
  ).length;

  const completed = patients.filter(
    p => p.status === "Completed"
  ).length;

  let load = "🟢 Low";

  if (waiting >= 4 && waiting <= 7) {
    load = "🟡 Moderate";
  }

  if (waiting > 7) {
    load = "🔴 High";
  }

  const confidence = Math.min(
    95 + completed,
    99
  );

  return (

    <div className="card">

      <h2>📊 Clinic Analytics</h2>

      <hr />

      <p>Patients Served Today</p>

      <h1>{completed}</h1>

      <br />

      <p>Average Consultation</p>

      <h3>{averageTime} mins</h3>

      <br />

      <p>Doctor Load</p>

      <h3>{load}</h3>

      <br />

      <p>AI Confidence</p>

      <h3>{confidence}%</h3>

    </div>

  );

}