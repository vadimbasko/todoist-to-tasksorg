import fs from "node:fs";
import process from "node:process";
const log = console.log;

const generateId = () => "" + Date.now() + Math.random().toString().substring(2, 8);

const args = process.argv.slice(2);
const backupFile = args[0];
const sourceFile = args[1];
const listName = args[2];

[backupFile, sourceFile].forEach(file => {
  if (!fs.existsSync(file)) {
    log(`File '${file}' not exist, program exit`);
    process.exit(1);
  }
});

const findListId = (listName, backup) => {
  return backup.data.caldavCalendars
    .find(list => list.name.toLowerCase() == listName.toLowerCase())?.uuid;
}

const createTaskRow = title => (
{
  task: {
    title,
    priority: 2,
    creationDate: Date.now(),
    modificationDate: Date.now(),
    // completionDate: 1740283367146,
    remoteId: generateId(),
    // order: 761897270
  },
  alarms: [],
  geofences: [],
  tags: [],
  comments: [],
  attachments: [],
  caldavTasks: [
    {
      calendar: listId,
      remoteId: generateId(),
    }
  ]
});

const createListRow = name => (
   {
    account: "local",
    uuid: generateId(),
    name,
    url: null,
    icon: "list"
   }
);

const backup = JSON.parse(fs.readFileSync(backupFile, "utf-8"));
// log(backup.data.caldavCalendars);
// log(backup.data.tasks[0]);

let listId = findListId(listName, backup);
// create list if not found by name
if (listId == null) {
  const listRow = createListRow(listName);
  backup.data.caldavCalendars.push(listRow);
  listId = listRow.uuid;
  log(`list '${listName}' not found, create new one`);
} else {
  log(`list '${listName}' found, tasks will be added to the exisiting list`);
}
 
fs.readFileSync(sourceFile, "utf-8").split('\n').forEach(line => {
  const taskRow = createTaskRow(line);
  backup.data.tasks.push(taskRow);
});

log(
  `'${listName}' list tasks after update`, 
  backup.data.tasks
    .filter(task => task.caldavTasks[0].calendar === listId)
    .map(task => task.task.title)
);

const outFile = backupFile.replace(".json", "-updated.json");
fs.writeFileSync(outFile, JSON.stringify(backup));
log(`backup saved in file '${outFile}'`);
