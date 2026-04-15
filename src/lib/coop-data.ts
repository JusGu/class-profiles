import rawData from "../../data/class-profiles-question-answer-data.json";
import { PROFILE_META, type ProfileId } from "@/lib/types";

type RawProfileItem = Record<string, unknown>;

type RawDataFile = {
  profiles: Record<
    ProfileId,
    {
      items: RawProfileItem[];
    }
  >;
};

const raw = rawData as RawDataFile;

const PROFILE_IDS: ProfileId[] = PROFILE_META.map((profile) => profile.id);
function getProfileMeta(profileId: ProfileId) {
  return PROFILE_META.find((profile) => profile.id === profileId)!;
}

const LOCATION_BUCKETS = [
  "Remote",
  "Ontario",
  "Canada outside Ontario",
  "United States",
  "International",
] as const;

const ROLE_BUCKETS = [
  "Backend / general SWE",
  "Full stack",
  "Frontend / mobile",
  "Infrastructure / DevOps",
  "Data / ML",
  "Hardware / embedded",
  "QA / test",
  "Research / PM / other",
] as const;

const RECRUITING_BUCKETS = [
  "WaterlooWorks main",
  "WaterlooWorks continuous",
  "External",
  "Referral / connection",
  "Return offer",
  "Other",
] as const;

const US_LOCATION_KEYWORDS = [
  "new york",
  "new york city",
  "san francisco",
  "san jose",
  "san mateo",
  "mountain view",
  "palo alto",
  "cupertino",
  "sunnyvale",
  "seattle",
  "boston",
  "cambridge, ma",
  "los angeles",
  "austin",
  "miami",
  "lexington, ma",
  "menlo park",
  "redwood city",
  "campbell",
  "bay area",
  "california",
  "durham, nc",
  "chicago",
  "ann arbor",
  "los gatos",
  "burlingame",
  "long beach",
  "washington dc",
  "santa clara",
  "connecticut",
  "burlington vermont",
];

const CANADA_OUTSIDE_ONTARIO_KEYWORDS = [
  "vancouver",
  "montreal",
  "calgary",
  "quebec city",
  "halifax",
  "british columbia",
];

const ONTARIO_KEYWORDS = [
  "toronto",
  "waterloo",
  "kitchener",
  "ottawa",
  "markham",
  "mississauga",
  "oakville",
  "scarborough",
  "cambridge, ontario",
  "london, ontario",
  "stouffville",
  "vaughan",
  "aurora",
  "kanata",
  "pickering",
  "nepean",
  "milton",
  "richmond hill",
  "gta",
  "kw",
  "greater toronto area",
];

const INTERNATIONAL_KEYWORDS = [
  "asia",
  "beijing",
  "hangzhou",
  "tokyo",
  "singapore",
  "shanghai",
  "nairobi",
  "karlsruhe",
  "germany",
  "berlin",
  "antibes",
  "france",
  "belfast",
  "ireland",
  "amsterdam",
  "netherlands",
  "cologne",
  "hamburg",
  "europe",
];

const EMPLOYER_ALIAS_MAP = new Map<string, string>([
  ["amazon robotics", "amazon"],
  ["aws", "amazon"],
  ["blackberry qnx", "blackberry"],
  ["bell canada", "bell"],
  ["core avi", "coreavi"],
  ["td lab", "td"],
]);

const EMPLOYER_DISPLAY_MAP: Record<string, string> = {
  amazon: "Amazon",
  apple: "Apple",
  "arctic wolf": "Arctic Wolf",
  blackberry: "BlackBerry",
  geotab: "Geotab",
  meta: "Meta",
  opentext: "OpenText",
  playstation: "PlayStation",
  rbc: "RBC",
  sap: "SAP",
  tesla: "Tesla",
  "university of waterloo": "University of Waterloo",
  "untether ai": "Untether AI",
};

function getItem(profileId: ProfileId, question: string) {
  const item = raw.profiles[profileId].items.find(
    (candidate) => candidate.question === question,
  );

  if (!item) {
    throw new Error(`Missing ${profileId} question: ${question}`);
  }

  return item;
}

function getItems(profileId: ProfileId, question: string) {
  const items = raw.profiles[profileId].items.filter(
    (candidate) => candidate.question === question,
  );

  if (items.length === 0) {
    throw new Error(`Missing ${profileId} question: ${question}`);
  }

  return items;
}

