import { Logger } from '../src';
import { algorithm, encoding, separator, genKey } from '../src/encryption';

const logger = new Logger(
  { filename: './db.logs' },
  { algorithm, encoding, separator },
  genKey('HelloWorld!', 'salt', algorithm.keylen),
);

const logs = ['Hello!', 'Hello 2!', 'Hello 3!'];

test('logs write & read', async () => {
  for (const log of logs) {
    await logger.write(log);
  }

  const read = logger.read();

  expect((await read.next()).value).toBe(logs[2]);
  expect((await read.next()).value).toBe(logs[1]);
  expect((await read.next()).value).toBe(logs[0]);
  expect((await read.next()).done).toBeTruthy();
});

afterAll(async () => {
  await logger.file.clear();
});
