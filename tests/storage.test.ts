import assert = require('assert');
import { LoggerAuth } from '../src/Logger';
import Storage, { StorageOptions } from '../src/Storage';

const options: StorageOptions = {};
const auth: LoggerAuth = { password: 'HelloWorld!', salt: 'salt' };

let storage: Storage;

beforeEach(() => {
  // Initialize a new storage after every test
  storage = new Storage(options, auth);
});

test('storage setItem', () => {
  storage.setItem('a', 1);
  storage.setItem('b', 2);
  storage.setItem('c', 3);
  storage.setItem('d', '\n');

  expect(storage.getItem('a')).toBe(1);
  expect(storage.getItem('b')).toBe(2);
  expect(storage.getItem('c')).toBe(3);
});

test('storage getItem', () => {
  storage.setItem('a', 1);

  expect(storage.getItem('a')).toBe(1);
  expect(storage.getItem('b')).toBeNull();
});

test('storage hasItem', () => {
  storage.setItem('a', 1);

  expect(storage.hasItem('a')).toBeTruthy();
  expect(storage.hasItem('b')).toBeFalsy();
});

test('storage removeItem', () => {
  storage.setItem('a', 1);

  expect(storage.hasItem('a')).toBeTruthy();

  storage.removeItem('a');

  expect(storage.hasItem('a')).toBeFalsy();
});

test('storage load', async () => {
  await storage.setItem('a', 1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (storage as any).cache.delete('a');

  expect(storage.hasItem('a')).toBeFalsy();

  await storage.load();

  expect(storage.getItem('a')).toBe(1);
});

test('storage toJSON', () => {
  storage.setItem('a', 1);
  storage.setItem('b', 2);

  const json = storage.toJSON();

  expect(json['a']).toBe(1);
  expect(json['b']).toBe(2);
});

test('storage save', async () => {
  await storage.setItem('a', 1);
  await storage.setItem('b', 2);
  await storage.setItem('c', 3);

  await storage.saveJSON();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = await (storage as any).file.read();
  const parsed = JSON.parse(content);

  assert.deepStrictEqual(parsed, storage.toJSON());

  expect(parsed['a']).toBe(1);
  expect(parsed['b']).toBe(2);
  expect(parsed['c']).toBe(3);
});

afterEach(async () => {
  // Clear the log file after every test
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (storage as any).logger.file.clear();
});
