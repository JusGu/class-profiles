import Editor from "@/components/Editor";
import CoopRecruitingSourceCard from "@/components/CoopRecruitingSourceCard";
import CoopLocationMixCard from "@/components/CoopLocationMixCard";
import CoopRoleMixCard from "@/components/CoopRoleMixCard";
import CoopSalaryTrendCard from "@/components/CoopSalaryTrendCard";
import SharedEmployersCard from "@/components/SharedEmployersCard";
import { COOP_METHOD_NOTES } from "@/lib/coop-data";

export default function CoopPage() {
  return (
    <Editor>
      <h1># coop.md</h1>
      <p className="lede">
        This tab compares the co-op data that all three profiles publish
        cleanly: salary progression, latest-role mix, recruiting source,
        location mix, and shared employers.
      </p>

      <div className="question-stack">
        <CoopSalaryTrendCard />
        <CoopRoleMixCard />
        <CoopRecruitingSourceCard />
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
