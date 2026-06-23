export default function QueueItem({ patient }) {
  let badge = "🔵 Waiting";

  if (patient.status === "Consulting") {
    badge = "🟢 Consulting";
  }

  if (patient.status === "Completed") {
    badge = "⚫ Completed";
  }

  return (
    <div className="queue-item">
      <div>
        <h3>{patient.token}</h3>

        <p>{patient.name}</p>
      </div>

      <div>
        <strong>{badge}</strong>

        <br />

        ETA : {patient.estimatedWait} mins
      </div>
    </div>
  );
}