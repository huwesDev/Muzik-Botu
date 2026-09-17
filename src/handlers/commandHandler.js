const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const command = require(path.join(categoryPath, file));
      if (!command?.data?.name) continue;
      client.slashCommands.set(command.data.name, command);
      console.log(chalk.cyan(`[KMT] /${command.data.name} yüklendi`));
    }
  }

  registerSlashCommands(client);
}

async function registerSlashCommands(client) {
  const commands = client.slashCommands.map(cmd => cmd.data.toJSON
    ? cmd.data.toJSON()
    : cmd.data
  );

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log(chalk.green(`[KMT] ${commands.length} slash komut sunucuya kaydedildi`));
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      console.log(chalk.green(`[KMT] ${commands.length} slash komut global kaydedildi`));
    }
  } catch (err) {
    console.error(chalk.red('[KMT] Slash komut kaydı başarısız:'), err);
  }
}

module.exports = { loadCommands };
