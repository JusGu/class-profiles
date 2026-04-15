import ChartCard from "@/components/ChartCard";
import Editor from "@/components/Editor";
import { LIFE_QUESTIONS } from "@/lib/comparison-data";

export default function LifePage() {
  return (
    <Editor>
      <h1># life.md</h1>
      <p className="lede">
        Non-academic comparisons stay narrow here: only questions with a real
        published distribution in all three profiles make it in.
      </p>

      <div className="question-stack">
        {LIFE_QUESTIONS.map((question) => (
          <ChartCard key={question.id} question={question} />
        ))}
      </div>
    </Editor>
  );
}
