export default function ExplainableAI({
  averageTime,
  waitingCount,
}) {

  const predictedWait = averageTime * waitingCount;

  return (

    <div className="card">

      <h2>🤖 Why this ETA?</h2>

      <hr />

      <p>
        <strong>Current Average Consultation</strong>
      </p>

      <h2>{averageTime} mins</h2>

      <p>
        <strong>Patients Ahead</strong>
      </p>

      <h2>{waitingCount}</h2>

      <p>
        <strong>Predicted Wait</strong>
      </p>

      <h1>{predictedWait} mins</h1>

      <hr />

      <p style={{ color: "#555" }}>

        ✓ Based on live consultation history

        <br />

        ✓ Adaptive AI Learning Enabled

        <br />

        ✓ Updated in real time

      </p>

    </div>

  );

}