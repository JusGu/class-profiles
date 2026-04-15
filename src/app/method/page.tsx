import Editor from "@/components/Editor";
import MethodPanel from "@/components/MethodPanel";

export default function MethodPage() {
  return (
    <Editor>
      <h1># method.md</h1>
      <p className="lede">
        What was matched, what was excluded, and where the normalization stops.
      </p>
      <MethodPanel />
    </Editor>
  );
}
