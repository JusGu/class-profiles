import rawData from "../../data/class-profiles-question-answer-data.json";
import {
  type ComparableQuestion,
  type OverviewInsight,
  type ProfileId,
  PROFILE_META,
} from "@/lib/types";

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

const MULTI_SELECT_NOTE =
  "These bars use share of respondents selecting each category. Some source surveys appear to preserve overlapping identities, so totals may exceed 100%.";

function getProfileMeta(profileId: ProfileId) {
  return PROFILE_META.find((profile) => profile.id === profileId)!;
}

function getItem(profileId: ProfileId, question: string): RawProfileItem {
  const item = raw.profiles[profileId].items.find(
    (candidate) => candidate.question === question,
  );
  if (!item) {
    throw new Error(`Missing ${profileId} question: ${question}`);
  }
  return item;
}

function getNumericField(item: RawProfileItem, key: string) {
  const value = item[key];
  return typeof value === "number" ? value : null;
}

function getDenominator(item: RawProfileItem) {
  return getNumericField(item, "n") ?? getNumericField(item, "inferred_n") ?? 0;
}

function getSelectionCountSum(item: RawProfileItem) {
  return getNumericField(item, "selection_count_sum") ?? 0;
}

function getCategoricalPairs(
  item: RawProfileItem,
): Array<{ label: string; count: number }> {
  const directAnswers = item.answers as unknown;
  if (Array.isArray(directAnswers)) {
    return directAnswers.flatMap((entry: unknown) => {
      const entryRecord = entry as Record<string, unknown>;
      if (
        entry &&
        typeof entry === "object" &&
        typeof entryRecord.label === "string" &&
        typeof entryRecord.count === "number"
      ) {
        return [{ label: entryRecord.label, count: entryRecord.count }];
      }
      return [];
    });
  }

  const chartBlocks = item.chart_blocks as unknown;
  if (Array.isArray(chartBlocks)) {
    for (const block of chartBlocks as unknown[]) {
      const blockRecord = block as Record<string, unknown>;
      if (
        block &&
        typeof block === "object" &&
        Array.isArray(blockRecord.data)
      ) {
        const pairs = blockRecord.data.flatMap((entry: unknown) => {
          const entryRecord = entry as Record<string, unknown>;
          if (
            entry &&
            typeof entry === "object" &&
            typeof entryRecord.category === "string" &&
            typeof entryRecord.value === "number"
          ) {
            return [{ label: entryRecord.category, count: entryRecord.value }];
          }

          if (
            entry &&
            typeof entry === "object" &&
            typeof entryRecord.text === "string" &&
            typeof entryRecord.value === "number"
          ) {
            return [{ label: entryRecord.text, count: entryRecord.value }];
          }

          return [];
        });

        if (pairs.length > 0) {
          return pairs;
        }
      }
    }
  }

  return [];
}

function expandNumericValues(item: RawProfileItem) {
  const valuesObject = item.values as unknown;
  const valuesRecord = valuesObject as Record<string, unknown>;
  if (
    valuesObject &&
    typeof valuesObject === "object" &&
    Array.isArray(valuesRecord.values)
  ) {
    return valuesRecord.values.filter(
      (value): value is number => typeof value === "number",
    );
  }

  const pairs = getCategoricalPairs(item);
  if (pairs.length === 0) {
    return [];
  }

  const numericPairs = pairs.filter(({ label }) => !Number.isNaN(Number(label)));
  if (numericPairs.length !== pairs.length) {
    return [];
  }

  const expanded: number[] = [];
  for (const pair of numericPairs) {
    const numericValue = Number(pair.label);
    for (let index = 0; index < Math.round(pair.count); index += 1) {
      expanded.push(numericValue);
    }
  }
  return expanded;
}

function toShareMap(
  counts: Record<string, number>,
  denominator: number,
  categories: string[],
) {
  return Object.fromEntries(
    categories.map((category) => [
      category,
      denominator > 0 ? ((counts[category] ?? 0) / denominator) * 100 : 0,
    ]),
  ) as Record<string, number>;
}

function buildRows(
  categories: string[],
  sharesByProfile: Record<ProfileId, Record<string, number>>,
) {
  return categories.map((category) => ({
    category,
    se_2025: sharesByProfile.se_2025[category] ?? 0,
    cs_2025: sharesByProfile.cs_2025[category] ?? 0,
    ece_2025: sharesByProfile.ece_2025[category] ?? 0,
  }));
}

