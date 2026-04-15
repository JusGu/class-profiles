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
import { PROFILE_META, type ComparableQuestion } from "@/lib/types";

interface ChartCardProps {
  question: ComparableQuestion;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function ChartCard({ question }: ChartCardProps) {
  return (
    <section className="question-card">
      <div className="question-card-header">
        <div>
          <span className="question-kicker">{question.kicker}</span>
          <h2>{question.title}</h2>
        </div>
        <div className="sample-grid">
          {PROFILE_META.map((profile) => (
            <div key={profile.id} className="sample-pill">
              <span className="sample-label">{profile.shortLabel}</span>
              <span className="sample-value">
                {question.sampleLabels?.[profile.id] ??
                  `n=${question.sampleSizes[profile.id]}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={Math.max(320, question.rows.length * 52)}>
          <BarChart
            data={question.rows}
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
              width={182}
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
            <Legend
              wrapperStyle={{ color: "#a89984", fontSize: "12px" }}
              formatter={(value) => PROFILE_META.find((profile) => profile.id === value)?.shortLabel ?? value}
            />
            {PROFILE_META.map((profile) => (
              <Bar
                key={profile.id}
                dataKey={profile.id}
                name={profile.id}
                fill={profile.color}
                radius={[0, 4, 4, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="analysis-list">
        {question.analysis.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      {question.note ? <p className="question-note">{question.note}</p> : null}

      <details className="source-details">
        <summary>Source question mapping</summary>
        <ul>
          <li>
            <strong>SE:</strong> {question.sourceQuestions.se_2025}
          </li>
          <li>
            <strong>CS:</strong> {question.sourceQuestions.cs_2025}
          </li>
          <li>
            <strong>ECE:</strong> {question.sourceQuestions.ece_2025}
          </li>
        </ul>
      </details>
    </section>
  );
}
