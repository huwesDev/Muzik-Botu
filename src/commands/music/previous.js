const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');

const COLORS = { blue: 0x5865F2, red: 0xED4245 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('previous')
    .setDescription('Önceki şarkıya dön'),

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

    try {
      await queue.previous();
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.blue)
          .setTitle('⏮  Önceki Şarkı')
          .setDescription(`**${queue.songs[0]?.name ?? '—'}**`)],
      });
    } catch (err) {
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription(err.message)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
