import fs from 'node:fs';
import process from 'node:process';
const log = console.log;

const args = process.argv.slice(2);
const csvFile = args[0];

if (!fs.existsSync(csvFile)) {
  log(`File '${csvFile}' not found`);
  process.exit(1);
}

const data = fs.readFileSync(csvFile, 'utf-8');
const result = [];

data.split('\n').forEach(line => {
  if (line.startsWith('task,')) {
    // TODO use regex to work with quoted strings and commas    
    let taskContent = line.split('"')[1];
    if (taskContent == null) {
      taskContent = line.split(',')[1];
    }
    result.push(taskContent);
  }
});

const outFile = csvFile.replace('.csv', '.txt');
fs.writeFileSync(outFile, result.join('\n'));

log(`List of task written to '${outFile}'`);


