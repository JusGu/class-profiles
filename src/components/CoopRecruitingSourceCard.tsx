"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  COOP_METHOD_NOTES,
  COOP_RECRUITING_ANALYSIS,
  COOP_RECRUITING_ROWS,
} from "@/lib/coop-data";

const SOURCE_COLORS: Record<string, string> = {
  "WaterlooWorks main": "#d79921",
  "WaterlooWorks continuous": "#83a598",
  External: "#689d6a",
  "Referral / connection": "#458588",
  "Return offer": "#b16286",
  Other: "#fabd2f",
};

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function CoopRecruitingSourceCard() {
  return (
    <section className="question-card">
      <header className="question-card-header">
        <div>
          <span className="question-kicker">Aggregated across all co-op terms</span>
          <h2>How co-ops were found</h2>
        </div>
        <div className="sample-summary" aria-label="Placement counts">
          {COOP_RECRUITING_ROWS.map((row) => (
            <span key={row.profile} className="sample-item">
              <strong>{row.profile}</strong> {row.totalPlacements} placements
            </span>
          ))}
        </div>
      </header>

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={COOP_RECRUITING_ROWS}
            margin={{ top: 8, right: 20, left: 0, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(146, 131, 116, 0.24)" />
            <XAxis dataKey="profile" stroke="#a89984" tick={{ fill: "#ebdbb2", fontSize: 12 }} />
            <YAxis
              domain={[0, 100]}
              tickFormatter={formatPercent}
              stroke="#a89984"
              tick={{ fill: "#a89984", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(60, 56, 54, 0.28)" }}
              contentStyle={{
                background: "#282828",
                border: "1px solid #504945",
                borderRadius: "0",
                color: "#ebdbb2",
              }}
              formatter={(value: number, name) => [formatPercent(value), name]}
            />
            <Legend wrapperStyle={{ color: "#a89984", fontSize: "12px" }} />
            {Object.entries(SOURCE_COLORS).map(([bucket, color]) => (
              <Bar key={bucket} dataKey={bucket} stackId="source" fill={color} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="analysis-list">
        {COOP_RECRUITING_ANALYSIS.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <p className="question-note">{COOP_METHOD_NOTES[4]}</p>
    </section>
  );
}
