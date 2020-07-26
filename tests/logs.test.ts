import Logger from '../src/Logger';

const logger = new Logger({ filename: './output.txt' }, { password: 'HelloWorld!', salt: 'salt' });

const logs = ['Hello!', 'Hello 2!', 'Hello 3!'];

test('logs write & read', async () => {
  for (const log of logs) {
    await logger.write(log);
  }

  const read = logger.read();

  expect((await read.next()).value).toBe(logs[0]);
  expect((await read.next()).value).toBe(logs[1]);
  expect((await read.next()).value).toBe(logs[2]);
  expect((await read.next()).done).toBeTruthy();

  await logger.clear();
});
