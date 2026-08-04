import type { PromptAnalysis } from "../../analysis/types/analysis";

interface Props {
  left: PromptAnalysis;
  right: PromptAnalysis;
}

export function VariableComparison({
  left,
  right,
}: Props) {
  const leftNames = left.variables.map(v => v.name);
  const rightNames = right.variables.map(v => v.name);

  const shared = leftNames.filter(name =>
    rightNames.includes(name)
  );

  const onlyLeft = leftNames.filter(name =>
    !rightNames.includes(name)
  );

  const onlyRight = rightNames.filter(name =>
    !leftNames.includes(name)
  );

  return (
    <section className="analysis-card">
      <h3>Variable Comparison</h3>

      <div className="variable-comparison-grid">

        <div>
          <h4>Shared</h4>

          {shared.length === 0 ? (
            <p>None</p>
          ) : (
            <ul>
              {shared.map(variable => (
                <li key={variable}>
                  ✓ {variable}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4>Only in Prompt A</h4>

          {onlyLeft.length === 0 ? (
            <p>None</p>
          ) : (
            <ul>
              {onlyLeft.map(variable => (
                <li key={variable}>
                  − {variable}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4>Only in Prompt B</h4>

          {onlyRight.length === 0 ? (
            <p>None</p>
          ) : (
            <ul>
              {onlyRight.map(variable => (
                <li key={variable}>
                  + {variable}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </section>
  );
}