import { mustNotMutate } from '../common/index.mjs';
import assert from 'node:assert';

// Test common.mustNotMutate()

const original = {
  foo: { bar: 'baz' },
  qux: null,
  quux: [
    'quuz',
    { corge: 'grault' },
  ],
};

// Wrapper for convenience
const obj = () => mustNotMutate(original);

function testOriginal(root) {
  assert.deepStrictEqual(root, original);
  return root.foo.bar === 'baz' && root.quux[1].corge.length === 6;
}

function definePropertyOnRoot(root) {
  Object.defineProperty(root, 'xyzzy', {});
}

function definePropertyOnFoo(root) {
  Object.defineProperty(root.foo, 'xyzzy', {});
}

function deletePropertyOnRoot(root) {
  delete root.foo;
}

function deletePropertyOnFoo(root) {
  delete root.foo.bar;
}

function preventExtensionsOnRoot(root) {
  Object.preventExtensions(root);
}

function preventExtensionsOnFoo(root) {
  Object.preventExtensions(root.foo);
}

function preventExtensionsOnRootViaSeal(root) {
  Object.seal(root);
}

function preventExtensionsOnFooViaSeal(root) {
  Object.seal(root.foo);
}

function preventExtensionsOnRootViaFreeze(root) {
  Object.freeze(root);
}

function preventExtensionsOnFooViaFreeze(root) {
  Object.freeze(root.foo);
}

function setOnRoot(root) {
  root.xyzzy = 'gwak';
}

function setOnFoo(root) {
  root.foo.xyzzy = 'gwak';
}

function setQux(root) {
  root.qux = 'gwak';
}

function setQuux(root) {
  root.quux.push('gwak');
}

function setQuuxItem(root) {
  root.quux[0] = 'gwak';
}

function setQuuxProperty(root) {
  root.quux[1].corge = 'gwak';
}

function setPrototypeOfRoot(root) {
  Object.setPrototypeOf(root, Array);
}

function setPrototypeOfFoo(root) {
  Object.setPrototypeOf(root.foo, Array);
}

function setPrototypeOfQuux(root) {
  Object.setPrototypeOf(root.quux, Array);
}


{
  assert.ok(testOriginal(obj()));

  assert.throws(
    () => definePropertyOnRoot(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => definePropertyOnFoo(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => deletePropertyOnRoot(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => deletePropertyOnFoo(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => preventExtensionsOnRoot(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => preventExtensionsOnFoo(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => preventExtensionsOnRootViaSeal(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => preventExtensionsOnFooViaSeal(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => preventExtensionsOnRootViaFreeze(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => preventExtensionsOnFooViaFreeze(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => setOnRoot(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => setOnFoo(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => setQux(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => setQuux(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => setQuux(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => setQuuxItem(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => setQuuxProperty(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => setPrototypeOfRoot(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => setPrototypeOfFoo(obj()),
    { code: 'ERR_ASSERTION' }
  );
  assert.throws(
    () => setPrototypeOfQuux(obj()),
    { code: 'ERR_ASSERTION' }
  );

  // Test that no mutation happened
  assert.ok(testOriginal(obj()));
}
