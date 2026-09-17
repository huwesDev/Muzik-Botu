const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const files = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const event = require(path.join(eventsPath, file));
    if (!event?.name) continue;

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  console.log(chalk.yellow(`[OLAY] ${event.name} dinleniyor`));
  }
}

module.exports = { loadEvents };
