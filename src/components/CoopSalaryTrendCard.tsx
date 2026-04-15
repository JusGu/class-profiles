"use client";

import { PROFILE_META } from "@/lib/types";
import {
  COOP_METHOD_NOTES,
  COOP_SALARY_ANALYSIS,
  COOP_SALARY_BOX_PLOTS,
  COOP_SALARY_DOMAIN_MAX,
} from "@/lib/coop-data";

const TERMS = ["Co-op 1", "Co-op 2", "Co-op 3", "Co-op 4", "Co-op 5", "Co-op 6"] as const;
const VIEWBOX_WIDTH = 960;
const VIEWBOX_HEIGHT = 360;
const MARGIN = { top: 20, right: 24, bottom: 42, left: 56 };
const INNER_WIDTH = VIEWBOX_WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = VIEWBOX_HEIGHT - MARGIN.top - MARGIN.bottom;

function formatCurrency(value: number) {
  return `$${value.toFixed(1)}/hr`;
}

function getTickStep(maxValue: number) {
  const rough = maxValue / 4;
  if (rough <= 5) return 5;
  if (rough <= 10) return 10;
  if (rough <= 20) return 20;
  if (rough <= 25) return 25;
  return 50;
}

function getTicks(maxValue: number) {
  const step = getTickStep(maxValue);
  const ticks: number[] = [];
  for (let value = 0; value <= maxValue; value += step) {
    ticks.push(value);
  }
  if (ticks[ticks.length - 1] !== maxValue) {
    ticks.push(maxValue);
  }
  return ticks;
}

function yScale(value: number) {
  return MARGIN.top + INNER_HEIGHT - (value / COOP_SALARY_DOMAIN_MAX) * INNER_HEIGHT;
}

export default function CoopSalaryTrendCard() {
  const groupWidth = INNER_WIDTH / TERMS.length;
  const boxWidth = Math.min(18, groupWidth / 5);
  const profileOffsets = [-boxWidth * 1.4, 0, boxWidth * 1.4];
  const ticks = getTicks(COOP_SALARY_DOMAIN_MAX);

  return (
    <section className="question-card">
      <header className="question-card-header">
        <div>
          <span className="question-kicker">Hourly pay distribution by co-op number</span>
          <h2>Co-op salary transition</h2>
        </div>
        <div className="sample-summary" aria-label="Profile colors">
          {PROFILE_META.map((profile) => (
            <span key={profile.id} className="sample-item">
              <strong style={{ color: profile.color }}>{profile.shortLabel}</strong>{" "}
              {profile.id === "se_2025" ? "exact values" : "estimated from pay brackets"}
            </span>
          ))}
        </div>
      </header>

      <div className="chart-shell">
        <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} width="100%" height="360" role="img" aria-label="Box-and-whisker plot of co-op salaries by term">
          {ticks.map((tick) => {
            const y = yScale(tick);
            return (
              <g key={tick}>
                <line
                  x1={MARGIN.left}
                  x2={VIEWBOX_WIDTH - MARGIN.right}
                  y1={y}
                  y2={y}
                  stroke="rgba(146, 131, 116, 0.24)"
                  strokeDasharray="3 3"
                />
                <text
                  x={MARGIN.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#a89984"
                  fontSize="12"
                >
                  {`$${tick}`}
                </text>
              </g>
            );
          })}

          <line
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={VIEWBOX_HEIGHT - MARGIN.bottom}
            stroke="#a89984"
          />
          <line
            x1={MARGIN.left}
            x2={VIEWBOX_WIDTH - MARGIN.right}
            y1={VIEWBOX_HEIGHT - MARGIN.bottom}
            y2={VIEWBOX_HEIGHT - MARGIN.bottom}
            stroke="#a89984"
          />

          {TERMS.map((term, termIndex) => {
            const center = MARGIN.left + groupWidth * termIndex + groupWidth / 2;
            return (
              <text
                key={term}
                x={center}
                y={VIEWBOX_HEIGHT - 14}
                textAnchor="middle"
                fill="#ebdbb2"
                fontSize="12"
              >
                {term}
              </text>
            );
          })}

          {COOP_SALARY_BOX_PLOTS.map((plot) => {
            const profileIndex = PROFILE_META.findIndex((profile) => profile.id === plot.profileId);
            const xCenter =
              MARGIN.left +
              groupWidth * plot.termIndex +
              groupWidth / 2 +
              profileOffsets[profileIndex];
            const color = PROFILE_META[profileIndex].color;
            const yMin = yScale(plot.min);
            const yQ1 = yScale(plot.q1);
            const yMedian = yScale(plot.median);
            const yQ3 = yScale(plot.q3);
            const yMax = yScale(plot.max);

            return (
              <g key={`${plot.profileId}-${plot.term}`}>
                <title>
                  {`${PROFILE_META[profileIndex].shortLabel} ${plot.term}
n=${plot.n}
whisker low=${formatCurrency(plot.min)}
q1=${formatCurrency(plot.q1)}
median=${formatCurrency(plot.median)}
q3=${formatCurrency(plot.q3)}
whisker high=${formatCurrency(plot.max)}`}
                </title>
                <line x1={xCenter} x2={xCenter} y1={yMax} y2={yMin} stroke={color} strokeWidth="1.5" />
                <line x1={xCenter - boxWidth / 3} x2={xCenter + boxWidth / 3} y1={yMax} y2={yMax} stroke={color} strokeWidth="1.5" />
                <line x1={xCenter - boxWidth / 3} x2={xCenter + boxWidth / 3} y1={yMin} y2={yMin} stroke={color} strokeWidth="1.5" />
                <rect
                  x={xCenter - boxWidth / 2}
                  y={yQ3}
                  width={boxWidth}
                  height={Math.max(2, yQ1 - yQ3)}
                  fill={color}
                  fillOpacity="0.28"
                  stroke={color}
                  strokeWidth="1.5"
                />
                <line
                  x1={xCenter - boxWidth / 2}
                  x2={xCenter + boxWidth / 2}
                  y1={yMedian}
                  y2={yMedian}
                  stroke={color}
                  strokeWidth="2"
                />
                {plot.outliers.map((outlier, index) => (
                  outlier <= COOP_SALARY_DOMAIN_MAX ? (
                    <circle
                      key={`${plot.profileId}-${plot.term}-outlier-${index}`}
                      cx={xCenter}
                      cy={yScale(outlier)}
                      r="2.5"
                      fill={color}
                    >
                      <title>{`${PROFILE_META[profileIndex].shortLabel} ${plot.term} outlier ${formatCurrency(outlier)}`}</title>
                    </circle>
                  ) : null
                ))}
              </g>
            );
          })}
        </svg>

        <div className="sample-summary" style={{ marginTop: "0.75rem" }} aria-label="Box plot legend">
          <span className="sample-item">box = interquartile range</span>
          <span className="sample-item">center line = median</span>
          <span className="sample-item">whiskers = 1.5x IQR</span>
        </div>
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
