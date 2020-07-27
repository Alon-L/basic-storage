import { Storage } from '../src';

(async function () {
  const storage = await new Storage({}, { password: 'A', salt: 'A' }).load();

  console.log(storage.hasItem('a'));

  await storage.setItem('a', 1);
  await storage.setItem('b', 2);
})();