function getAnswers(item: RawProfileItem): Array<{ label: string; count: number }> {
  const directAnswers = item.answers as unknown;
  if (Array.isArray(directAnswers)) {
    return directAnswers.flatMap((entry: unknown) => {
      const record = entry as Record<string, unknown>;
      if (
        entry &&
        typeof entry === "object" &&
        typeof record.label === "string" &&
        typeof record.count === "number"
      ) {
        return [{ label: record.label, count: record.count }];
      }

      return [];
    });
  }

  const chartBlocks = item.chart_blocks as unknown;
  if (Array.isArray(chartBlocks)) {
    const firstBlock = chartBlocks[0] as Record<string, unknown> | undefined;
    const data = firstBlock?.data as unknown;
    if (Array.isArray(data)) {
      return data.flatMap((entry: unknown) => {
        const record = entry as Record<string, unknown>;
        if (
          entry &&
          typeof entry === "object" &&
          typeof record.category === "string" &&
          typeof record.value === "number"
        ) {
          return [{ label: record.category, count: record.value }];
        }

        return [];
      });
    }
  }

  return [];
}

function getWords(item: RawProfileItem): Array<{ word: string; weight: number }> {
  const words = item.words as unknown;
  if (!Array.isArray(words)) {
    return [];
  }

  return words.flatMap((entry: unknown) => {
    const record = entry as Record<string, unknown>;
    if (
      entry &&
      typeof entry === "object" &&
      typeof record.word === "string" &&
      typeof record.weight === "number"
    ) {
      return [{ word: record.word, weight: record.weight }];
    }

    return [];
  });
}

function parseSalaryValue(label: string) {
  const normalized = label.trim();
  if (normalized === "N/A") return null;

  const rangeMatch = normalized.match(
    /^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)$/,
  );
  if (rangeMatch) {
    return (Number(rangeMatch[1]) + Number(rangeMatch[2])) / 2;
  }

  if (/^\d+\+$/.test(normalized)) {
    return Number(normalized.replace("+", "")) + 2.5;
  }

  if (/^\d+(?:\.\d+)?$/.test(normalized)) {
    return Number(normalized);
  }

  return null;
}

function median(values: number[]) {
  if (values.length === 0) return null;

  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[midpoint];
  }

  return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
}

function expandSalaryPairs(pairs: Array<{ label: string; count: number }>) {
  const values: number[] = [];

  for (const pair of pairs) {
    const parsed = parseSalaryValue(pair.label);
    if (parsed === null) {
      continue;
    }

    for (let index = 0; index < pair.count; index += 1) {
      values.push(parsed);
    }
  }

  return values;
}

function bucketLocation(label: string) {
  const normalized = label.trim().toLowerCase();
  if (!normalized || normalized === "n/a" || normalized === "na" || normalized === "none") {
    return null;
  }

  if (
    normalized.includes("remote") ||
    normalized === "home" ||
    normalized === "at home." ||
    normalized === "my desk"
  ) {
    return "Remote";
  }

  if (ONTARIO_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return "Ontario";
  }

  if (
    CANADA_OUTSIDE_ONTARIO_KEYWORDS.some((keyword) => normalized.includes(keyword)) ||
    normalized === "canada" ||
    normalized === "other canada"
  ) {
    return "Canada outside Ontario";
  }

  if (
    US_LOCATION_KEYWORDS.some((keyword) => normalized.includes(keyword)) ||
    normalized === "other usa"
  ) {
    return "United States";
  }

  if (
    INTERNATIONAL_KEYWORDS.some((keyword) => normalized.includes(keyword)) ||
    normalized === "other international"
  ) {
    return "International";
  }

  return "International";
}

