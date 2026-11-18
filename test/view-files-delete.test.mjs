import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import test from 'node:test'

const source = await readFile(new URL('../src/views/view-files.js', import.meta.url), 'utf8')

function fixture() {
  const prompts = [], removals = []
  const view = vm.runInNewContext(`${source.replace(/^import .*\n/gm, '').replace('export class ', 'class ')}\nnew ViewFiles()`, {
    HTMLElement: class { getAttribute() { return null } },
    customElements: { get: () => true },
    runtime: {
      call(method, { message }) {
        assert.equal(method, 'ui.toast.confirm')
        assert.equal(message, 'Delete file "note.txt"?')
        return new Promise(resolve => prompts.push(value => resolve({ ok: value })))
      },
      async invoke(method, path) {
        assert.equal(path, 'note.txt')
        if (method === 'fs/fs::stat') return { ok: { type: 'regular-file' } }
        assert.equal(method, 'fs/fs::remove-file')
        return new Promise((resolve, reject) => removals.push({ resolve, reject }))
      },
    },
    unwrap: response => response.ok,
    viewOk: () => ({ ok: true }),
  })
  view.selectedPath = 'note.txt'
  view.selectedPaths.add('note.txt')
  view.getEntry = path => ({ path, name: path, type: 'regular-file' })
  view.setStatus = () => {}
  view.refresh = async () => {}
  return { view, prompts, removals }
}

test('Delete opens one prompt across toolbar and shortcut, and Cancel allows a retry', async () => {
  const { view, prompts, removals } = fixture()
  const click = view.deleteSelected()
  const shortcut = view.createViewPluginMethods().tool_2()
  assert.equal(prompts.length, 1)
  prompts[0](false)
  await Promise.all([click, shortcut])
  assert.equal(removals.length, 0)
  assert.equal(view.selectedPath, 'note.txt')
  const retry = view.deleteSelected()
  assert.equal(prompts.length, 2)
  prompts[1](true)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(removals.length, 1)
  await view.createViewPluginMethods().tool_2()
  assert.equal(prompts.length, 2)
  removals[0].resolve({ ok: null })
  await retry
  assert.equal(view.selectedPath, null)
})

test('a failed deletion does not prevent the next attempt', async () => {
  const { view, prompts, removals } = fixture()
  const attempt = view.deleteSelected()
  prompts[0](true)
  await new Promise(resolve => setImmediate(resolve))
  removals[0].reject(new Error('fixture removal failed'))
  await assert.rejects(attempt, /fixture removal failed/)
  const retry = view.deleteSelected()
  assert.equal(prompts.length, 2)
  prompts[1](false)
  await retry
})
