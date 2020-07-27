import File from './File';
import Checksum, { algorithm } from '../encryption/Checksum';

/**
 * Represents a file that has a validator checksum file
 */
class ChecksumDependentFile extends File {
  /**
   * The checksum file for this file
   */
  private checksum: File;

  /**
   * The name of the checksum file
   */
  protected readonly checksumName: string;

  constructor(filename: string) {
    super(filename);

    this.checksumName = `${this.filename}.${algorithm}`;
    this.checksum = new File(this.checksumName);
  }

  /**
   * @inheritDoc
   */
  public async clear(): Promise<void> {
    await this.checksum.clear();
    return super.clear();
  }

  /**
   * @inheritDoc
   */
  public async write(data: string): Promise<void> {
    await this.writeChecksum(data);
    return super.write(data);
  }

  /**
   * Reads the content of this file.
   * Throws an error if the checksum for this file does not match the read content
   * @returns {Promise<string>}
   */
  public async read(): Promise<string> {
    const content = await super.read();

    if (
      (await this.checksum.exists()) &&
      (await this.checksum.read()) !== Checksum.generate(content)
    ) {
      throw new Error(`The checksum file for ${this.filename} does not match!`);
    }

    return content;
  }

  /**
   * Writes a checksum file with the given file content
   * @param {string} data The file content
   * @returns {Promise<void>}
   */
  protected writeChecksum(data: string): Promise<void> {
    return this.checksum.write(Checksum.generate(data));
  }
}

export default ChecksumDependentFile;
