# Working rules for Claude in this repo

The owner works locally in git worktrees on their PC. Cloud Claude sessions work in parallel through
GitHub. These rules keep the two from colliding.

## Branches

- Commit and push only to your own `claude/...` branch.
- Never push to `main`, and never push to, rebase, amend, force-push or delete any branch you did not create.
- Never merge into `main` and never open-and-merge a PR. Opening a PR is fine only when the owner asks; merging is always the owner's call.
- Never rewrite history on a shared branch. Merge commits only.

## Owner's work

- The owner's PC worktrees are out of reach and out of scope. Do not assume their unpushed state.
- Build only on what is pushed. If a task needs local work-in-progress, ask the owner to push it (a `wip/...` branch is fine) before starting.
- Do not rename, move or delete existing files or folders (including `b_39lk2Iw2hwX/` and `studio-ai-model/`) unless the task explicitly asks for it.

## Handoff

- End each piece of work with a pushed `claude/...` branch and a short summary of what changed and why.
- The owner reviews on the PC with a separate worktree, e.g. `git worktree add ../studio-ai-claude claude/<branch>`, and merges what they want.

## Safety

- Model weights and `.env` files stay out of the repo (see `.gitignore`). Never add, request or print API keys or secrets.
