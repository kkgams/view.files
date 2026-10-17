---
title: File Views
status: reference
---

# File Views

`view.files` provides three GAMS Views in one release archive. `view-files`
(`views/view-files.js`) browses Project files and folders, supports open/save
selection, and offers creation, upload, download, editing and deletion actions.
`files-rename` (`views/files-rename.js`) is its popup for creating or renaming
files and folders. `files-default` (`views/files-default.js`) displays file
metadata when no specialized editor is available.

Register each View separately in the external Project, using the same
`view.files-1.0.0.zip` release URL with the corresponding `#views/...` entry
fragment. The Views require a compatible GAMS Host, `plugin.fs`, and the
`ui.popup` and `ui.toast` services; Host libraries and styling are not bundled.
The archive includes LICENSE, NOTICE, README.md and NOTES.md, without
`unit.json`. See the [repository README](https://github.com/kkgams/view.files#readme)
for checks and release commands.
