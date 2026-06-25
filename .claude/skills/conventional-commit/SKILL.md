---
name: conventional-commit
description: >
  Use this skill whenever the user wants to commit staged or unstaged changes using
  Conventional Commits format — automatically grouping changes into logical commits
  with appropriate types (feat, fix, refactor, chore, docs, test, style, perf, ci, build).
  Triggers on phrases like: "commit my changes", "auto commit", "group and commit",
  "conventional commit", "commit with message", "commit everything", or any request
  to commit code with structured messages. Also triggers when the user asks Claude to
  review what's changed and commit it properly. Use this skill even if the user just
  says "commit this" without specifying a format — always apply Conventional Commits.
---

# Conventional Commit Skill

Automatically analyze staged/unstaged Git changes, group them into logical commits,
and write well-formed Conventional Commit messages for each group.

---

## REQUIRED: Explain Before Every Bash Command

**Before running any bash command**, you MUST output a plain-text block in this exact format:

```
Current request:
- <What the user is asking for at this step>

Command purpose:
- <command 1>: <what it checks or produces>
- <command 2>: <what it checks or produces>
- ...
```

This is mandatory for every bash invocation — including inspection, staging, and committing steps.
Never run a command silently. The explanation must come immediately before the command block.

**Examples:**

Before inspecting the repo:

```
Current request:
- Check the current state of the Git repository.

Command purpose:
- git status --short: list all modified, added, and deleted files.
- git diff --stat: show line-level change statistics for unstaged files.
- git diff --cached --stat: show line-level change statistics for staged files.
```

Before reading a diff:

```
Current request:
- Understand what changed in src/auth/token.ts to decide its commit type.

Command purpose:
- git diff -- src/auth/token.ts: show unstaged changes in that file.
```

Before executing a commit:

```
Current request:
- Stage and commit the auth-related files as one logical unit.

Command purpose:
- git add src/auth/token.ts src/auth/middleware.ts: stage only the files for this commit.
- git commit -m "...": create the commit with the drafted Conventional Commit message.
```

---

## Workflow Overview

1. **Inspect** the repository state
2. **Analyze** changed files and their diffs
3. **Group** changes into logical commit units
4. **Draft** Conventional Commit messages
5. **Confirm** with the user (optional, based on context)
6. **Execute** the commits in order

---

## Step 1 — Inspect Repository State

```bash
# Check current branch and status
git status --short
git diff --stat
git diff --cached --stat
```

If nothing is staged, check for unstaged changes:

```bash
git diff --name-only
git ls-files --others --exclude-standard  # untracked files
```

If the working tree is completely clean, inform the user and stop.

---

## Step 2 — Analyze Changes

Read the actual diff for each changed file to understand _what_ changed, not just _that_ it changed:

```bash
# Unstaged changes
git diff -- <file>

# Staged changes
git diff --cached -- <file>

# Untracked file content
cat <file>
```

For each file, note:

- **What kind of file** it is (source code, test, config, docs, style, CI, build script)
- **What changed** (new function, bug fix, refactor, dependency update, etc.)
- **Which feature/module** it belongs to (infer from path and content)

---

## Step 3 — Group Changes into Logical Commits

Group files that belong together into a single commit. A good commit is **atomic**: it represents one self-contained change that could be reviewed or reverted independently.

### Grouping heuristics

| Signal                                  | Suggested grouping        |
| --------------------------------------- | ------------------------- |
| Same feature or module                  | One commit                |
| Independent bug fixes                   | Separate commits          |
| Test file + source file it tests        | Same commit               |
| Config/env changes                      | Separate `chore` commit   |
| Dependency lock file + package manifest | Same `chore(deps)` commit |
| Documentation update                    | Separate `docs` commit    |
| Style/formatting only                   | Separate `style` commit   |
| CI pipeline files                       | Separate `ci` commit      |
| Multiple unrelated features             | Separate `feat` commits   |

**Avoid:**

- Grouping unrelated files just because they're both modified
- Splitting a single feature across multiple commits
- Mixing `feat` and `fix` in the same commit

---

## Step 4 — Write Conventional Commit Messages

