import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import test from 'node:test'

const source = await readFile(new URL('../src/views/files-rename.js', import.meta.url), 'utf8')

async function renameFixture(kind, entries, failure) {
  const files = new Map(entries)
  const calls = []
  const popups = []
  const statuses = []
  const errors = []
  const context = vm.createContext({
    HTMLElement: class {},
    customElements: { get: () => true },
    console: { error: (...args) => errors.push(args) },
    // Match the Host's strict WIT result contract, including ok: undefined.
    unwrap(result, label = 'unknown') {
      if (result && Object.hasOwn(result, 'ok')) return result.ok
      if (result && Object.hasOwn(result, 'err')) throw new Error(`${label}: ${result.err}`)
      throw new Error(`${label}: expected WIT result object`)
    },
    runtime: {
      async invoke(target, ...args) {
        assert.match(target, /^fs\/fs::/)
        const method = target.slice('fs/fs::'.length)
        assert.equal(args.length, method === 'rename' ? 2 : 1)
        for (const path of args) assert.equal(typeof path, 'string')
        calls.push({ method, args })
        const [path, destination] = args
        if (failure?.method === method && failure.path === path) return { err: failure.message }
        switch (method) {
          case 'stat':
            return files.has(path)
              ? { ok: { type: files.get(path) === null ? 'directory' : 'regular-file' } }
              : { err: `not found: ${path}` }
          case 'list':
            assert.equal(files.get(path), null)
            return { ok: [...files.keys()]
              .filter(key => key.startsWith(`${path}/`) && !key.slice(path.length + 1).includes('/'))
              .map(key => ({ name: key.slice(path.length + 1) })) }
          case 'create-dir':
            assert.equal(files.has(path), false)
            files.set(path, null)
            return { ok: undefined }
          case 'rename':
            assert.equal(files.has(path), true)
            assert.equal(files.has(destination), false)
            files.set(destination, files.get(path))
            files.delete(path)
            return { ok: undefined }
          case 'remove-dir':
            assert.equal(files.get(path), null)
            assert.equal([...files.keys()].some(key => key.startsWith(`${path}/`)), false)
            files.delete(path)
            return { ok: undefined }
          default:
            assert.fail(`unexpected filesystem method: ${method}`)
        }
      },
      async call(target, payload) {
        assert.equal(target, 'ui.popup.close')
        popups.push(JSON.parse(JSON.stringify(payload)))
        return { ok: undefined }
      },
    },
  })
  // Evaluate the real View, replacing only browser-only import resolution.
  vm.runInContext(source.replace(/^import .*\n/gm, '').replace('export class ', 'class '), context)
  const view = vm.runInContext('new FileRename()', context)
  view.popupProps = { mode: 'rename', kind, targetPath: 'assets/old' }
  view.nameInput = { value: 'new', classList: { add() {}, remove() {} }, focus() {} }
  view.setStatus = (text, tone) => statuses.push({ text, tone })
  return { view, files, calls, popups, statuses, errors }
}

const nested = [
  ['assets/old', null],
  ['assets/old/top.txt', 'top bytes'],
  ['assets/old/child', null],
  ['assets/old/child/deep', null],
  ['assets/old/child/deep/data.bin', 'nested bytes'],
  ['assets/old/empty', null],
]

for (const [kind, entries] of [['file', [['assets/old', 'file bytes']]], ['directory', nested]]) {
  test(`${kind} rename moves contents and resolves the popup without a status error`, async () => {
    const { view, files, popups, statuses, errors } = await renameFixture(kind, entries)
    // save exercises the actual FileRename.rename and its normal error reporting.
    await view.save()
    assert.deepEqual(popups, [{
      reload: true, mode: 'rename', kind,
      selectedPath: 'assets/new', revealPath: '/assets',
    }])
    assert.deepEqual([...files], entries.map(([path, value]) => [path.replace('assets/old', 'assets/new'), value]))
    assert.equal(statuses.some(({ tone }) => tone === 'danger'), false)
    assert.deepEqual(errors, [])
  })

  test(`${kind} rename rejects an existing destination without mutation`, async () => {
    const initial = [...entries, ['assets/new', kind === 'directory' ? null : 'destination bytes']]
    const { view, files, calls, popups, statuses } = await renameFixture(kind, initial)
    await assert.rejects(view.rename('new'), /Path already exists: assets\/new/)
    assert.deepEqual([...files], initial)
    assert.deepEqual(calls, [{ method: 'stat', args: ['assets/new'] }])
    assert.deepEqual(popups, [])
    assert.deepEqual(statuses, [])
  })
}

for (const [kind, entries, method, path] of [
  ['file', [['assets/old', 'file bytes']], 'rename', 'assets/old'],
  ['directory', nested, 'list', 'assets/old'],
  ['directory', nested, 'stat', 'assets/old/top.txt'],
]) {
  test(`${kind} rename propagates the guest ${method} error without popup success`, async () => {
    const message = `guest ${method} denied`
    const { view, files, popups } = await renameFixture(kind, entries, { method, path, message })
    await assert.rejects(view.rename('new'), { message: `unknown: ${message}` })
    for (const [sourcePath, value] of entries) assert.equal(files.get(sourcePath), value)
    assert.deepEqual(popups, [])
  })
}
