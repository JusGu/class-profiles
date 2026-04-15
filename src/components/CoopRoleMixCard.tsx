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
  COOP_ROLE_ANALYSIS,
  COOP_ROLE_ROWS,
} from "@/lib/coop-data";

const ROLE_COLORS: Record<string, string> = {
  "Software / backend": "#d79921",
  "Full stack": "#689d6a",
  "Frontend / mobile": "#83a598",
  "Infrastructure / DevOps": "#458588",
  "Data / ML": "#8ec07c",
  "Hardware / embedded": "#b16286",
  "QA / test": "#cc241d",
  "Product / research / other": "#fabd2f",
};

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function CoopRoleMixCard() {
  return (
    <section className="question-card">
      <header className="question-card-header">
        <div>
          <span className="question-kicker">Share of recorded co-op placements</span>
          <h2>Co-op role mix</h2>
        </div>
        <div className="sample-summary" aria-label="Placement counts">
          {COOP_ROLE_ROWS.map((row) => (
            <span key={row.profile} className="sample-item">
              <strong>{row.profile}</strong> {row.totalPlacements} placements
            </span>
          ))}
        </div>
      </header>

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={COOP_ROLE_ROWS} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
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
            {Object.entries(ROLE_COLORS).map(([bucket, color]) => (
              <Bar key={bucket} dataKey={bucket} stackId="role" fill={color} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="analysis-list">
        {COOP_ROLE_ANALYSIS.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <p className="question-note">{COOP_METHOD_NOTES[3]}</p>
    </section>
  );
}