function bucketRole(label: string) {
  const normalized = label.trim().toLowerCase();
  if (!normalized || normalized === "n/a" || normalized === "na" || normalized === "none") {
    return null;
  }

  if (normalized.includes("full stack") || normalized.includes("full-stack")) {
    return "Full stack";
  }

  if (
    normalized.includes("frontend") ||
    normalized.includes("front end") ||
    normalized.includes("front-end") ||
    normalized.includes("ios") ||
    normalized.includes("android") ||
    normalized.includes("mobile") ||
    normalized.includes("web ")
  ) {
    return "Frontend / mobile";
  }

  if (
    normalized.includes("devops") ||
    normalized.includes("infra") ||
    normalized.includes("platform") ||
    normalized.includes("site reliability") ||
    normalized.includes("sre") ||
    normalized.includes("cloud") ||
    normalized.includes("systems administrator") ||
    normalized.includes("security")
  ) {
    return "Infrastructure / DevOps";
  }

  if (
    normalized.includes("machine learning") ||
    normalized.includes("ml") ||
    normalized.includes("data") ||
    normalized.includes("analytics") ||
    normalized.includes("quant")
  ) {
    return "Data / ML";
  }

  if (
    normalized.includes("embedded") ||
    normalized.includes("firmware") ||
    normalized.includes("hardware") ||
    normalized.includes("semiconductor") ||
    normalized.includes("power") ||
    normalized.includes("silicon") ||
    normalized.includes("communications") ||
    normalized.includes("robotics")
  ) {
    return "Hardware / embedded";
  }

  if (
    normalized.includes("qa") ||
    normalized.includes("quality assurance") ||
    normalized.includes("quality engineer") ||
    normalized.includes("test") ||
    normalized.includes("sdet")
  ) {
    return "QA / test";
  }

  if (
    normalized.includes("product") ||
    normalized.includes("project") ||
    normalized.includes("program manager") ||
    normalized.includes("designer") ||
    normalized.includes("research") ||
    normalized.includes("analyst") ||
    normalized.includes("assistant") ||
    normalized.includes("support") ||
    normalized.includes("tutor") ||
    normalized.includes("capital") ||
    normalized.includes("other") ||
    normalized.includes("it")
  ) {
    return "Research / PM / other";
  }

  if (
    normalized.includes("backend") ||
    normalized.includes("back-end") ||
    normalized.includes("software") ||
    normalized.includes("developer") ||
    normalized.includes("engineer") ||
    normalized.includes("programmer") ||
    normalized.includes("c++")
  ) {
    return "Backend / general SWE";
  }

  return "Research / PM / other";
}

function bucketRecruitingSource(label: string) {
  const normalized = label.trim().toLowerCase();
  if (!normalized || normalized === "n/a" || normalized === "na") {
    return null;
  }

  if (normalized.includes("did not find")) {
    return null;
  }

  if (
    normalized.includes("waterlooworks (first") ||
    normalized.includes("waterlooworks (second") ||
    normalized.includes("main round") ||
    normalized.includes("1st round ww") ||
    normalized.includes("2nd round ww")
  ) {
    return "WaterlooWorks main";
  }

  if (
    normalized.includes("waterlooworks (continuous") ||
    normalized.includes("continuous round") ||
    normalized.includes("continuous ww")
  ) {
    return "WaterlooWorks continuous";
  }

  if (
    normalized.includes("external") ||
    normalized.includes("cold reachout")
  ) {
    return "External";
  }

  if (
    normalized.includes("personal connection") ||
    normalized.includes("nepotism")
  ) {
    return "Referral / connection";
  }

  if (
    normalized.includes("returned to previous company") ||
    normalized.includes("return offer")
  ) {
    return "Return offer";
  }

  return "Other";
}

