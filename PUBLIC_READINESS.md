# Public-readiness audit

Audit date: 2026-08-01  
Repository: BryanHarrisScripts/Afterglow  
Audited branch: main

## Outcome

Blocked. Do not change this repository to public yet.

The security baseline in this branch can pass independently; that green check does not certify the repository for publication.

## Findings addressed by this branch

- The repository had no private vulnerability reporting policy, code of conduct or rights-aware contribution policy.
- Local credentials, certificates, backups and user-specific files were not comprehensively ignored.
- The storyboard export workflow used movable action tags. External actions are now pinned to reviewed full commit SHAs.
- No automated check prevented recognizable API keys, private-key blocks, unsafe workflow permissions, pull_request_target or movable external action references.
- No explicit policy required an asset-by-asset publication basis.

## Current-tree credential review

Targeted searches of the indexed main branch did not identify a recognizable live OpenAI, GitHub, Google, AWS or Slack credential or a committed private-key block.

This is not proof that reachable Git history is clean. Secret scanning and a history review are required before publication.

## Publication blockers

1. Licence conflict: README states CC BY-SA 4.0, which permits commercial reuse, while LICENSE contains CC BY-NC-SA 4.0, which prohibits commercial reuse. The owner must choose one canonical scope and align README, LICENSE, contribution terms and per-asset notices.
2. Personal contact information: a legacy Final Draft source title page and its matching PDF contain a personal phone number. Because the value also exists in Git history, a normal deletion commit is insufficient. Sanitize the source and generated document, rewrite reachable history, expire cached copies where possible, and verify from a fresh clone before publication.
3. Asset rights: the repository is roughly 1 GB and contains extensive image and document material. Complete an asset inventory using ASSET_POLICY.md and remove or privately archive anything without a clear publication basis.
4. Legacy links: README and supporting files still link to earlier repository names and external locations. Verify that every public link resolves to intended, lawfully shareable material.
5. Historical privacy: inspect prior commits, pull-request references, generated PDFs, Final Draft metadata and media metadata for names, contact details, credentials and private notes.
6. Repository size: decide whether large media belongs in Git LFS, a release archive or a separate rights-cleared asset repository before inviting public forks.

## GitHub settings required after blockers are cleared

- Protect main with an active ruleset requiring pull requests, status checks and resolved conversations; block deletion and force pushes.
- Set Actions permissions to read-only by default and require approval for outside-collaborator workflows.
- Enable dependency graph, secret scanning, push protection, CodeQL where applicable and private vulnerability reporting.
- Review collaborators and deploy keys; restrict administrator access.
- Verify the repository while signed out before announcing it as public.

## Publication decision

The owner must explicitly confirm both the canonical Creative Commons licence and that the asset-rights inventory is complete. Until then, keep repository visibility private.
