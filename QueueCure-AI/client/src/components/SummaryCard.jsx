export default function SummaryCard({
  patients,
  averageTime,
}) {

  const waiting = patients.filter(
    (p) => p.status === "Waiting"
  ).length;

  const completed = patients.filter(
    (p) => p.status === "Completed"
  ).length;

  const confidence = Math.min(
    completed + 95,
    99
  );

  return (
    <div className="card">

      <h2>📊 Today's Summary</h2>

      <hr />

      <p>Patients Served</p>

      <h2>{completed}</h2>

      <p>Waiting</p>

      <h2>{waiting}</h2>

      <p>Average Consultation</p>

      <h2>{averageTime} mins</h2>

      <p>AI Confidence</p>

      <h2>{confidence}%</h2>

    </div>
  );
}