import ChartCard from "@/components/ChartCard";
import Editor from "@/components/Editor";
import { ACADEMIC_QUESTIONS } from "@/lib/comparison-data";

export default function AcademicsPage() {
  return (
    <Editor>
      <h1># academics.md</h1>
      <p className="lede">
        The academic questions are normalized into common ranges so all three
        programs can be plotted on the same axis. For SE and ECE, raw numeric
        values were rebucketed; for CS, the published distributions were mapped
        into the closest equivalent bands.
      </p>

      <div className="question-stack">
        {ACADEMIC_QUESTIONS.map((question) => (
          <ChartCard key={question.id} question={question} />
        ))}
      </div>
    </Editor>
  );
}
