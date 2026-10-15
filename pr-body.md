Title: Fix hibernate snake case (fixes #14577)

Summary
- Fixes the hibernate-style snake_case helper used by DB naming utilities.
- Applies the minimal change on a clean branch based on upstream/main to avoid unrelated commits.

Files changed
- generators/server/support/string.ts
- generators/server/support/string.spec.ts
- generators/server/support/database.spec.ts

Verification performed locally
- Focused unit tests covering the helper and related DB support tests: passed for the modified files.
- ESLint / Prettier checks for the changed files: passed locally.
- Packaging: generator packaged locally and the packaged CLI returned expected version output.

Note about full-local CI
- A full repository test/lint/type run was attempted locally but failed due to unrelated, pre-existing lint/type issues and a Prettier warning for a local ignored settings file (.claude/settings.local.json). Those issues are not introduced by this PR.

Request
- Please review and let upstream CI run. If CI flags only unrelated pre-existing issues, this focused fix can be merged. If CI shows failures directly tied to these changes, I will iterate immediately.

Important: No Co-authored-by trailer was added to the commit(s) and none will be included in the PR (per instruction).