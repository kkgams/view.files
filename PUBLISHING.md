# Publishing

A maintainer commit is approval. A matching `vMAJOR.MINOR.PATCH` tag triggers the
template-based release workflow, which tests, validates docs and packages that
checkout, then creates a GitHub Release with one ZIP and SHA256SUMS. No special
release branch, approval-digest variables, npm publishing or custom secrets are
required. Existing releases must not be overwritten or published tags moved.

For the prepared 1.0.0 commit, create `v1.0.0` only when tagging is authorized.
Push that commit and tag only when remote publication is authorized. Preparation
alone does not push or publish. See README.md for checks and version rules.

The archive contains all three `views/*.js` entries plus LICENSE, NOTICE,
README.md and NOTES.md; there is no `unit.json`. Existing example release pins
and old popup archives are not migrated automatically. Configure each View
with its entry fragment from the same new archive. Never install the old popup
archives alongside it, because deployment paths overlap.

GitHub Pages must use GitHub Actions as its source to deploy the minimal wiki
on default-branch pushes. Local packaging does not require Pages configuration.
