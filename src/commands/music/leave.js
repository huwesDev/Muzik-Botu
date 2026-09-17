const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');

const COLORS = { yellow: 0xFEE75C, red: 0xED4245 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Ses kanalından ayrıl ve kuyruğu temizle'),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild);
    const voice = client.distube.voices.get(interaction.guild);

    if (!queue && !voice) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription('Bir ses kanalında değilim.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const channelId = queue?.voiceChannel?.id ?? voice?.channel?.id;
    if (interaction.member.voice.channelId !== channelId) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription('Aynı ses kanalında olmalısın.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (queue) queue.stop();
    else voice.leave();

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.yellow)
        .setTitle('Ayrıldı')
        .setDescription('Ses kanalından ayrıldım. Kuyruk temizlendi.')],
    });
  },
};
