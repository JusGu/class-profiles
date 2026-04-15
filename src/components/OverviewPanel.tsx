import { OVERVIEW_INSIGHTS, SHARED_QUESTION_COUNT } from "@/lib/comparison-data";
import { PROFILE_META } from "@/lib/types";

export default function OverviewPanel() {
  return (
    <>
      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">Profiles</span>
          <strong>3</strong>
          <p>SE 2025, CS 2025, and ECE 2025.</p>
        </div>
        <div className="summary-card">
          <span className="summary-label">Shared Questions</span>
          <strong>{SHARED_QUESTION_COUNT}</strong>
          <p>Semantically matched and normalized for comparison.</p>
        </div>
        <div className="summary-card">
          <span className="summary-label">Primary Lens</span>
          <strong>Share of respondents</strong>
          <p>Most charts are expressed as percentages, not raw counts.</p>
        </div>
      </div>

      <h2>## quick read</h2>
      <div className="insight-grid">
        {OVERVIEW_INSIGHTS.map((insight) => (
          <section key={insight.label} className="insight-card">
            <span className="insight-label">{insight.label}</span>
            <p>{insight.detail}</p>
          </section>
        ))}
      </div>

      <h2>## cohorts</h2>
      <ul className="profile-list">
        {PROFILE_META.map((profile) => (
          <li key={profile.id}>
            <span className="profile-chip" style={{ borderColor: profile.color, color: profile.color }}>
              {profile.shortLabel}
            </span>
            <span>{profile.displayName}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
