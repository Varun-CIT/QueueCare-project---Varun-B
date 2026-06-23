export default function AIInsightCard({
  averageTime,
  waitingCount,
}) {

  const confidence = Math.min(
    95 + waitingCount,
    99
  );

  let doctorLoad = "🟢 Low";

  if (waitingCount >= 4 && waitingCount <= 7) {
    doctorLoad = "🟡 Moderate";
  }

  if (waitingCount > 7) {
    doctorLoad = "🔴 High";
  }

  return (
    <div className="card">

      <h2>🤖 Queue Intelligence</h2>

      <hr />

      <p>
        <strong>Adaptive Learning</strong>
      </p>

      <p>✅ Enabled</p>

      <br />

      <p>
        Average Consultation
      </p>

      <h1>{averageTime} mins</h1>

      <br />

      <p>
        Prediction Confidence
      </p>

      <h3>{confidence}%</h3>

      <br />

      <p>
        Doctor Load
      </p>

      <h3>{doctorLoad}</h3>

    </div>
  );
}