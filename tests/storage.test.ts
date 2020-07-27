import { LoggerAuth } from '../src/Logger';
import Storage, { StorageOptions } from '../src/Storage';

const options: StorageOptions = { filename: './output.txt' };
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

afterAll(() => {
  // Clear the log file after testing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (storage as any).logger.clear();
});
