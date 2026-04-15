import {
  COMPARABLE_QUESTIONS,
  EXCLUDED_COMPARISONS,
  METHOD_NOTES,
} from "@/lib/comparison-data";
import { PROFILE_META } from "@/lib/types";

export default function MethodPanel() {
  return (
    <>
      <h2>## method notes</h2>
      <ul>
        {METHOD_NOTES.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>

      <h2>## excluded on purpose</h2>
      <ul>
        {EXCLUDED_COMPARISONS.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>

      <h2>## source coverage</h2>
      <div className="mapping-table">
        <div className="mapping-row mapping-head">
          <span>Shared question</span>
          {PROFILE_META.map((profile) => (
            <span key={profile.id}>{profile.shortLabel}</span>
          ))}
        </div>
        {COMPARABLE_QUESTIONS.map((question) => (
          <div key={question.id} className="mapping-row">
            <span>{question.title}</span>
            <span>{question.sourceQuestions.se_2025}</span>
            <span>{question.sourceQuestions.cs_2025}</span>
            <span>{question.sourceQuestions.ece_2025}</span>
          </div>
        ))}
      </div>
    </>
  );
}
