import ChecksumDependentFile from './ChecksumDependentFile';
import Storage from '../Storage';
import Decrypt from '../encryption/Decrypt';
import Encrypt from '../encryption/Encrypt';

/**
 * Represents a storage file
 */
class StorageFile extends ChecksumDependentFile {
  /**
   * The storage instance associated to this file
   */
  private readonly storage: Storage;

  private readonly encrypt: Encrypt;
  private readonly decrypt: Decrypt;

  constructor(storage: Storage, filename: string) {
    super(filename);

    this.storage = storage;

    this.encrypt = new Encrypt(this.storage.key, this.storage.options.encryption);
    this.decrypt = new Decrypt(this.storage.key, this.storage.options.encryption);
  }

  /**
   * Encrypts the data and writes it to the file
   * @param {string} data The data to write
   * @returns {Promise<void>}
   */
  public write(data: string): Promise<void> {
    return super.write(this.encrypt.string(data));
  }

  /**
   * Decrypts the file content and returns it
   * @returns {Promise<string>}
   */
  public async read(): Promise<string> {
    const content = await super.read();

    return this.decrypt.string(content);
  }
}

export default StorageFile;
