import ChartCard from "@/components/ChartCard";
import Editor from "@/components/Editor";
import { ACADEMIC_QUESTIONS } from "@/lib/comparison-data";

export default function AcademicsPage() {
  return (
    <Editor>
      <h1># academics.md</h1>
      <p className="lede">
        Academic comparisons rebucket the published answers into common ranges
        so the three programs can sit on the same scale.
      </p>

      <div className="question-stack">
        {ACADEMIC_QUESTIONS.map((question) => (
          <ChartCard key={question.id} question={question} />
        ))}
      </div>
    </Editor>
  );
}
