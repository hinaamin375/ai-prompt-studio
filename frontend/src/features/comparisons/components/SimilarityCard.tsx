interface SimilarityCardProps {
  similarity: number;
}

export function SimilarityCard({
  similarity,
}: SimilarityCardProps) {
  return (
    <section className="analysis-card">
      <h3>Prompt Similarity</h3>

      <div className="similarity-score">
        {similarity.toFixed(1)}%
      </div>

      <div className="similarity-bar">
        <div
          className="similarity-fill"
          style={{
            width: `${similarity}%`,
          }}
        />
      </div>

      <p className="similarity-text">
        These rendered prompts are{" "}
        <strong>{similarity.toFixed(1)}%</strong>{" "}
        similar.
      </p>
    </section>
  );
}