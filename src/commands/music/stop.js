const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');

const COLORS = { red: 0xED4245 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Müziği kapat, kuyruğu temizle ve kanaldan ayrıl'),

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

    queue.stop();

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.red)
        .setTitle('Kapatıldı')
        .setDescription('Müzik kapatıldı ve kuyruk temizlendi.')],
    });
  },
};
