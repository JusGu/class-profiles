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
import { PROFILE_META } from "@/lib/types";
import {
  COOP_METHOD_NOTES,
  COOP_ROLE_ANALYSIS,
  COOP_ROLE_ROWS,
  COOP_ROLE_SAMPLE_SIZES,
} from "@/lib/coop-data";

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function CoopRoleMixCard() {
  return (
    <section className="question-card">
      <header className="question-card-header">
        <div>
          <span className="question-kicker">Latest published role distribution, using co-op #6</span>
          <h2>Co-op role mix</h2>
        </div>
        <div className="sample-summary" aria-label="Latest co-op samples">
          {PROFILE_META.map((profile) => (
            <span key={profile.id} className="sample-item">
              <strong>{profile.shortLabel}</strong> n={COOP_ROLE_SAMPLE_SIZES[profile.id]}
            </span>
          ))}
        </div>
      </header>

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={Math.max(320, COOP_ROLE_ROWS.length * 48)}>
          <BarChart
            data={COOP_ROLE_ROWS}
            layout="vertical"
            margin={{ top: 8, right: 20, left: 12, bottom: 8 }}
            barCategoryGap={10}
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
              dataKey="category"
              width={190}
              stroke="#a89984"
              tick={{ fill: "#ebdbb2", fontSize: 12 }}
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
            <Legend
              wrapperStyle={{ color: "#a89984", fontSize: "12px" }}
              formatter={(value) =>
                PROFILE_META.find((profile) => profile.id === value)?.shortLabel ?? value
              }
            />
            {PROFILE_META.map((profile) => (
              <Bar key={profile.id} dataKey={profile.id} name={profile.id} fill={profile.color} />
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
