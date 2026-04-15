Saved question-and-answer extraction at `.context/class-profiles-question-answer-data.json`.

Sources:
- `SE 2025`: local repo JSON under `.context/classprofile-src-sexxv-20260415/`
- `CS 2025`: live published route chunks under `https://csclub.uwaterloo.ca/classprofile/2025`
- `ECE 2025`: live `https://ece-25.github.io/classprofile/data/results.json`

What is in the JSON:
- Per-profile source metadata
- Per-question answer payloads
- Raw answer structures preserved for mixed chart types
- CS route-level source URLs for reproducibility

Important caveats:
- `SE 2025`: all 338 items are exact `labels + counts + n` payloads from the local cleaned JSON files.
- `ECE 2025`: all 260 items come from the live `results.json`, which mixes count charts, word clouds, numeric distributions, two-part charts, flow data, and open-ended responses.
- `CS 2025`: 150 items were recovered from the live published Next.js route chunks. Counts and raw response lists are available, but explicit `n` is usually not published in those chunks.
- `CS 2025` now includes `inferred_n` where it can be recovered directly from the published payload, plus `selection_count_sum` for count-based charts where a raw sum exists but may not equal respondents.
- `CS 2025` academics includes both compressed and expanded chart states; the extractor keeps the richer version for duplicate question titles.
- `CS 2025` co-op dynamic titles were expanded by rendering all six co-op states.
