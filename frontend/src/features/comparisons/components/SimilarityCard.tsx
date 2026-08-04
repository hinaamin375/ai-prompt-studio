interface SimilarityCardProps {
  similarity: number;
}

export function SimilarityCard({
  similarity,
}: SimilarityCardProps) {
  let label = "Very Different";
  let className = "similarity-low";

  if (similarity >= 90) {
    label = "Nearly Identical";
    className = "similarity-excellent";
  } else if (similarity >= 75) {
    label = "Very Similar";
    className = "similarity-good";
  } else if (similarity >= 50) {
    label = "Moderately Similar";
    className = "similarity-medium";
  } else if (similarity >= 25) {
    label = "Different";
    className = "similarity-low";
  }

  return (
    <section className="analysis-card">
      <h3>Prompt Similarity</h3>

      <div className={`similarity-score ${className}`}>
        {similarity.toFixed(1)}%
      </div>

      <div className="similarity-bar">
        <div
          className={`similarity-fill ${className}`}
          style={{
            width: `${similarity}%`,
          }}
        />
      </div>

      <div className="similarity-label">
        {label}
      </div>

      <p className="similarity-text">
        These rendered prompts are{" "}
        <strong>{similarity.toFixed(1)}%</strong>{" "}
        similar.
      </p>
    </section>
  );
}