'use strict';

const common = require('../common');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const tmpdir = require('../common/tmpdir');
const assert = require('assert');

tmpdir.refresh();

const dest = path.resolve(tmpdir.path, 'tmp.txt');
const buffer = Buffer.from('zyx');

(async () => {
  let fh = await fsPromises.open(dest, 'w+');

  assert.rejects(async () => {
    await fh.write(
      {}
    );
  }, {
    code: 'ERR_INVALID_ARG_TYPE',
    name: 'TypeError',
    message: 'The "buffer" argument must be an instance of Buffer, ' +
      'TypedArray, or DataView. Received undefined'
  });
  assert.rejects(async () => {
    await fh.write(
      { buffer: 'abc' }
    );
  }, {
    code: 'ERR_INVALID_ARG_TYPE',
    name: 'TypeError',
    message: 'The "buffer" argument must be an instance of Buffer, ' +
      'TypedArray, or DataView. Received type string (\'abc\')'
  });
  assert.rejects(async () => {
    await fh.write(
      { buffer, length: 5 }
    );
  }, {
    code: 'ERR_OUT_OF_RANGE',
    name: 'RangeError',
    message: 'The value of "length" is out of range. ' +
      'It must be <= 3. Received 5'
  });
  assert.rejects(async () => {
    await fh.write(
      { buffer, offset: 5 }
    );
  }, {
    code: 'ERR_OUT_OF_RANGE',
    name: 'RangeError',
    message: 'The value of "offset" is out of range. ' +
      'It must be <= 3. Received 5'
  });
  assert.rejects(async () => {
    await fh.write(
      { buffer, offset: 1 }
    );
  }, {
    code: 'ERR_OUT_OF_RANGE',
    name: 'RangeError',
    message: 'The value of "length" is out of range. ' +
      'It must be <= 2. Received 3'
  });
  assert.rejects(async () => {
    await fh.write(
      { buffer, length: 1, offset: 3 }
    );
  }, {
    code: 'ERR_OUT_OF_RANGE',
    name: 'RangeError',
    message: 'The value of "length" is out of range. ' +
      'It must be <= 0. Received 1'
  });
  assert.rejects(async () => {
    await fh.write(
      { buffer, length: -1 }
    );
  }, {
    code: 'ERR_OUT_OF_RANGE',
    name: 'RangeError',
    message: 'The value of "length" is out of range. ' +
      'It must be >= 0. Received -1'
  });
  assert.rejects(async () => {
    await fh.write(
      { buffer, offset: -1 }
    );
  }, {
    code: 'ERR_OUT_OF_RANGE',
    name: 'RangeError',
    message: 'The value of "offset" is out of range. ' +
      'It must be >= 0 && <= 9007199254740991. Received -1'
  });

  await fh.close();

  for (const params of [
    { buffer },
    { buffer, length: 1 },
    { buffer, position: 5 },
    { buffer, length: 1, position: 5 },
    { buffer, length: 1, position: -1, offset: 2 },
    { buffer, length: null },
  ]) {
    fh = await fsPromises.open(dest, 'w+');
    const writeResult = await fh.write(params);
    const writeBufCopy = Uint8Array.prototype.slice.call(writeResult.buffer);
    const readResult = await fh.read(params);
    const readBufCopy = Uint8Array.prototype.slice.call(readResult.buffer);

    // Test compatibility with filehandle.read counterpart with reused params
    assert.ok(writeResult.bytesWritten >= readResult.bytesRead);
    if (params.length !== undefined && params.length !== null) {
      assert.strictEqual(writeResult.bytesWritten, params.length);
    }
    if (params.offset === undefined || params.offset === 0) {
      assert.deepStrictEqual(writeBufCopy, readBufCopy);
    }
    assert.deepStrictEqual(writeResult.buffer, readResult.buffer);
    await fh.close();
  }
})().then(common.mustCall());
