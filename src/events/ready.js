const chalk = require('chalk');

module.exports = {
  name: 'clientReady',
  once: true,
  execute(client) {
      console.log(chalk.green(`\n✅ Bot hazır: ${client.user.tag}`));
    console.log(chalk.cyan(`📡 ${client.guilds.cache.size} sunucuda aktif`));

    const activities = [
      { name: '/play', type: 2 },
      { name: 'Spotify & YouTube', type: 2 },
      { name: `huw3sdev | ${client.guilds.cache.size} sunucu`, type: 3 },
    ]; i = 0;
    client.user.setPresence({
      activities: [activities[0]],
      status: 'online',
    });

    setInterval(() => {
      i = (i + 1) % activities.length;
      client.user.setPresence({
        activities: [activities[i]],
        status: 'online',
      });
    }, 15_000);
  },
};
