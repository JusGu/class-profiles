import Editor from "@/components/Editor";
import OverviewPanel from "@/components/OverviewPanel";

export default function OverviewPage() {
  return (
    <Editor>
      <h1># overview.md</h1>
      <p className="lede">
        A conservative comparison of SE 2025, CS 2025, and ECE 2025 using only
        the public question-and-answer data that can be normalized without
        inventing missing survey structure.
      </p>
      <OverviewPanel />
    </Editor>
  );
}
