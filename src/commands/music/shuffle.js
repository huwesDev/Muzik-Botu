const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');

const COLORS = { green: 0x1DB954, red: 0xED4245 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Kuyruğu rastgele karıştır'),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild);

    if (!queue || queue.songs.length <= 1) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription('Karıştırmak için kuyruğa en az 2 şarkı gerekli.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (interaction.member.voice.channelId !== queue.voiceChannel?.id) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription('Müzik kanalında olmalısın!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    queue.shuffle();

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.green)
        .setTitle('🔀  Kuyruk Karıştırıldı')
        .setDescription(`**${queue.songs.length - 1}** şarkı yeniden sıralandı.`)],
    });
  },
};