Each commit message follows the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) spec:

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | When to use                                                  |
| ---------- | ------------------------------------------------------------ |
| `feat`     | A new feature or capability                                  |
| `fix`      | A bug fix                                                    |
| `refactor` | Code restructured without behavior change                    |
| `perf`     | Performance improvement                                      |
| `test`     | Adding or updating tests                                     |
| `docs`     | Documentation only                                           |
| `style`    | Formatting, whitespace, missing semicolons — no logic change |
| `chore`    | Maintenance tasks: dependencies, tooling, config             |
| `build`    | Changes to build system or scripts                           |
| `ci`       | CI/CD pipeline changes                                       |
| `revert`   | Reverting a previous commit                                  |

### Scope

The scope is optional but recommended. Use the affected module, package, or feature area:

- `feat(auth):`, `fix(api):`, `chore(deps):`, `refactor(db):`
- Omit scope if change is truly global or spans many areas

### Subject line rules

- Imperative mood: "add", "fix", "update" — not "added" or "adds"
- No capital letter at the start
- No period at the end
- Max 72 characters

### Body (optional)

Add a body when the _why_ is not obvious from the subject:

```
refactor(cache): replace in-memory map with Redis

The previous implementation lost state on restart.
Redis allows cache to survive service restarts and
supports horizontal scaling.
```

### Breaking changes

Append `!` after the type/scope, and add `BREAKING CHANGE:` footer:

```
feat(api)!: remove v1 endpoints

BREAKING CHANGE: /api/v1/* routes have been removed.
Migrate to /api/v2/*.
```

---

## Step 5 — Confirm With User (When Appropriate)

Before executing, show the plan:

```
Proposed commits (3):

1. feat(auth): add JWT refresh token support
   Files: src/auth/token.ts, src/auth/middleware.ts

2. test(auth): add unit tests for token refresh
   Files: tests/auth/token.test.ts

3. chore(deps): update jsonwebtoken to v9
   Files: package.json, package-lock.json

Proceed? (yes / edit / cancel)
```

**Skip confirmation** if the user explicitly said "just commit" or "auto commit everything".

**Always confirm** if:

- There are more than 5 commits in the plan
- Any commit would be marked breaking (`!`)
- The grouping is ambiguous and you're not confident

---

## Step 6 — Execute Commits

For each commit group, stage only the relevant files then commit:

```bash
# Stage specific files for this commit
git add src/auth/token.ts src/auth/middleware.ts

# Commit with message
git commit -m "feat(auth): add JWT refresh token support"
```

For multiline messages:

```bash
git commit -m "refactor(cache): replace in-memory map with Redis

The previous implementation lost state on restart.
Redis allows cache to survive service restarts."
```

Execute commits **in dependency order**: base changes before dependent ones
(e.g., source code before tests, models before controllers).

---

## Edge Cases

**Binary files / assets**: Use `chore(assets):` or `feat(assets):` depending on whether they're new or updated. No diff analysis needed.

**Deleted files**: Treat as part of the feature/fix they belong to, or `refactor` if it's cleanup.

**Rename only**: Use `refactor(<scope>): rename X to Y`.

**Partial staging already done by user**: Respect it — only add to the staged set, never `git reset` without asking.

**Merge conflicts**: Do not proceed. Inform the user to resolve conflicts first.

**Empty diff (whitespace only)**: Use `style` type.

**Monorepo**: Use the package/app name as scope: `feat(web):`, `fix(api):`, `chore(shared):`.

---

## Output Quality Checklist

Before executing, verify each message:

- [ ] Type is one of the approved types
- [ ] Scope (if present) is lowercase and kebab-case
- [ ] Subject is imperative, lowercase, no trailing period
- [ ] Subject is under 72 characters
- [ ] Files in the group are logically related
- [ ] No unrelated files bundled together
- [ ] Breaking changes are flagged with `!` and a footer

---

## Example Outputs

```bash
# Good
git commit -m "feat(user): add profile picture upload"
git commit -m "fix(auth): handle expired token on refresh"
git commit -m "chore(deps): bump axios from 1.3.0 to 1.6.0"
git commit -m "docs(api): document rate limiting headers"
git commit -m "test(cart): add edge case for empty cart checkout"

# Bad — avoid these patterns
git commit -m "update stuff"
git commit -m "Fixed bug"
git commit -m "feat: added the new user profile picture upload feature."
git commit -m "changes"
```
