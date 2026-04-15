import Editor from "@/components/Editor";
import OverviewPanel from "@/components/OverviewPanel";

export default function OverviewPage() {
  return (
    <Editor>
      <h1># overview.md</h1>
      <p className="lede">
        This site compares the question-and-answer pairs that can be matched
        across three Waterloo class profiles: SE 2025, CS 2025, and ECE 2025.
        The exact string overlap across the three sources is effectively zero,
        so the comparison layer uses a conservative semantic mapping instead of
        pretending the surveys were identical.
      </p>
      <p className="lede">
        The charts focus on respondent share rather than raw counts. That makes
        the cohort composition easier to compare even when each profile has a
        different sample size and a slightly different public data format. The
        matched set spans demographics, academics, and a small life /
        wellbeing slice where the public charts line up cleanly.
      </p>
      <OverviewPanel />
    </Editor>
  );
}
