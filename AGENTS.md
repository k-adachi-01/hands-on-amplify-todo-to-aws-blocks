# AGENTS.md

## Project goal

This repository is a hands-on tutorial for rewriting the Amplify Todo flow with AWS Blocks.
Prioritize reproducibility, beginner-friendly steps, and cleanup safety.

## Commands

- Install: `npm install`
- Dev: `npm run dev`
- Sandbox: `npm run sandbox`
- Delete sandbox: `npm run sandbox:delete`
- Lint: `npm run lint`
- Build: `npm run build`
- Verify chapter 2: `bash scripts/ensure-chapter2-users.sh && npm run verify:chapter2`
- Verify chapter 3: `bash scripts/ensure-chapter2-users.sh && npm run verify:chapter3`

## Rules

- Do not commit `.amplify/`, `amplify_outputs.json`, `.env.local`, `.bb-data/`, or AWS account-specific files.
- Do not add AWS resources without updating cleanup documentation.
- If package scripts change, update README.md and docs/ARTICLE-DRAFT.md together.
- If chapter behavior changes, update the corresponding docs/chapters/* README, snapshots, and verification steps.
- This repository is for hands-on learning, not production deployment.
