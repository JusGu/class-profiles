"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PROFILE_META } from "@/lib/types";
import {
  COOP_METHOD_NOTES,
  COOP_SALARY_ANALYSIS,
  COOP_SALARY_POINTS,
} from "@/lib/coop-data";

function formatCurrency(value: number) {
  return `$${value.toFixed(1)}/hr`;
}

export default function CoopSalaryTrendCard() {
  return (
    <section className="question-card">
      <div className="question-card-header">
        <div>
          <span className="question-kicker">Median hourly pay by co-op number</span>
          <h2>Co-op salary progression</h2>
        </div>
      </div>

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={COOP_SALARY_POINTS} margin={{ top: 16, right: 20, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(146, 131, 116, 0.24)" />
            <XAxis
              dataKey="term"
              stroke="#a89984"
              tick={{ fill: "#ebdbb2", fontSize: 12 }}
            />
            <YAxis
              stroke="#a89984"
              tick={{ fill: "#a89984", fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              cursor={{ stroke: "rgba(146, 131, 116, 0.35)", strokeWidth: 1 }}
              contentStyle={{
                background: "#282828",
                border: "1px solid #504945",
                borderRadius: "10px",
                color: "#fbf1c7",
              }}
              formatter={(value: number, name, item) => {
                const sampleField = `${name}_n`;
                const sampleSize = (item.payload as Record<string, number>)[sampleField];
                return [`${formatCurrency(value)} (${sampleSize} samples)`, PROFILE_META.find((profile) => profile.id === name)?.shortLabel ?? name];
              }}
            />
            <Legend
              wrapperStyle={{ color: "#a89984", fontSize: "12px" }}
              formatter={(value) =>
                PROFILE_META.find((profile) => profile.id === value)?.shortLabel ?? value
              }
            />
            {PROFILE_META.map((profile) => (
              <Line
                key={profile.id}
                type="monotone"
                dataKey={profile.id}
                stroke={profile.color}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ul className="analysis-list">
        {COOP_SALARY_ANALYSIS.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <p className="question-note">{COOP_METHOD_NOTES[1]}</p>
    </section>
  );
}
