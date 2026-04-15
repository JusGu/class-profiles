import ChartCard from "@/components/ChartCard";
import Editor from "@/components/Editor";
import { DEMOGRAPHIC_QUESTIONS } from "@/lib/comparison-data";

export default function DemographicsPage() {
  return (
    <Editor>
      <h1># demographics.md</h1>
      <p className="lede">
        The cleanest demographic matches across all three profiles. Overlapping
        identity questions stay in grouped view; clean partitions use 100%
        stacked bars.
      </p>

      <div className="question-stack">
        {DEMOGRAPHIC_QUESTIONS.map((question) => (
          <ChartCard key={question.id} question={question} />
        ))}
      </div>
    </Editor>
  );
}
