# class-profiles

Simple Next.js site for comparing shared Waterloo class profile questions across
SE 2025, CS 2025, and ECE 2025.

The site is organized into `overview.md`, `demographics.md`, `academics.md`,
`life.md`, and `method.md` tabs, using a portfolio-inspired terminal/editor
shell.

Run locally:
- `npm install`
- `npm run dev`
- `npm run build`

Extracted class profile question-and-answer data is under `data/`.

Key files:
- `data/class-profiles-question-answer-data.json`: combined SE/CS/ECE extraction
- `data/class-profile-qa/se_2025.json`
- `data/class-profile-qa/cs_2025.json`
- `data/class-profile-qa/ece_2025.json`
