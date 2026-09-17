const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');

const COLORS = { green: 0x1DB954, red: 0xED4245, blue: 0x5865F2 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoplay')
    .setDescription('Kuyruk bittiğinde otomatik şarkı önerisi aç/kapat'),

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

    const state = queue.toggleAutoplay();

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(state ? COLORS.green : COLORS.blue)
        .setTitle('🔄  Otoplay')
        .setDescription(state
          ? 'Otoplay **açıldı**. Kuyruk bittiğinde benzer şarkılar otomatik eklenir.'
          : 'Otoplay **kapatıldı**.')],
    });
  },
};
