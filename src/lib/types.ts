export const PAGES = [
  { id: "overview", filename: "overview.md", href: "/" },
  { id: "demographics", filename: "demographics.md", href: "/demographics" },
  { id: "academics", filename: "academics.md", href: "/academics" },
  { id: "life", filename: "life.md", href: "/life" },
  { id: "coop", filename: "coop.md", href: "/coop" },
  { id: "method", filename: "method.md", href: "/method" },
] as const;

export type PageId = (typeof PAGES)[number]["id"];

export type ProfileId = "se_2025" | "cs_2025" | "ece_2025";

export interface ProfileMeta {
  id: ProfileId;
  shortLabel: string;
  displayName: string;
  color: string;
}

export const PROFILE_META: ProfileMeta[] = [
  {
    id: "se_2025",
    shortLabel: "SE",
    displayName: "Software Engineering 2025",
    color: "#d79921",
  },
  {
    id: "cs_2025",
    shortLabel: "CS",
    displayName: "Computer Science 2025",
    color: "#689d6a",
  },
  {
    id: "ece_2025",
    shortLabel: "ECE",
    displayName: "Electrical & Computer Engineering 2025",
    color: "#458588",
  },
];

export interface SourceQuestions {
  se_2025: string;
  cs_2025: string;
  ece_2025: string;
}

export interface CategoryShareRow {
  category: string;
  se_2025: number;
  cs_2025: number;
  ece_2025: number;
}

export type ChartMode = "grouped" | "stacked";

export interface ComparableQuestion {
  id: string;
  section: "demographics" | "academics" | "life";
  title: string;
  kicker: string;
  chartMode: ChartMode;
  note?: string;
  categories: string[];
  rows: CategoryShareRow[];
  sampleSizes: Record<ProfileId, number>;
  sampleLabels?: Partial<Record<ProfileId, string>>;
  analysis: string[];
  sourceQuestions: SourceQuestions;
}

export interface OverviewInsight {
  label: string;
  detail: string;
}
