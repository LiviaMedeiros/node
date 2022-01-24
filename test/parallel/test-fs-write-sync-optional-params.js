'use strict';

require('../common');
const fs = require('fs');
const path = require('path');
const tmpdir = require('../common/tmpdir');
const assert = require('assert');

tmpdir.refresh();

const dest = path.resolve(tmpdir.path, 'tmp.txt');
const buffer = Buffer.from('zyx');

{
  let fd = fs.openSync(dest, 'w+');

  assert.throws(() => {
    fs.writeSync(fd, {}); // Missing buffer, {} is second argument
  }, {
    code: 'ERR_INVALID_ARG_TYPE',
    name: 'TypeError',
    message: 'The "buffer" argument must be of type string or an instance ' +
      'of Buffer, TypedArray, or DataView. Received an instance of Object'
  });
  assert.throws(() => {
    fs.writeSync(fd, buffer, { length: 5 });
  }, {
    code: 'ERR_OUT_OF_RANGE',
    name: 'RangeError',
    message: 'The value of "length" is out of range. ' +
      'It must be <= 3. Received 5'
  });
  assert.throws(() => {
    fs.writeSync(fd, buffer, { offset: 5 });
  }, {
    code: 'ERR_OUT_OF_RANGE',
    name: 'RangeError',
    message: 'The value of "offset" is out of range. ' +
      'It must be <= 3. Received 5'
  });
  assert.throws(() => {
    fs.writeSync(fd, buffer, { offset: 1 });
  }, {
    code: 'ERR_OUT_OF_RANGE',
    name: 'RangeError',
    message: 'The value of "length" is out of range. ' +
      'It must be <= 2. Received 3'
  });
  assert.throws(() => {
    fs.writeSync(fd, buffer, { length: 1, offset: 3 });
  }, {
    code: 'ERR_OUT_OF_RANGE',
    name: 'RangeError',
    message: 'The value of "length" is out of range. ' +
      'It must be <= 0. Received 1'
  });
  assert.throws(() => {
    fs.writeSync(fd, buffer, { length: -1 });
  }, {
    code: 'ERR_OUT_OF_RANGE',
    name: 'RangeError',
    message: 'The value of "length" is out of range. ' +
      'It must be >= 0. Received -1'
  });
  assert.throws(() => {
    fs.writeSync(fd, buffer, { offset: -1 });
  }, {
    code: 'ERR_OUT_OF_RANGE',
    name: 'RangeError',
    message: 'The value of "offset" is out of range. ' +
      'It must be >= 0 && <= 9007199254740991. Received -1'
  });

  fs.closeSync(fd);

  for (const params of [
    {},
    { length: 1 },
    { position: 5 },
    { length: 1, position: 5 },
    { length: 1, position: -1, offset: 2 },
    { length: null },
  ]) {
    fd = fs.openSync(dest, 'w+');
    const bytesWritten = fs.writeSync(fd, buffer, params);
    const bytesRead = fs.writeSync(fd, buffer, params);

    // Test compatibility with fs.readSync counterpart with reused params
    assert.strictEqual(bytesWritten, bytesRead);
    if (params.length !== undefined && params.length !== null) {
      assert.strictEqual(bytesWritten, params.length);
    }
    fs.closeSync(fd);
  }
}
