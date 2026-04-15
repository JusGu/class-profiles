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
  SHARED_EMPLOYER_ANALYSIS,
  SHARED_EMPLOYER_ROWS,
} from "@/lib/coop-data";

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function SharedEmployersCard() {
  return (
    <section className="question-card">
      <div className="question-card-header">
        <div>
          <span className="question-kicker">Top employers appearing in all three profiles</span>
          <h2>Shared co-op employers</h2>
        </div>
      </div>

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={Math.max(360, SHARED_EMPLOYER_ROWS.length * 40)}>
          <BarChart
            data={SHARED_EMPLOYER_ROWS}
            layout="vertical"
            margin={{ top: 8, right: 20, left: 36, bottom: 8 }}
            barCategoryGap={10}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(146, 131, 116, 0.24)" />
            <XAxis
              type="number"
              tickFormatter={formatPercent}
              stroke="#a89984"
              tick={{ fill: "#a89984", fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="employer"
              width={180}
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
              formatter={(value: number, name, item) => {
                const rawCount = (item.payload as Record<string, number>)[`${name}_count`];
                return [`${formatPercent(value)} (${rawCount} placements)`, PROFILE_META.find((profile) => profile.id === name)?.shortLabel ?? name];
              }}
            />
            <Legend
              wrapperStyle={{ color: "#a89984", fontSize: "12px" }}
              formatter={(value) =>
                PROFILE_META.find((profile) => profile.id === value)?.shortLabel ?? value
              }
            />
            {PROFILE_META.map((profile) => (
              <Bar
                key={profile.id}
                dataKey={profile.id}
                fill={profile.color}
                radius={[0, 4, 4, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="analysis-list">
        {SHARED_EMPLOYER_ANALYSIS.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <p className="question-note">{COOP_METHOD_NOTES[5]}</p>
    </section>
  );
}
