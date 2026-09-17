const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');

const COLORS = { green: 0x1DB954, red: 0xED4245 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Bulunduğun ses kanalına katıl'),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription('Önce bir ses kanalına gir.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const perms = voiceChannel.permissionsFor(interaction.guild.members.me);
    if (!perms.has('Connect') || !perms.has('Speak')) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription('Bu kanala bağlanma veya konuşma iznin yok.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await client.distube.voices.join(voiceChannel);
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.green)
          .setTitle('Bağlanıldı')
          .setDescription(`**${voiceChannel.name}** kanalına katıldım.`)],
      });
    } catch (err) {
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription(`Katılamadım: ${err.message}`)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
