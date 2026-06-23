export default function AILearningCard({ learning }) {
  return (
    <div className="card">

      <h2>🤖 AI Engine</h2>

      {learning ? (

        <h1>Learning...</h1>

      ) : (

        <h1>Ready ✅</h1>

      )}

      <p>

        Adaptive ETA Prediction

      </p>

    </div>
  );
}