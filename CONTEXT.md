# view.files

This repository owns three GAMS Views, released in one archive: `view-files`
(`views/view-files.js`), `files-rename` (`views/files-rename.js`) and
`files-default` (`views/files-default.js`). Each is registered separately in
Project Config. `src/` owns deployment files; packaging strips that prefix.
The Host supplies `/core`, `/util`, `/widgets`, styling and runtime services.
Filesystem and UI Service dependencies remain separate.

GitHub Releases distribute ZIPs, not npm packages. Documentation uses
justgook/wiki v1.4.0 locally and on GitHub Pages. A maintainer commit constitutes
approval; its matching version tag triggers publication. No approval-digest
variables or special release branch are required. No `unit.json` is generated.

Original extraction records remain historical, not build/release gates; see
NOTES.md. The imported View source behavior and deployment paths are unchanged.
