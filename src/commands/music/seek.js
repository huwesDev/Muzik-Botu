const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');
const { formatDuration } = require('../../utils/helpers');

const COLORS = { green: 0x1DB954, red: 0xED4245 };

function parseTime(str) {
  if (/^\d+$/.test(str)) return parseInt(str);
  const m = str.match(/^(\d+):(\d{1,2})$/);
  if (m) return parseInt(m[1]) * 60 + parseInt(m[2]);
  const h = str.match(/^(\d+):(\d{2}):(\d{2})$/);
  if (h) return parseInt(h[1]) * 3600 + parseInt(h[2]) * 60 + parseInt(h[3]);
  return null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Şarkıda belirli bir konuma atla')
    .addStringOption(o =>
      o.setName('zaman')
        .setDescription('Konum: 1:30 veya 90 (saniye)')
        .setRequired(true)
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

    const song = queue.songs[0];

    if (song.isLive) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription('Canlı yayında konum değiştirilemez.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const seconds = parseTime(interaction.options.getString('zaman'));

    if (seconds === null) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red)
          .setTitle('Geçersiz Format')
          .setDescription('Örnek kullanım: `1:30` veya `90`')],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (seconds >= song.duration) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red)
          .setDescription(`Şarkı süresi **${formatDuration(song.duration)}**, bu değeri aşamazsın.`)],
        flags: MessageFlags.Ephemeral,
      });
    }

    await queue.seek(seconds);

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.green)
        .setTitle('⏩  Konuma Atlandı')
        .setDescription(`**${formatDuration(seconds)}** / ${formatDuration(song.duration)}`)],
    });
  },
};
