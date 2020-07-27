# basic-storage ![Version](https://img.shields.io/npm/v/basic-storage) ![Node Version](https://img.shields.io/node/v/basic-storage) ![Test](https://github.com/Alon-L/basic-storage/workflows/Test/badge.svg) ![Deploy](https://github.com/Alon-L/basic-storage/workflows/Deploy/badge.svg)
Lite and efficient Node.JS LocalStorage implementation.

Store data locally easily and securely with a simple, yet powerful API.

## Usage
```js
const { Storage } = require('basic-storage');

const storage = new Storage({ password: 'PASSWORD', salt: 'SALT' }); // Create a new storage instance, replace with your own password and salt

await storage.load(); // Load the last session onto this storage instance

storage.hasItem('foo'); // false

storage.setItem('foo', 'bar');

storage.getItem('foo'); // 'bar'

storage.size; // 1

// The storage will be restored to this exact state after reloading your application
```

## How It Works
All saved data is cached in the memory for improved efficiency.

After dispatching a write operation (setItem, removeItem or clear), a [log line](#log-line) will be saved to the encrypted [logs file](#logs-file).

When calling the [Storage.load method](https://alon-l.github.io/basic-storage/classes/storage.html#load),
the storage will iterate over the log lines and cache the data they represent.
Once all the log lines are read, we can safely save the cached data to the [storage file](#storage-file).
Afterwards, we will clear the logs file since it has no use anymore, and repeat the process for the next application's life cycle.

### Storage File
The storage file, defaultly called `db`, contains encrypted JSON data from all the previous life cycles of the application. 
The data is encrypted and encoded using your selected encoding mechanism (`base64` - (default) most recommended; `hex`; `binary` - least recommended).

#### Storage File Checksum
Due to the importancy of the storage file, it will go through a checksum validation to see whether it has been changed from the
application's last life cycle.

The checksum file, defaultly called `db.md5`, uses the md5 hashing mechanism to generate a hash for the file's content.

The two files are compared every time the storage file needs to be read from - when using
[Storage.load](https://alon-l.github.io/basic-storage/classes/storage.html#load)

### Logs File
The logs file, defaultly called `db.logs`, contains [log lines](#log-line) for all the write operations done in the last life cycle of the application.
The file is encrypted and encoded using your selected encoding mechanism (`base64` - (default) most recommended; `hex`; `binary` - least recommended).

When loading your previous session (using [Storage.load](https://alon-l.github.io/basic-storage/classes/storage.html#load)),
the parser will iterate over the encrypted log lines **reversely**, decrypt them, and parse the lines to retrieve the data they contain into the cache.

#### Log Line
The log line represts a writing operation done in the last life cycle of the application.
All log lines are encrypted line by line.

##### Log Line Formats
The decrypted log line will follow one of the next formats:
* Setting an item: ```S:"<KEY>":<VALUE>```  
Where `KEY` is the item's key, and `VALUE` is the stringified item's value.

* Removing an item: ```R:"<KEY">```  
Where `KEY` is the item's key.
