# File Views

File browser and popup Views for [GAMS](https://github.com/kkgams/gams), distributed together in `view.files.zip`.

| View ID | Source → deployment path | Purpose | Screenshot | License / original work |
| --- | --- | --- | --- | --- |
| `view-files` | `src/views/view-files.js` → `views/view-files.js` | Browse/manage files and open/save selection | Not available | [Apache-2.0](LICENSE), [NOTICE](NOTICE); [kkgams](https://github.com/kkgams) |
| `files-rename` | `src/views/files-rename.js` → `views/files-rename.js` | Create/rename files and folders | Not available | [Apache-2.0](LICENSE), [NOTICE](NOTICE); [kkgams](https://github.com/kkgams) |
| `files-default` | `src/views/files-default.js` → `views/files-default.js` | Fallback file metadata | Not available | [Apache-2.0](LICENSE), [NOTICE](NOTICE); [kkgams](https://github.com/kkgams) |

Register each View separately using the same explicitly tagged archive URL and its `#views/<filename>.js` fragment. Do not install the older separate popup archives alongside this archive: their paths overlap. Existing release assets retain their original names.

Requires a compatible Host, `plugin.fs`, `ui.popup` and `ui.toast`. The Host supplies `/core`, `/util`, `/widgets` and theme styling; these are not bundled. Retain LICENSE and NOTICE when installing the Views.

## Development

Requires Make, Node.js 24+, Python 3 (stdlib), Git, curl, tar, unzip, zip and shasum. No package installation or compilation is needed. Local `gams.json` uses canonical source and pinned released dependencies, without sibling checkouts.

| Command | Purpose |
| --- | --- |
| `make open` | Open local `gams.json` in the released Host; download it only if absent (macOS Apple Silicon) |
| `make tools/gams.app` | Download the Host and accompanying notices without launching it |
| `make test` | Check View syntax and the fallback metadata filesystem-call regression |
| `make package` | Build incremental `build.nosync/view.files.zip` and `SHA256SUMS` |
| `make serve-docs` | Preview the pinned wiki; `DOCS_PORT` defaults to 8080 |
| `make docs` | Build the wiki into `build.nosync/site/` |
| `make validate-docs` | Validate wiki content |
| `make clean` | Remove `build.nosync/`, `tools/gams.app`, `tools/gams-release-notices` and downloaded `gams_modules/`; refuse tracked targets or directory symlinks |

First launch needs network access. Existing Host downloads are not updated implicitly; macOS security checks remain intact. Build output, temporary downloads and the pinned justgook/wiki v1.4.0 engine stay under ignored `build.nosync/`. Tests do not establish native Host integration or theme rendering.
