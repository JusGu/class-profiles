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

const CATEGORY_COLORS = [
  "#d79921",
  "#689d6a",
  "#458588",
  "#b16286",
  "#cc241d",
  "#8ec07c",
  "#83a598",
  "#fabd2f",
  "#d3869b",
] as const;

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function buildStackedRows(question: ComparableQuestion) {
  return PROFILE_META.map((profile) =>
    Object.assign(
      {
        profile: profile.shortLabel,
      },
      ...question.rows.map((row) => ({
        [row.category]: row[profile.id],
      })),
    ),
  );
}

function renderSampleLabel(question: ComparableQuestion, profileId: (typeof PROFILE_META)[number]["id"]) {
  return question.sampleLabels?.[profileId] ?? `n=${question.sampleSizes[profileId]}`;
}

export default function ChartCard({ question }: ChartCardProps) {
  const stackedRows = question.chartMode === "stacked" ? buildStackedRows(question) : null;

  return (
    <section className="question-card">
      <header className="question-card-header">
        <div>
          <span className="question-kicker">{question.kicker}</span>
          <h2>{question.title}</h2>
        </div>
        <div className="sample-summary" aria-label="Sample sizes">
          {PROFILE_META.map((profile) => (
            <span key={profile.id} className="sample-item">
              <strong style={{ color: profile.color }}>{profile.shortLabel}</strong>{" "}
              {renderSampleLabel(question, profile.id)}
            </span>
          ))}
        </div>
      </header>

      <div className="chart-shell">
        {question.chartMode === "stacked" && stackedRows ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={stackedRows}
              margin={{ top: 8, right: 20, left: 0, bottom: 8 }}
              barCategoryGap={28}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(146, 131, 116, 0.24)" />
              <XAxis
                dataKey="profile"
                stroke="#a89984"
                tick={{ fill: "#ebdbb2", fontSize: 12 }}
              />
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
              {question.categories.map((category, index) => (
                <Bar
                  key={category}
                  dataKey={category}
                  stackId="composition"
                  fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(320, question.rows.length * 48)}>
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
        )}
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
