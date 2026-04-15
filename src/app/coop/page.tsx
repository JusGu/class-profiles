import Editor from "@/components/Editor";
import CoopLocationMixCard from "@/components/CoopLocationMixCard";
import CoopSalaryTrendCard from "@/components/CoopSalaryTrendCard";
import SharedEmployersCard from "@/components/SharedEmployersCard";
import { COOP_METHOD_NOTES } from "@/lib/coop-data";

export default function CoopPage() {
  return (
    <Editor>
      <h1># coop.md</h1>
      <p className="lede">
        This tab compares co-op outcomes using the data all three profiles
        actually publish well: salary progression by co-op number, overall
        location mix, and the employers that show up across all three cohorts.
      </p>
      <p className="lede">
        The main source fix here is on the SE side. Its co-op distributions live
        in a separate `coop.json` file, so the earlier extraction understated
        what was available.
      </p>

      <div className="question-stack">
        <CoopSalaryTrendCard />
        <CoopLocationMixCard />
        <SharedEmployersCard />
      </div>

      <h2>## coop notes</h2>
      <ul>
        {COOP_METHOD_NOTES.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </Editor>
  );
}
