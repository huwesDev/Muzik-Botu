const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');

const COLORS = { yellow: 0xFEE75C, red: 0xED4245 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Çalan şarkıyı duraklat'),

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

    if (queue.paused) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.yellow).setDescription('Şarkı zaten duraklatılmış. `/resume` ile devam ettir.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    queue.pause();

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.yellow)
        .setTitle('Duraklatıldı')
        .setDescription(`**${queue.songs[0].name}**`)
        .setFooter({ text: 'Devam ettirmek için /resume kullan.' })],
    });
  },
};
