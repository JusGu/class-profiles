import ChartCard from "@/components/ChartCard";
import Editor from "@/components/Editor";
import { LIFE_QUESTIONS } from "@/lib/comparison-data";

export default function LifePage() {
  return (
    <Editor>
      <h1># life.md</h1>
      <p className="lede">
        This tab keeps the non-academic comparisons narrow: only questions with
        genuinely chartable distributions in all three public profiles make it
        in. The goal is to compare real published answers, not interpolate the
        gaps.
      </p>

      <div className="question-stack">
        {LIFE_QUESTIONS.map((question) => (
          <ChartCard key={question.id} question={question} />
        ))}
      </div>
    </Editor>
  );
}
