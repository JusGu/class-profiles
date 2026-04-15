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
  COOP_LOCATION_ANALYSIS,
  COOP_LOCATION_ROWS,
  COOP_METHOD_NOTES,
} from "@/lib/coop-data";

const LOCATION_COLORS: Record<string, string> = {
  Remote: "#689d6a",
  Ontario: "#458588",
  "Canada outside Ontario": "#83a598",
  "United States": "#d79921",
  International: "#b16286",
};

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function CoopLocationMixCard() {
  return (
    <section className="question-card">
      <div className="question-card-header">
        <div>
          <span className="question-kicker">Share of recorded co-op placements</span>
          <h2>Where co-ops were located</h2>
        </div>
        <div className="sample-grid">
          {COOP_LOCATION_ROWS.map((row) => (
            <div key={row.profile} className="sample-pill">
              <span className="sample-label">{row.profile}</span>
              <span className="sample-value">{row.totalPlacements} placements</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={COOP_LOCATION_ROWS}
            layout="vertical"
            margin={{ top: 8, right: 20, left: 8, bottom: 8 }}
            barCategoryGap={18}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(146, 131, 116, 0.24)" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={formatPercent}
              stroke="#a89984"
              tick={{ fill: "#a89984", fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="profile"
              stroke="#a89984"
              tick={{ fill: "#ebdbb2", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(60, 56, 54, 0.28)" }}
              contentStyle={{
                background: "#282828",
                border: "1px solid #504945",
                borderRadius: "10px",
                color: "#fbf1c7",
              }}
              formatter={(value: number, name) => [formatPercent(value), name]}
            />
            <Legend wrapperStyle={{ color: "#a89984", fontSize: "12px" }} />
            {Object.entries(LOCATION_COLORS).map(([bucket, color]) => (
              <Bar key={bucket} dataKey={bucket} stackId="location" fill={color} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="analysis-list">
        {COOP_LOCATION_ANALYSIS.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <p className="question-note">{COOP_METHOD_NOTES[2]}</p>
    </section>
  );
}
