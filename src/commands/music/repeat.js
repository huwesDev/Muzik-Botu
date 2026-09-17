const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');
const { repeatLabel, repeatEmoji } = require('../../utils/helpers');

const COLORS = { blue: 0x5865F2, red: 0xED4245 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('repeat')
    .setDescription('Tekrar modunu ayarla')
    .addStringOption(o =>
      o.setName('mod')
        .setDescription('Tekrar modu')
        .setRequired(true)
        .addChoices(
          { name: '➖  Kapalı', value: '0' },
          { name: '🔂  Şarkıyı Tekrarla', value: '1' },
          { name: '🔁  Kuyruğu Tekrarla', value: '2' },
        )
    ),

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

    const mode = parseInt(interaction.options.getString('mod'));
    queue.setRepeatMode(mode);

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.blue)
        .setTitle('Tekrar Modu')
        .setDescription(`${repeatEmoji(mode)}  **${repeatLabel(mode)}**`)],
    });
  },
};
