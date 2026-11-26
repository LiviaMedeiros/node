'use strict';

// This test ensures that the synchronous fs methods are available without
// `Sync` suffixes on `node:fs/synchronous`

const common = require('../common');
const assert = require('node:assert');
const fs = require('node:fs');
const fsSynchronous = require('node:fs/synchronous');
const tmpdir = require('../common/tmpdir');
const { spawnSyncAndExitWithoutError } = require('../common/child_process');

tmpdir.refresh();

assert.strictEqual(require('fs/synchronous'), fsSynchronous);

const names = Object.keys(fsSynchronous).sort();
const expectedNames = Object.keys(fs)
  .filter((name) => name.endsWith('Sync') || name === 'constants')
  .map((name) => name.replace(/Sync$/, ''))
  .sort();
assert.deepStrictEqual(names, expectedNames);

for (const name of names) {
  if (name === 'constants') continue;
  assert.strictEqual(fsSynchronous[name], fs[`${name}Sync`], name);
}

assert.strictEqual(fsSynchronous.realpath.native, fs.realpathSync.native);

const filePath = tmpdir.resolve('synchronous.txt');
fsSynchronous.writeFile(filePath, 'blep');
assert.strictEqual(fsSynchronous.readFile(filePath, 'utf8'), 'blep');
assert.strictEqual(fsSynchronous.exists(filePath), true);
assert.deepStrictEqual(fsSynchronous.readdir(tmpdir.path), ['synchronous.txt']);
assert.strictEqual(fsSynchronous.stat(filePath).isFile(), true);

const dir = fsSynchronous.opendir(tmpdir.path);
try {
  assert.ok(dir instanceof fs.Dir);
} finally {
  dir.closeSync();
}

// Check that monkey-patching works
{
  const originalReadSync = fs.readSync;
  fs.readSync = common.mustCall(function(...args) {
    return originalReadSync.apply(this, args);
  }, 1);
  try {
    assert.strictEqual(fsSynchronous.readFile(filePath).toString(), 'blep');
  } finally {
    fs.readSync = originalReadSync;
  }
}

// Check that `node:fs/synchronous` works without loading `node:fs`
spawnSyncAndExitWithoutError(process.execPath, [
  '--input-type=module',
  '--eval',
  `import assert from 'node:assert';
   import fsSynchronous from 'node:fs/synchronous';
   import { readFile, writeFile, unlink } from 'node:fs/synchronous';
   const file = 'synchronous-esm.txt';
   assert.strictEqual(fsSynchronous.readFile, readFile);
   writeFile(file, 'blop');
   assert.strictEqual(readFile(file, 'utf8'), 'blop');
   unlink(file);`,
], { cwd: tmpdir.path });
