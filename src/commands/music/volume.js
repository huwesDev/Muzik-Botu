const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');

const COLORS = { blue: 0x5865F2, green: 0x1DB954, red: 0xED4245 };

function volBar(vol) {
  const filled = Math.round((vol / 200) * 20);
  return '█'.repeat(filled) + '░'.repeat(20 - filled);
}

function volEmoji(vol) {
  if (vol === 0) return '🔇';
  if (vol <= 30) return '🔈';
  if (vol <= 80) return '🔉';
  return '🔊';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Ses seviyesini görüntüle veya ayarla')
    .addIntegerOption(o =>
      o.setName('seviye').setDescription('Ses seviyesi (1–200)').setMinValue(1).setMaxValue(200)
    ),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild);

    if (!queue) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription('Çalan bir şarkı yok.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const level = interaction.options.getInteger('seviye');

    if (!level) {
      const vol = queue.volume;
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.blue)
          .setTitle(`${volEmoji(vol)}  Ses Seviyesi`)
          .setDescription(`\`${volBar(vol)}\`\n**${vol}** / 200`)],
      });
    }

    if (interaction.member.voice.channelId !== queue.voiceChannel?.id) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription('Müzik kanalında olmalısın!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    queue.setVolume(level);

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.green)
        .setTitle(`${volEmoji(level)}  Ses Ayarlandı`)
        .setDescription(`\`${volBar(level)}\`\n**${level}** / 200`)],
    });
  },
};
