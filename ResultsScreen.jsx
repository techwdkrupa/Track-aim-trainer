import "./ResultsScreen.css";

function rank(accuracy) {
  if (accuracy >= 85) return "ACE";
  if (accuracy >= 70) return "SHARP";
  if (accuracy >= 50) return "STEADY";
  if (accuracy >= 30) return "DRIFTING";
  return "OFF TARGET";
}

export default function ResultsScreen({ result, onRetry, onReconfigure }) {
  if (!result) return null;
  const { score, accuracy, duration, history } = result;

  return (
    <div className="results-screen">
      <p className="eyebrow">SESSION // COMPLETE</p>
      <h1 className="results-rank">{rank(accuracy)}</h1>

      <div className="results-grid">
        <div className="result-stat">
          <span className="hud-label">Score</span>
          <span className="result-stat__value">{score}</span>
        </div>
        <div className="result-stat">
          <span className="hud-label">Accuracy</span>
          <span className="result-stat__value">{accuracy.toFixed(1)}%</span>
        </div>
        <div className="result-stat">
          <span className="hud-label">Duration</span>
          <span className="result-stat__value">{duration.toFixed(1)}s</span>
        </div>
      </div>

      <div className="results-history">
        <span className="hud-label">Lock over time</span>
        <div className="history-bars">
          {history.length === 0 && (
            <span className="hud-label">No samples recorded</span>
          )}
          {history.map((v, i) => (
            <div
              key={i}
              className="history-bar"
              style={{
                background: v ? "var(--cyan)" : "var(--line-bright)",
                boxShadow: v ? "0 0 6px var(--cyan-glow)" : "none",
              }}
            />
          ))}
        </div>
      </div>

      <div className="results-actions">
        <button className="engage-btn" onClick={onRetry}>
          <span>Retry</span>
        </button>
        <button className="ghost-btn" onClick={onReconfigure}>
          <span>Reconfigure</span>
        </button>
      </div>
    </div>
  );
}
