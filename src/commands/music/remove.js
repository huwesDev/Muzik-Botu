const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');

const COLORS = { red: 0xED4245 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Kuyruktaki bir şarkıyı sil')
    .addIntegerOption(o =>
      o.setName('pozisyon')
        .setDescription('Sıra numarası (1 = sıradaki ilk şarkı)')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild);

    if (!queue || queue.songs.length <= 1) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription('Kuyrukta silinecek şarkı yok.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (interaction.member.voice.channelId !== queue.voiceChannel?.id) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription('Müzik kanalında olmalısın!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const pos = interaction.options.getInteger('pozisyon');

    if (pos >= queue.songs.length) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red)
          .setDescription(`Geçersiz pozisyon. Kuyrukta **${queue.songs.length - 1}** şarkı var.`)],
        flags: MessageFlags.Ephemeral,
      });
    }

    const [removed] = queue.songs.splice(pos, 1);

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.red)
        .setTitle('Kuyruktan Silindi')
        .setDescription(`**${removed.name}**`)
        .setFooter({ text: `#${pos}. pozisyondan kaldırıldı.` })],
    });
  },
};
