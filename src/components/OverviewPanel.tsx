import { OVERVIEW_INSIGHTS, SHARED_QUESTION_COUNT } from "@/lib/comparison-data";
import { COOP_COMPARISON_COUNT } from "@/lib/coop-data";

export default function OverviewPanel() {
  return (
    <>
      <h2>## scope</h2>
      <ul>
        <li>{SHARED_QUESTION_COUNT} strict all-three question matches across demographics, academics, and life.</li>
        <li>{COOP_COMPARISON_COUNT} co-op comparisons built from the six term-specific co-op datasets.</li>
        <li>Exact string overlap across all three public surveys is effectively zero, so every comparison here is manually normalized.</li>
      </ul>

      <h2>## quick read</h2>
      <ul>
        {OVERVIEW_INSIGHTS.slice(0, 4).map((insight) => (
          <li key={insight.label}>{insight.detail}</li>
        ))}
      </ul>
    </>
  );
}
