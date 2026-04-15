import ChartCard from "@/components/ChartCard";
import Editor from "@/components/Editor";
import { DEMOGRAPHIC_QUESTIONS } from "@/lib/comparison-data";

export default function DemographicsPage() {
  return (
    <Editor>
      <h1># demographics.md</h1>
      <p className="lede">
        These are the cleanest cross-program demographic questions that can be
        normalized without inventing new survey responses. Where a source likely
        preserved overlapping categories, the chart is read as share of
        respondents selecting each bucket rather than a strict 100% composition.
      </p>

      <div className="question-stack">
        {DEMOGRAPHIC_QUESTIONS.map((question) => (
          <ChartCard key={question.id} question={question} />
        ))}
      </div>
    </Editor>
  );
}
