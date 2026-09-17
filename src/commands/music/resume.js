const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');

const COLORS = { green: 0x1DB954, yellow: 0xFEE75C, red: 0xED4245 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Duraklatılmış şarkıya devam et'),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild);

    if (!queue) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription('Çalan bir şarkı yok.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (interaction.member.voice.channelId !== queue.voiceChannel?.id) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription('Müzik kanalında olmalısın!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!queue.paused) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.yellow).setDescription('Şarkı zaten çalıyor.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    queue.resume();

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.green)
        .setTitle('Devam Ediyor')
        .setDescription(`**${queue.songs[0].name}**`)],
    });
  },
};
