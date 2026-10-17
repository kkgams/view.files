import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

const calls = []
const errors = []
const context = vm.createContext({
  HTMLElement: class {},
  customElements: { get: () => true },
  console: { error: (...args) => errors.push(args) },
  // Match the Host's positional runtime.invoke(target, ...args) contract.
  runtime: {
    async invoke(target, ...args) {
      calls.push({ target, args })
      assert.equal(target, 'fs/fs::stat')
      assert.equal(args.length, 1)
      if (typeof args[0] !== 'string') throw new Error('expected string')
      return { ok: { type: 'regular-file', size: 42 } }
    },
  },
  unwrap: result => result.ok,
})

// Evaluate the real View without resolving browser-only Host imports.
const source = await readFile(new URL('../src/views/files-default.js', import.meta.url), 'utf8')
vm.runInContext(
  source.replace(/^import .*\n/gm, '').replace('export class ', 'class '),
  context,
)
const view = vm.runInContext('new FilesDefault()', context)
view.path = 'assets/unregistered.xyz'
view.tableElement = { innerHTML: '' }
const statuses = []
view.setStatus = (text, tone) => statuses.push({ text, tone })
let rows
view.renderTable = value => { rows = value }

await view.load()

assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
  { target: 'fs/fs::stat', args: ['assets/unregistered.xyz'] },
])
assert.deepEqual(statuses.at(-1), { text: 'Ready', tone: 'success' })
assert.equal(rows.find(([label]) => label === 'Size')[1], '42 B')
assert.equal(errors.length, 0)
console.log('files-default passes a positional path and loads file metadata')