function normalizeEmployer(name: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[.,()']/g, "")
    .replace(/\s+/g, " ");

  return EMPLOYER_ALIAS_MAP.get(normalized) ?? normalized;
}

function displayEmployer(name: string) {
  return (
    EMPLOYER_DISPLAY_MAP[name] ??
    name
      .split(" ")
      .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
      .join(" ")
  );
}

type CoopSalaryPoint = {
  term: string;
  se_2025: number;
  cs_2025: number;
  ece_2025: number;
  se_n: number;
  cs_n: number;
  ece_n: number;
};

type CoopLocationRow = {
  profile: string;
  totalPlacements: number;
} & Record<(typeof LOCATION_BUCKETS)[number], number>;

type CoopRoleRow = {
  category: string;
  se_2025: number;
  cs_2025: number;
  ece_2025: number;
};

type CoopRecruitingRow = {
  profile: string;
  totalPlacements: number;
} & Record<(typeof RECRUITING_BUCKETS)[number], number>;

type SharedEmployerRow = {
  employer: string;
  se_2025: number;
  cs_2025: number;
  ece_2025: number;
  se_count: number;
  cs_count: number;
  ece_count: number;
  total_count: number;
};

const salaryPoints: CoopSalaryPoint[] = [];

for (let termNumber = 1; termNumber <= 6; termNumber += 1) {
  const seValues = expandSalaryPairs(
    getAnswers(getItem("se_2025", `What was your hourly co-op salary? (co-op #${termNumber})`)),
  );
  const csValues = expandSalaryPairs(
    getAnswers(
      getItem(
        "cs_2025",
        `What was your salary per hour in CAD (excluding other forms of compensation)? (co-op #${termNumber})`,
      ),
    ),
  );
  const eceValues = expandSalaryPairs(
    getAnswers(getItem("ece_2025", `Hourly Compensation [Coop ${termNumber}]`)),
  );

  salaryPoints.push({
    term: `Co-op ${termNumber}`,
    se_2025: median(seValues) ?? 0,
    cs_2025: median(csValues) ?? 0,
    ece_2025: median(eceValues) ?? 0,
    se_n: seValues.length,
    cs_n: csValues.length,
    ece_n: eceValues.length,
  });
}

const salaryFirst = salaryPoints[0];
const salaryLast = salaryPoints[salaryPoints.length - 1];
const salaryGrowth = Object.fromEntries(
  PROFILE_IDS.map((profileId) => [profileId, salaryLast[profileId] - salaryFirst[profileId]]),
) as Record<ProfileId, number>;

const salaryLeader = PROFILE_IDS.reduce((best, profileId) =>
  salaryLast[profileId] > salaryLast[best] ? profileId : best,
);
const salaryGrowthLeader = PROFILE_IDS.reduce((best, profileId) =>
  salaryGrowth[profileId] > salaryGrowth[best] ? profileId : best,
);

export const COOP_SALARY_POINTS = salaryPoints;

export const COOP_SALARY_ANALYSIS = [
  `${PROFILE_META.find((profile) => profile.id === salaryLeader)?.shortLabel} ends with the highest estimated co-op #6 median at $${salaryLast[salaryLeader].toFixed(1)}/hr.`,
  `${PROFILE_META.find((profile) => profile.id === salaryGrowthLeader)?.shortLabel} shows the steepest first-to-last co-op salary climb, up roughly $${salaryGrowth[salaryGrowthLeader].toFixed(1)}/hr from co-op #1 to co-op #6.`,
];

const locationCountsByProfile = Object.fromEntries(
  PROFILE_IDS.map((profileId) => [
    profileId,
    Object.fromEntries(LOCATION_BUCKETS.map((bucket) => [bucket, 0])),
  ]),
) as Record<ProfileId, Record<(typeof LOCATION_BUCKETS)[number], number>>;

for (let termNumber = 1; termNumber <= 6; termNumber += 1) {
  for (const pair of getAnswers(
    getItem("se_2025", `Where was your co-op? (co-op #${termNumber})`),
  )) {
    const bucket = bucketLocation(pair.label);
    if (bucket) {
      locationCountsByProfile.se_2025[bucket] += pair.count;
    }
  }

  for (const pair of getAnswers(
    getItem("cs_2025", `Where were you located during work (co-op #${termNumber})?`),
  )) {
    const bucket = bucketLocation(pair.label);
    if (bucket) {
      locationCountsByProfile.cs_2025[bucket] += pair.count;
    }
  }

  for (const pair of getAnswers(
    getItem("ece_2025", `Location [Coop ${termNumber}]`),
  )) {
    const bucket = bucketLocation(pair.label);
    if (bucket) {
      locationCountsByProfile.ece_2025[bucket] += pair.count;
    }
  }
}

const locationTotals = Object.fromEntries(
  PROFILE_IDS.map((profileId) => [
    profileId,
    Object.values(locationCountsByProfile[profileId]).reduce(
      (total, count) => total + count,
      0,
    ),
  ]),
) as Record<ProfileId, number>;

export const COOP_LOCATION_ROWS: CoopLocationRow[] = PROFILE_META.map((profile) => ({
  profile: profile.shortLabel,
  totalPlacements: locationTotals[profile.id],
  Remote:
    (locationCountsByProfile[profile.id].Remote / locationTotals[profile.id]) * 100,
  Ontario:
    (locationCountsByProfile[profile.id].Ontario / locationTotals[profile.id]) * 100,
  "Canada outside Ontario":
    (locationCountsByProfile[profile.id]["Canada outside Ontario"] /
      locationTotals[profile.id]) *
    100,
  "United States":
    (locationCountsByProfile[profile.id]["United States"] /
      locationTotals[profile.id]) *
    100,
  International:
    (locationCountsByProfile[profile.id].International /
      locationTotals[profile.id]) *
    100,
}));

function topLocationProfile(bucket: (typeof LOCATION_BUCKETS)[number]) {
  return COOP_LOCATION_ROWS.reduce((best, row) =>
    row[bucket] > best[bucket] ? row : best,
  );
}

const remoteLeader = topLocationProfile("Remote");
const usLeader = topLocationProfile("United States");

export const COOP_LOCATION_ANALYSIS = [
  `${remoteLeader.profile} is the most remote-heavy overall, with ${remoteLeader.Remote.toFixed(1)}% of recorded co-op placements marked remote.`,
  `${usLeader.profile} sends the largest overall share to the United States at ${usLeader["United States"].toFixed(1)}% of placements.`,
];

const latestRoleCountsByProfile = Object.fromEntries(
  PROFILE_IDS.map((profileId) => [
    profileId,
    Object.fromEntries(ROLE_BUCKETS.map((bucket) => [bucket, 0])),
  ]),
) as Record<ProfileId, Record<(typeof ROLE_BUCKETS)[number], number>>;

for (const pair of getAnswers(
  getItem("se_2025", "What was your co-op role? (co-op #6)"),
)) {
  const bucket = bucketRole(pair.label);
  if (bucket) {
    latestRoleCountsByProfile.se_2025[bucket] += pair.count;
  }
}

for (const pair of getAnswers(
  getItem("cs_2025", "What was your position (co-op #6)?"),
)) {
  const bucket = bucketRole(pair.label);
  if (bucket) {
    latestRoleCountsByProfile.cs_2025[bucket] += pair.count;
  }
}

for (const item of getItems("ece_2025", "What was your role during co-op? [Coop 6]")) {
  for (const pair of getAnswers(item)) {
    const bucket = bucketRole(pair.label);
    if (bucket) {
      latestRoleCountsByProfile.ece_2025[bucket] += pair.count;
    }
  }
}

export const COOP_ROLE_SAMPLE_SIZES = {
  se_2025: (
    getItem("se_2025", "What was your co-op role? (co-op #6)")["n"] as number
  ) ?? 0,
  cs_2025: (
    getItem("cs_2025", "What was your position (co-op #6)?")["inferred_n"] as number
  ) ?? 0,
  ece_2025: getItems("ece_2025", "What was your role during co-op? [Coop 6]").reduce(
    (total, item) => total + ((item["n"] as number) ?? 0),
    0,
  ),
} as const;

function roleShare(profileId: ProfileId, bucket: (typeof ROLE_BUCKETS)[number]) {
  const total = COOP_ROLE_SAMPLE_SIZES[profileId];
  return total > 0 ? (latestRoleCountsByProfile[profileId][bucket] / total) * 100 : 0;
}

export const COOP_ROLE_ROWS: CoopRoleRow[] = ROLE_BUCKETS.map((bucket) => ({
  category: bucket,
  se_2025: roleShare("se_2025", bucket),
  cs_2025: roleShare("cs_2025", bucket),
  ece_2025: roleShare("ece_2025", bucket),
})).filter(
  (row) => Math.max(row.se_2025, row.cs_2025, row.ece_2025) >= 4,
);

function topRoleProfile(row: CoopRoleRow) {
  return PROFILE_IDS.reduce((best, profileId) =>
    row[profileId] > row[best] ? profileId : best,
  );
}

const fullStackRow = COOP_ROLE_ROWS.find((row) => row.category === "Full stack")!;
const hardwareRow = COOP_ROLE_ROWS.find((row) => row.category === "Hardware / embedded")!;
const backendRow = COOP_ROLE_ROWS.find((row) => row.category === "Backend / general SWE")!;
const fullStackLeader = topRoleProfile(fullStackRow);
const hardwareLeader = topRoleProfile(hardwareRow);
const backendLeader = topRoleProfile(backendRow);

export const COOP_ROLE_ANALYSIS = [
  `${getProfileMeta(backendLeader).shortLabel} skews most toward backend / general SWE in co-op #6 at ${backendRow[backendLeader].toFixed(1)}%.`,
  `${getProfileMeta(hardwareLeader).shortLabel} is the most hardware-heavy in co-op #6 at ${hardwareRow[hardwareLeader].toFixed(1)}%, while ${getProfileMeta(fullStackLeader).shortLabel} leads the full-stack bucket at ${fullStackRow[fullStackLeader].toFixed(1)}%.`,
];

const recruitingCountsByProfile = Object.fromEntries(
  PROFILE_IDS.map((profileId) => [
    profileId,
    Object.fromEntries(RECRUITING_BUCKETS.map((bucket) => [bucket, 0])),
  ]),
) as Record<ProfileId, Record<(typeof RECRUITING_BUCKETS)[number], number>>;

for (let termNumber = 1; termNumber <= 6; termNumber += 1) {
  for (const pair of getAnswers(
    getItem("se_2025", `How did you find your co-op? (co-op #${termNumber})`),
  )) {
    const bucket = bucketRecruitingSource(pair.label);
    if (bucket) {
      recruitingCountsByProfile.se_2025[bucket] += pair.count;
    }
  }

  for (const pair of getAnswers(
    getItem("cs_2025", `How did you find your job? (co-op #${termNumber})`),
  )) {
    const bucket = bucketRecruitingSource(pair.label);
    if (bucket) {
      recruitingCountsByProfile.cs_2025[bucket] += pair.count;
    }
  }

  for (const pair of getAnswers(
    getItem("ece_2025", `Recruitment Event [Coop ${termNumber}]`),
  )) {
    const bucket = bucketRecruitingSource(pair.label);
    if (bucket) {
      recruitingCountsByProfile.ece_2025[bucket] += pair.count;
    }
  }
}

const recruitingTotals = Object.fromEntries(
  PROFILE_IDS.map((profileId) => [
    profileId,
    Object.values(recruitingCountsByProfile[profileId]).reduce(
      (total, count) => total + count,
      0,
    ),
  ]),
) as Record<ProfileId, number>;

export const COOP_RECRUITING_ROWS: CoopRecruitingRow[] = PROFILE_META.map((profile) => ({
  profile: profile.shortLabel,
  totalPlacements: recruitingTotals[profile.id],
  "WaterlooWorks main":
    (recruitingCountsByProfile[profile.id]["WaterlooWorks main"] / recruitingTotals[profile.id]) *
    100,
  "WaterlooWorks continuous":
    (recruitingCountsByProfile[profile.id]["WaterlooWorks continuous"] /
      recruitingTotals[profile.id]) *
    100,
  External:
    (recruitingCountsByProfile[profile.id].External / recruitingTotals[profile.id]) * 100,
  "Referral / connection":
    (recruitingCountsByProfile[profile.id]["Referral / connection"] /
      recruitingTotals[profile.id]) *
    100,
  "Return offer":
    (recruitingCountsByProfile[profile.id]["Return offer"] / recruitingTotals[profile.id]) * 100,
  Other:
    (recruitingCountsByProfile[profile.id].Other / recruitingTotals[profile.id]) * 100,
}));

function topRecruitingProfile(bucket: (typeof RECRUITING_BUCKETS)[number]) {
  return COOP_RECRUITING_ROWS.reduce((best, row) =>
    row[bucket] > best[bucket] ? row : best,
  );
}

const mainRoundLeader = topRecruitingProfile("WaterlooWorks main");
const externalLeader = topRecruitingProfile("External");
const returnPathLeader = topRecruitingProfile("Return offer");

export const COOP_RECRUITING_ANALYSIS = [
  `${mainRoundLeader.profile} relies the most on WaterlooWorks main cycles overall, at ${mainRoundLeader["WaterlooWorks main"].toFixed(1)}% of recorded placements.`,
  `${externalLeader.profile} has the highest external-search share at ${externalLeader.External.toFixed(1)}%, while ${returnPathLeader.profile} leads return-offer sourcing at ${returnPathLeader["Return offer"].toFixed(1)}%.`,
];

const employerCountsByProfile = Object.fromEntries(
  PROFILE_IDS.map((profileId) => [profileId, new Map<string, number>()]),
) as Record<ProfileId, Map<string, number>>;

function addEmployer(profileId: ProfileId, employer: string, count: number) {
  const normalized = normalizeEmployer(employer);
  if (
    !normalized ||
    ["n/a", "na", "null", "none", "nope", "startup", "a startup"].includes(
      normalized,
    )
  ) {
    return;
  }

  employerCountsByProfile[profileId].set(
    normalized,
    (employerCountsByProfile[profileId].get(normalized) ?? 0) + count,
  );
}

for (let termNumber = 1; termNumber <= 6; termNumber += 1) {
  for (const pair of getAnswers(
    getItem("se_2025", `What company did you work at? (co-op #${termNumber})`),
  )) {
    addEmployer("se_2025", pair.label, pair.count);
  }

  for (const pair of getAnswers(
    getItem("cs_2025", `What company did you work for (co-op #${termNumber})?`),
  )) {
    addEmployer("cs_2025", pair.label, pair.count);
  }

  for (const pair of getWords(getItem("ece_2025", `Coop ${termNumber}: Company`))) {
    addEmployer("ece_2025", pair.word, pair.weight);
  }
}

const employerTotals = Object.fromEntries(
  PROFILE_IDS.map((profileId) => [
    profileId,
    Array.from(employerCountsByProfile[profileId].values()).reduce(
      (total, count) => total + count,
      0,
    ),
  ]),
) as Record<ProfileId, number>;

const sharedEmployers: SharedEmployerRow[] = [];

for (const employer of employerCountsByProfile.se_2025.keys()) {
  if (
    employerCountsByProfile.cs_2025.has(employer) &&
    employerCountsByProfile.ece_2025.has(employer)
  ) {
    const seCount = employerCountsByProfile.se_2025.get(employer) ?? 0;
    const csCount = employerCountsByProfile.cs_2025.get(employer) ?? 0;
    const eceCount = employerCountsByProfile.ece_2025.get(employer) ?? 0;

    sharedEmployers.push({
      employer: displayEmployer(employer),
      se_2025: (seCount / employerTotals.se_2025) * 100,
      cs_2025: (csCount / employerTotals.cs_2025) * 100,
      ece_2025: (eceCount / employerTotals.ece_2025) * 100,
      se_count: seCount,
      cs_count: csCount,
      ece_count: eceCount,
      total_count: seCount + csCount + eceCount,
    });
  }
}

sharedEmployers.sort((left, right) => right.total_count - left.total_count);

export const SHARED_EMPLOYER_ROWS = sharedEmployers.slice(0, 10);

const topSharedEmployer = SHARED_EMPLOYER_ROWS[0];

export const SHARED_EMPLOYER_ANALYSIS = topSharedEmployer
  ? [
      `${topSharedEmployer.employer} is the most common shared employer across all three profiles, with ${topSharedEmployer.total_count} reported placements in the combined co-op data.`,
      `The overlap list still skews toward a few repeat names, so the long tail remains highly program-specific even after aggregating all six co-op terms.`,
    ]
  : [];

export const COOP_COMPARISON_COUNT = 5;

export const COOP_METHOD_NOTES = [
  "SE co-op data comes from a separate coop.json source that stores six co-op-specific distributions per question. The earlier extraction missed that file; the tracked data now includes it.",
  "Salary trend uses the median hourly co-op pay for each co-op number. SE uses exact published salary values, while CS and ECE medians are estimated from their published pay brackets.",
  "Location mix aggregates all six co-op terms into broad buckets: Remote, Ontario, Canada outside Ontario, United States, and International.",
  "Role mix now uses co-op #6 only rather than aggregating all six placements. The ECE co-op #6 role prompt is split into two subgroup charts in the source, so both published distributions are combined there.",
  "Recruiting-source mix aggregates all six co-op terms and excludes explicit no-placement responses, since those are not a sourcing channel.",
  "Shared employers aggregate recorded placements across all six co-op terms. Company names are lightly normalized for obvious variants such as AWS to Amazon and BlackBerry QNX to BlackBerry.",
];
