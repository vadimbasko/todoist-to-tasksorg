import fs from "node:fs";
import process from "node:process";
const log = console.log;

const obfuscatedBackupFile = "test-backup.json";
const randomDataFile = "fixtures/randomdata.csv";
const excludeObfuscationNames = ["shopping", "errands"];

const args = process.argv.slice(2);
const backupFile = args[0];
if (!fs.existsSync(backupFile)) {
  log(`source backup file '${backupFile}' not exist`);
  process.exit(1);
}

const randomData = fs.readFileSync(randomDataFile, "utf-8").replaceAll("\"", "").split("\n");
const randomDataIterator = {
  current: 0,
  next() {
    if (this.current === randomData.length) {
      this.current = 0;
    }
    return {value: randomData[this.current++]};
  }
};

const backup = JSON.parse(fs.readFileSync(backupFile, "utf-8"));

function obfuscate(obj) {

  Object.keys(obj).forEach(key => {

    if (typeof obj[key] === 'object' && obj[key] != null) {

      if (Array.isArray(obj[key])) {
        obj[key].forEach(arrItem => obfuscate(arrItem));
        return;
      }

      obfuscate(obj[key]);
      return;
    }

    // replace emails
    if (typeof obj[key] == 'string' && obj[key].includes("@")) {
      obj[key] = 'test@example.com';
      return;
    }

    // remove settings that could contains user email in names
    if (key.includes("@")) {
      delete obj[key];
      return;
    }

    // replace user defined data with random strings
    // except project names like 'Shopping' and 'Errands'
    if (key === 'name' || key === 'title') {
      if (!excludeObfuscationNames.includes(obj[key].toLowerCase())) {
        const randomString = randomDataIterator.next().value;
        //log(`Replace '${obj[key]}' with '${randomString}' `);
        obj[key] = randomString;
      }
    }

  });

}

obfuscate(backup, randomData);

const output = JSON.stringify(backup, null, " ");
fs.writeFileSync(obfuscatedBackupFile, output);
log(`obfuscated backup saved to '${obfuscatedBackupFile}'`);