function topProfileForCategory(rows: ComparableQuestion["rows"], category: string) {
  const row = rows.find((candidate) => candidate.category === category);
  if (!row) {
    throw new Error(`Missing row for category ${category}`);
  }

  return PROFILE_IDS.reduce(
    (best, profileId) =>
      row[profileId] > row[best] ? profileId : best,
    "se_2025" as ProfileId,
  );
}

function bottomProfileForCategory(
  rows: ComparableQuestion["rows"],
  category: string,
) {
  const row = rows.find((candidate) => candidate.category === category);
  if (!row) {
    throw new Error(`Missing row for category ${category}`);
  }

  return PROFILE_IDS.reduce(
    (lowest, profileId) =>
      row[profileId] < row[lowest] ? profileId : lowest,
    "se_2025" as ProfileId,
  );
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function normalizeCounts(
  item: RawProfileItem,
  canonicalCategories: string[],
  normalizeLabel: (label: string) => string | null,
) {
  const normalizedCounts = Object.fromEntries(
    canonicalCategories.map((category) => [category, 0]),
  ) as Record<string, number>;

  for (const pair of getCategoricalPairs(item)) {
    const normalizedLabel = normalizeLabel(pair.label);
    if (!normalizedLabel) {
      continue;
    }
    normalizedCounts[normalizedLabel] =
      (normalizedCounts[normalizedLabel] ?? 0) + pair.count;
  }

  return normalizedCounts;
}

function buildCategoricalQuestion(args: {
  id: string;
  section: ComparableQuestion["section"];
  title: string;
  kicker: string;
  note?: string;
  categories: string[];
  questions: Record<ProfileId, string>;
  sampleSizeOverrides?: Partial<
    Record<ProfileId, (item: RawProfileItem) => number>
  >;
  normalizeLabel: (label: string) => string | null;
  analysis: (
    rows: ComparableQuestion["rows"],
    sampleSizes: Record<ProfileId, number>,
  ) => string[];
}): ComparableQuestion {
  const sampleSizes = Object.fromEntries(
    PROFILE_IDS.map((profileId) => [
      profileId,
      args.sampleSizeOverrides?.[profileId]?.(
        getItem(profileId, args.questions[profileId]),
      ) ?? getDenominator(getItem(profileId, args.questions[profileId])),
    ]),
  ) as Record<ProfileId, number>;

  const sharesByProfile = Object.fromEntries(
    PROFILE_IDS.map((profileId) => {
      const item = getItem(profileId, args.questions[profileId]);
      return [
        profileId,
        toShareMap(
          normalizeCounts(item, args.categories, args.normalizeLabel),
          sampleSizes[profileId],
          args.categories,
        ),
      ];
    }),
  ) as Record<ProfileId, Record<string, number>>;

  const rows = buildRows(args.categories, sharesByProfile);

  return {
    id: args.id,
    section: args.section,
    title: args.title,
    kicker: args.kicker,
    note: args.note,
    categories: args.categories,
    rows,
    sampleSizes,
    analysis: args.analysis(rows, sampleSizes),
    sourceQuestions: args.questions,
  };
}

function buildBucketedQuestion(args: {
  id: string;
  title: string;
  kicker: string;
  categories: string[];
  note?: string;
  questions: Record<ProfileId, string>;
  valuesToCategory: (value: number) => string;
  profileCategoryMaps?: Partial<Record<ProfileId, Record<string, string>>>;
  analysis: (
    rows: ComparableQuestion["rows"],
    sampleSizes: Record<ProfileId, number>,
  ) => string[];
}): ComparableQuestion {
  const sampleSizes = Object.fromEntries(
    PROFILE_IDS.map((profileId) => {
      const item = getItem(profileId, args.questions[profileId]);
      return [profileId, getDenominator(item) || expandNumericValues(item).length];
    }),
  ) as Record<ProfileId, number>;

  const countsByProfile = {} as Record<ProfileId, Record<string, number>>;

  for (const profileId of PROFILE_IDS) {
    const item = getItem(profileId, args.questions[profileId]);
    const counts = Object.fromEntries(
      args.categories.map((category) => [category, 0]),
    ) as Record<string, number>;

    const categoryMap = args.profileCategoryMaps?.[profileId];

    if (categoryMap) {
      for (const pair of getCategoricalPairs(item)) {
        const mappedCategory = categoryMap[pair.label];
        if (mappedCategory) {
          counts[mappedCategory] += pair.count;
        }
      }
    } else {
      for (const value of expandNumericValues(item)) {
        counts[args.valuesToCategory(value)] += 1;
      }
    }

    countsByProfile[profileId] = counts;
  }

  const sharesByProfile = Object.fromEntries(
    PROFILE_IDS.map((profileId) => [
      profileId,
      toShareMap(countsByProfile[profileId], sampleSizes[profileId], args.categories),
    ]),
  ) as Record<ProfileId, Record<string, number>>;

  const rows = buildRows(args.categories, sharesByProfile);

  return {
    id: args.id,
    section: "academics",
    title: args.title,
    kicker: args.kicker,
    note: args.note,
    categories: args.categories,
    rows,
    sampleSizes,
    analysis: args.analysis(rows, sampleSizes),
    sourceQuestions: args.questions,
  };
}

function buildBinaryQuestion(args: {
  id: string;
  section: ComparableQuestion["section"];
  title: string;
  kicker: string;
  note?: string;
  questions: Record<ProfileId, string>;
  yesLabel: string;
  noLabel: string;
  getYesCount: (profileId: ProfileId, item: RawProfileItem) => number;
  sampleSizeOverrides?: Partial<
    Record<ProfileId, (item: RawProfileItem) => number>
  >;
  analysis: (
    rows: ComparableQuestion["rows"],
    sampleSizes: Record<ProfileId, number>,
  ) => string[];
}): ComparableQuestion {
  const sampleSizes = Object.fromEntries(
    PROFILE_IDS.map((profileId) => [
      profileId,
      args.sampleSizeOverrides?.[profileId]?.(
        getItem(profileId, args.questions[profileId]),
      ) ?? getDenominator(getItem(profileId, args.questions[profileId])),
    ]),
  ) as Record<ProfileId, number>;

  const rows = [
    {
      category: args.yesLabel,
      se_2025: 0,
      cs_2025: 0,
      ece_2025: 0,
    },
    {
      category: args.noLabel,
      se_2025: 0,
      cs_2025: 0,
      ece_2025: 0,
    },
  ] satisfies ComparableQuestion["rows"];

  for (const profileId of PROFILE_IDS) {
    const item = getItem(profileId, args.questions[profileId]);
    const sampleSize = sampleSizes[profileId];
    const yesCount = args.getYesCount(profileId, item);
    const yesShare = sampleSize > 0 ? (yesCount / sampleSize) * 100 : 0;
    const noShare = sampleSize > 0 ? 100 - yesShare : 0;

    rows[0][profileId] = yesShare;
    rows[1][profileId] = noShare;
  }

  return {
    id: args.id,
    section: args.section,
    title: args.title,
    kicker: args.kicker,
    note: args.note,
    categories: [args.yesLabel, args.noLabel],
    rows,
    sampleSizes,
    analysis: args.analysis(rows, sampleSizes),
    sourceQuestions: args.questions,
  };
}

function labelIncludes(label: string, patterns: string[]) {
  const lowered = label.toLowerCase();
  return patterns.some((pattern) => lowered.includes(pattern));
}

const genderQuestion = buildCategoricalQuestion({
  id: "gender",
  section: "demographics",
  title: "Gender identity",
  kicker: "Reported respondent mix by program",
  categories: ["Men", "Women", "Gender diverse / undisclosed"],
  questions: {
    se_2025: "What is your gender?",
    cs_2025: "What is your gender identity?",
    ece_2025: "What is your gender identity?",
  },
  normalizeLabel(label) {
    if (labelIncludes(label, ["woman", "female"])) {
      return "Women";
    }
    if (labelIncludes(label, ["man", "male"])) {
      return "Men";
    }
    return "Gender diverse / undisclosed";
  },
  analysis(rows) {
    const womenLeader = topProfileForCategory(rows, "Women");
    const womenLow = bottomProfileForCategory(rows, "Women");
    const womenRow = rows.find((row) => row.category === "Women")!;
    const menRow = rows.find((row) => row.category === "Men")!;
    const menLeader = topProfileForCategory(rows, "Men");
    return [
      `${getProfileMeta(womenLeader).shortLabel} reports the highest women share at ${formatPercent(womenRow[womenLeader])}, while ${getProfileMeta(womenLow).shortLabel} is lowest at ${formatPercent(womenRow[womenLow])}.`,
      `${getProfileMeta(menLeader).shortLabel} is the most male-heavy cohort, with ${formatPercent(menRow[menLeader])} identifying as men.`,
    ];
  },
});

const birthYearQuestion = buildCategoricalQuestion({
  id: "birth-year",
  section: "demographics",
  title: "Birth year",
  kicker: "Most of these cohorts cluster tightly around 2002",
  categories: ["2000 or earlier", "2001", "2002", "2003 or later"],
  questions: {
    se_2025: "What year were you born?",
    cs_2025: "What is your birth year?",
    ece_2025: "Year of birth",
  },
  normalizeLabel(label) {
    const value = Number(label);
    if (Number.isNaN(value)) {
      return null;
    }
    if (value <= 2000) {
      return "2000 or earlier";
    }
    if (value === 2001) {
      return "2001";
    }
    if (value === 2002) {
      return "2002";
    }
    return "2003 or later";
  },
  analysis(rows) {
    const row2002 = rows.find((row) => row.category === "2002")!;
    const leader = topProfileForCategory(rows, "2002");
    const earlierRow = rows.find((row) => row.category === "2000 or earlier")!;
    const earlierLeader = topProfileForCategory(rows, "2000 or earlier");
    return [
      `2002 is the dominant birth year in all three profiles, peaking in ${getProfileMeta(leader).shortLabel} at ${formatPercent(row2002[leader])}.`,
      `${getProfileMeta(earlierLeader).shortLabel} has the oldest skew, with ${formatPercent(earlierRow[earlierLeader])} born in 2000 or earlier.`,
    ];
  },
});

const ethnicityQuestion = buildCategoricalQuestion({
  id: "ethnicity",
  section: "demographics",
  title: "Ethnicity",
  kicker: "Share of respondents selecting each broad ethnicity bucket",
  note: MULTI_SELECT_NOTE,
  categories: [
    "East Asian",
    "South Asian",
    "Southeast Asian",
    "Middle Eastern / West Asian / North African",
    "White",
    "Black",
    "Latino / Hispanic",
    "Other / undisclosed",
  ],
  questions: {
    se_2025: "What racial or ethnic groups describe you?",
    cs_2025: "What race/ethnicity best describes you?",
    ece_2025: "What best describes your ethnicity?",
  },
  sampleSizeOverrides: {
    cs_2025: getSelectionCountSum,
  },
  normalizeLabel(label) {
    if (labelIncludes(label, ["east asian"])) return "East Asian";
    if (labelIncludes(label, ["south asian"])) return "South Asian";
    if (labelIncludes(label, ["southeast asian"])) return "Southeast Asian";
    if (labelIncludes(label, ["middle eastern", "west asian", "north african"])) {
      return "Middle Eastern / West Asian / North African";
    }
    if (labelIncludes(label, ["white", "caucasian"])) return "White";
    if (labelIncludes(label, ["black"])) return "Black";
    if (labelIncludes(label, ["latino", "hispanic"])) return "Latino / Hispanic";
    return "Other / undisclosed";
  },
  analysis(rows) {
    const eastAsian = rows.find((row) => row.category === "East Asian")!;
    const southAsian = rows.find((row) => row.category === "South Asian")!;
    const eastLeader = topProfileForCategory(rows, "East Asian");
    const southLeader = topProfileForCategory(rows, "South Asian");
    return [
      `East Asian is the largest reported ethnicity bucket across all three profiles, led by ${getProfileMeta(eastLeader).shortLabel} at ${formatPercent(eastAsian[eastLeader])}.`,
      `${getProfileMeta(southLeader).shortLabel} has the highest South Asian share at ${formatPercent(southAsian[southLeader])}.`,
    ];
  },
});

ethnicityQuestion.sampleLabels = {
  cs_2025: `sum=${ethnicityQuestion.sampleSizes.cs_2025}`,
};

const religionQuestion = buildCategoricalQuestion({
  id: "religion",
  section: "demographics",
  title: "Religion or spiritual affiliation",
  kicker: "Atheist / agnostic responses dominate the distribution",
  note: MULTI_SELECT_NOTE,
  categories: [
    "Atheist / agnostic",
    "Christian",
    "Muslim",
    "Hindu",
    "Buddhist",
    "Jewish",
    "Sikh",
    "Spiritual",
    "Other / undisclosed",
  ],
  questions: {
    se_2025: "What is your religious and/or spiritual affiliation?",
    cs_2025: "What is your religion and/or spiritual affiliation?",
    ece_2025: "What is your religion or spiritual affiliation, if any?",
  },
  sampleSizeOverrides: {
    cs_2025: getSelectionCountSum,
  },
  normalizeLabel(label) {
    if (labelIncludes(label, ["atheist", "agnostic"])) return "Atheist / agnostic";
    if (labelIncludes(label, ["christ"])) return "Christian";
    if (labelIncludes(label, ["muslim", "islam"])) return "Muslim";
    if (labelIncludes(label, ["hindu"])) return "Hindu";
    if (labelIncludes(label, ["buddhist"])) return "Buddhist";
    if (labelIncludes(label, ["jew"])) return "Jewish";
    if (labelIncludes(label, ["sikh"])) return "Sikh";
    if (labelIncludes(label, ["spiritual"])) return "Spiritual";
    return "Other / undisclosed";
  },
  analysis(rows) {
    const secularRow = rows.find((row) => row.category === "Atheist / agnostic")!;
    const secularLeader = topProfileForCategory(rows, "Atheist / agnostic");
    const muslimRow = rows.find((row) => row.category === "Muslim")!;
    const muslimLeader = topProfileForCategory(rows, "Muslim");
    return [
      `${getProfileMeta(secularLeader).shortLabel} has the largest atheist / agnostic share at ${formatPercent(secularRow[secularLeader])}, though the secular bucket is largest in every profile.`,
      `${getProfileMeta(muslimLeader).shortLabel} reports the highest Muslim share at ${formatPercent(muslimRow[muslimLeader])}.`,
    ];
  },
});

religionQuestion.sampleLabels = {
  cs_2025: `sum=${religionQuestion.sampleSizes.cs_2025}`,
};

const sexualityQuestion = buildCategoricalQuestion({
  id: "sexuality",
  section: "demographics",
  title: "Sexual orientation",
  kicker: "Straight remains the majority across all three cohorts",
  note: MULTI_SELECT_NOTE,
  categories: [
    "Straight",
    "Bisexual",
    "Gay / lesbian",
    "Asexual / aromantic",
    "Queer / questioning / other",
  ],
  questions: {
    se_2025: "What is your sexual orientation?",
    cs_2025: "What is your sexuality?",
    ece_2025: "What is your sexual orientation?",
  },
  sampleSizeOverrides: {
    cs_2025: getSelectionCountSum,
  },
  normalizeLabel(label) {
    if (labelIncludes(label, ["straight", "heterosexual"])) return "Straight";
    if (labelIncludes(label, ["bisexual"])) return "Bisexual";
    if (labelIncludes(label, ["gay", "lesbian", "homosexual"])) {
      return "Gay / lesbian";
    }
    if (labelIncludes(label, ["asexual", "aromantic"])) {
      return "Asexual / aromantic";
    }
    return "Queer / questioning / other";
  },
  analysis(rows) {
    const straightRow = rows.find((row) => row.category === "Straight")!;
    const straightLeader = topProfileForCategory(rows, "Straight");
    const biRow = rows.find((row) => row.category === "Bisexual")!;
    const biLeader = topProfileForCategory(rows, "Bisexual");
    return [
      `Straight is the majority orientation in all three profiles, with the highest straight share in ${getProfileMeta(straightLeader).shortLabel} at ${formatPercent(straightRow[straightLeader])}.`,
      `${getProfileMeta(biLeader).shortLabel} has the largest bisexual share at ${formatPercent(biRow[biLeader])}.`,
    ];
  },
});

sexualityQuestion.sampleLabels = {
  cs_2025: `sum=${sexualityQuestion.sampleSizes.cs_2025}`,
};

const partyFrequencyQuestion = buildCategoricalQuestion({
  id: "going-out",
  section: "life",
  title: "Going out / party frequency",
  kicker: "Social frequency varies more than the demographics do",
  categories: ["Never", "Rarely", "Monthly-ish", "Weekly or more"],
  questions: {
    se_2025: "How often do you go out/party on average?",
    cs_2025: "How often did you attend parties?",
    ece_2025: "How often did you go out (e.g. social events, parties, clubs, bars)?",
  },
  normalizeLabel(label) {
    if (labelIncludes(label, ["never"])) return "Never";
    if (
      labelIncludes(label, [
        "few times a year",
        "few times per year",
        "every few months",
        "few times/term",
        "few times per term",
      ])
    ) {
      return "Rarely";
    }
    if (
      labelIncludes(label, [
        "multiple times a month",
        "few times/month",
        "monthly",
        "every few weeks",
      ])
    ) {
      return "Monthly-ish";
    }
    if (
      labelIncludes(label, [
        "once a week",
        "weekly",
        "multiple times a week",
        "2–3/week",
        "4+/week",
      ])
    ) {
      return "Weekly or more";
    }
    return null;
  },
  analysis(rows) {
    const weeklyRow = rows.find((row) => row.category === "Weekly or more")!;
    const neverRow = rows.find((row) => row.category === "Never")!;
    const weeklyLeader = topProfileForCategory(rows, "Weekly or more");
    const neverLeader = topProfileForCategory(rows, "Never");
    return [
      `${getProfileMeta(weeklyLeader).shortLabel} is the most socially active of the three, with ${formatPercent(weeklyRow[weeklyLeader])} going out weekly or more.`,
      `${getProfileMeta(neverLeader).shortLabel} has the highest never-goes-out share at ${formatPercent(neverRow[neverLeader])}.`,
    ];
  },
});

const burnoutQuestion = buildBinaryQuestion({
  id: "burnout",
  section: "life",
  title: "Experienced burnout",
  kicker: "Burnout shows up as a majority experience in every cohort",
  note: "CS published this question as percentages rather than raw counts, so the chart uses the published share directly for that cohort.",
  questions: {
    se_2025: "What mental health issues have you faced? [Burnout]",
    cs_2025: "Have you ever experienced burnout?",
    ece_2025: "What challenges or conditions did you experience during your degree?",
  },
  yesLabel: "Reported burnout",
  noLabel: "Did not report / unsure",
  sampleSizeOverrides: {
    cs_2025: () => 100,
  },
  getYesCount(profileId, item) {
    if (profileId === "ece_2025") {
      return (
        getCategoricalPairs(item).find((pair) => pair.label === "Burnout")?.count ?? 0
      );
    }

    if (profileId === "cs_2025") {
      return getCategoricalPairs(item).find((pair) => pair.label === "Yes")?.count ?? 0;
    }

    return getCategoricalPairs(item).find((pair) => pair.label === "1")?.count ?? 0;
  },
  analysis(rows) {
    const yesRow = rows.find((row) => row.category === "Reported burnout")!;
    const leader = topProfileForCategory(rows, "Reported burnout");
    const lowest = bottomProfileForCategory(rows, "Reported burnout");
    return [
      `${getProfileMeta(leader).shortLabel} reports the highest burnout share at ${formatPercent(yesRow[leader])}, while ${getProfileMeta(lowest).shortLabel} is lowest at ${formatPercent(yesRow[lowest])}.`,
      `Even the lowest cohort still clears ${formatPercent(yesRow[lowest])}, which makes burnout one of the most consistent cross-program signals in the dataset.`,
    ];
  },
});

burnoutQuestion.sampleLabels = {
  cs_2025: "published %",
};

const returnOfferQuestion = buildBinaryQuestion({
  id: "return-offer",
  section: "life",
  title: "Returning to a prior co-op employer for full-time",
  kicker: "Among respondents with a full-time role, return offers are common but not uniform",
  note: "These denominators reflect respondents who reported on their accepted or lined-up full-time role, not the entire graduating cohort.",
  questions: {
    se_2025: "Are you returning to a previous co-op?",
    cs_2025: "Is this a return offer from a prior co-op?",
    ece_2025: "Will you be returning to a prior co-op employer for full-time?",
  },
  yesLabel: "Return offer",
  noLabel: "New employer",
  getYesCount(_profileId, item) {
    return getCategoricalPairs(item).find((pair) => pair.label === "Yes")?.count ?? 0;
  },
  analysis(rows) {
    const yesRow = rows.find((row) => row.category === "Return offer")!;
    const leader = topProfileForCategory(rows, "Return offer");
    const lowest = bottomProfileForCategory(rows, "Return offer");
    return [
      `${getProfileMeta(leader).shortLabel} is most likely to convert co-op into full-time, with ${formatPercent(yesRow[leader])} returning to a prior employer.`,
      `${getProfileMeta(lowest).shortLabel} is lowest at ${formatPercent(yesRow[lowest])}, but return offers still make up a large minority of outcomes in every profile.`,
    ];
  },
});

function admissionsBucket(value: number) {
  if (value < 92) return "<92";
  if (value < 94) return "92–93.9";
  if (value < 96) return "94–95.9";
  if (value < 98) return "96–97.9";
  return "98+";
}

const admissionsAverageQuestion = buildBucketedQuestion({
  id: "high-school-average",
  title: "High school admission average",
  kicker: "Incoming averages are compressed near the top, but not identically",
  categories: ["<92", "92–93.9", "94–95.9", "96–97.9", "98+"],
  questions: {
    se_2025: "What was your high school admissions average?",
    cs_2025: "What was your high school admissions average?",
    ece_2025: "What was your high school admission average?",
  },
  valuesToCategory: admissionsBucket,
  analysis(rows) {
    const topBucket = rows.find((row) => row.category === "98+")!;
    const topLeader = topProfileForCategory(rows, "98+");
    const lowBucket = rows.find((row) => row.category === "<92")!;
    const lowLeader = topProfileForCategory(rows, "<92");
    return [
      `${getProfileMeta(topLeader).shortLabel} has the strongest ultra-high tail, with ${formatPercent(topBucket[topLeader])} reporting a 98+ admission average.`,
      `${getProfileMeta(lowLeader).shortLabel} has the largest share below 92 at ${formatPercent(lowBucket[lowLeader])}, though every cohort remains concentrated above 94.`,
    ];
  },
});

const failedCourseQuestion = buildBinaryQuestion({
  id: "failed-course",
  section: "academics",
  title: "Failed at least one course",
  kicker: "Most graduates finish without failing a course, but the rates are not identical",
  questions: {
    se_2025: "How many classes did you fail?",
    cs_2025: "How many courses have you failed?",
    ece_2025: "Did you ever fail a... [Course?]",
  },
  yesLabel: "Failed 1+ course",
  noLabel: "No failed courses",
  getYesCount(profileId, item) {
    const pairs = getCategoricalPairs(item);

    if (profileId === "ece_2025") {
      return pairs
        .filter((pair) => pair.label !== "No")
        .reduce((sum, pair) => sum + pair.count, 0);
    }

    return pairs
      .filter((pair) => pair.label !== "0")
      .reduce((sum, pair) => sum + pair.count, 0);
  },
  analysis(rows) {
    const yesRow = rows.find((row) => row.category === "Failed 1+ course")!;
    const leader = topProfileForCategory(rows, "Failed 1+ course");
    const lowest = bottomProfileForCategory(rows, "Failed 1+ course");
    return [
      `${getProfileMeta(leader).shortLabel} has the highest course-failure share at ${formatPercent(yesRow[leader])}, while ${getProfileMeta(lowest).shortLabel} is lowest at ${formatPercent(yesRow[lowest])}.`,
      `The distribution still skews heavily toward zero failed courses in all three cohorts, so this is a difference in tail risk, not the dominant experience.`,
    ];
  },
});

function cumulativeBucket(value: number) {
  if (value < 70) return "<70";
  if (value < 80) return "70–79.9";
  if (value < 90) return "80–89.9";
  if (value < 95) return "90–94.9";
  return "95+";
}

const cumulativeAverageQuestion = buildBucketedQuestion({
  id: "cumulative-average",
  title: "Cumulative average",
  kicker: "Graduating performance tightens, but the right tail differs by cohort",
  categories: ["<70", "70–79.9", "80–89.9", "90–94.9", "95+"],
  questions: {
    se_2025: "What is your cumulative average?",
    cs_2025: "What was your cumulative average?",
    ece_2025: "What was your cumulative average?",
  },
  valuesToCategory: cumulativeBucket,
  profileCategoryMaps: {
    cs_2025: {
      "<70": "<70",
      "70–80": "70–79.9",
      "80–90": "80–89.9",
      "90–95": "90–94.9",
      "95+": "95+",
    },
  },
  analysis(rows) {
    const ninetyPlus = rows
      .filter((row) => row.category === "90–94.9" || row.category === "95+")
      .reduce(
        (totals, row) => ({
          se_2025: totals.se_2025 + row.se_2025,
          cs_2025: totals.cs_2025 + row.cs_2025,
          ece_2025: totals.ece_2025 + row.ece_2025,
        }),
        { se_2025: 0, cs_2025: 0, ece_2025: 0 },
      );

    const leader = PROFILE_IDS.reduce((best, profileId) =>
      ninetyPlus[profileId] > ninetyPlus[best] ? profileId : best,
    );

    const midBucket = rows.find((row) => row.category === "80–89.9")!;
    const midLeader = topProfileForCategory(rows, "80–89.9");

    return [
      `${getProfileMeta(leader).shortLabel} has the largest 90+ cumulative-average share at ${formatPercent(ninetyPlus[leader])}.`,
      `${getProfileMeta(midLeader).shortLabel} is most concentrated in the 80–89.9 band at ${formatPercent(midBucket[midLeader])}.`,
    ];
  },
});

export const COMPARABLE_QUESTIONS: ComparableQuestion[] = [
  genderQuestion,
  birthYearQuestion,
  ethnicityQuestion,
  religionQuestion,
  sexualityQuestion,
  partyFrequencyQuestion,
  burnoutQuestion,
  returnOfferQuestion,
  admissionsAverageQuestion,
  failedCourseQuestion,
  cumulativeAverageQuestion,
];

export const DEMOGRAPHIC_QUESTIONS = COMPARABLE_QUESTIONS.filter(
  (question) => question.section === "demographics",
);

export const ACADEMIC_QUESTIONS = COMPARABLE_QUESTIONS.filter(
  (question) => question.section === "academics",
);

export const LIFE_QUESTIONS = COMPARABLE_QUESTIONS.filter(
  (question) => question.section === "life",
);

export const OVERVIEW_INSIGHTS: OverviewInsight[] = [
  {
    label: "Gender mix",
    detail: genderQuestion.analysis[0],
  },
  {
    label: "Shared cohort year",
    detail: birthYearQuestion.analysis[0],
  },
  {
    label: "Admission edge",
    detail: admissionsAverageQuestion.analysis[0],
  },
  {
    label: "Graduation edge",
    detail: cumulativeAverageQuestion.analysis[0],
  },
  {
    label: "Going out",
    detail: partyFrequencyQuestion.analysis[0],
  },
  {
    label: "Burnout",
    detail: burnoutQuestion.analysis[0],
  },
];

export const SHARED_QUESTION_COUNT = COMPARABLE_QUESTIONS.length;

export const METHOD_NOTES = [
  "There are no exact string-identical questions across SE 2025, CS 2025, and ECE 2025. The site uses a manual semantic mapping for the questions that are close enough to compare.",
  "Demographic charts use respondent share by canonical bucket. For ethnicity, religion, and sexuality, some source surveys appear to preserve overlapping categories, so totals can exceed 100%.",
  "Academic charts bucket raw numeric values into common ranges so SE, CS, and ECE can be shown on the same axes.",
  "CS data comes from published Next.js route chunks. When the source only exposes category totals rather than an explicit n, the site labels that denominator as a sum instead of pretending it is a published respondent count.",
  "Some seemingly similar questions were left out on purpose. Sleep timing is missing because the CS page does not expose a recoverable distribution, and relationship-duration bins diverge too much to compare without arbitrary remapping.",
];

export const EXCLUDED_COMPARISONS = [
  "Sleep timing: SE and ECE publish usable histograms, but CS only exposes commentary for this question.",
  "Time spent in a relationship: all three profiles ask it, but their published bins do not line up tightly enough for a clean comparison.",
  "Broad mental-health conditions: SE uses per-condition binary questions, CS omits explicit n for the multi-select chart, and ECE publishes a broader condition list.",
];
