import Editor from "@/components/Editor";
import MethodPanel from "@/components/MethodPanel";

export default function MethodPage() {
  return (
    <Editor>
      <h1># method.md</h1>
      <p className="lede">
        This page documents what was actually matched, what was omitted, and why.
        The point is to keep the comparison defensible rather than squeeze every
        vaguely similar prompt into the same chart.
      </p>
      <MethodPanel />
    </Editor>
  );
}
