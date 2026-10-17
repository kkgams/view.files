# Notes

## 1.0.0 preparation

The file browser and both popup Views are packaged together. Popup sources and
the default-View positional filesystem-call regression were imported unchanged
from `view.files-rename` and `view.files-default`; the older repositories and
existing pinned example releases are untouched.

Release tooling, workflows, Make targets and wiki setup follow `template.view`.
The owner approved commit-based authorization, removal of approval-digest and
release-branch gates, omission of `unit.json`, version 1.0.0, and minimal docs.
The ZIP includes all of `src/` plus LICENSE, NOTICE, README.md and this file.
No Host, example Project, separate popup archive or npm dependency is bundled.

Original NOTICE, NOTICE-EVIDENCE.json and SOURCE.json from all three input
repositories are retained under `provenance/`. Root SOURCE.json and
NOTICE-EVIDENCE.json preserve the earlier extraction/consolidation history;
they are not current-tree certification, publication gates or archive inputs.
License terms and source bytes are unchanged. No new legal audit is claimed.

Local checks cover syntax/import closure, the fallback metadata regression,
release packaging, checksums, reproducibility and documentation validity.
They do not establish GUI/native Host integration or hosted CI results.
