const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { MessageFlags } = require('discord.js');
const { formatDuration, createProgressBar, formatNumber, repeatLabel, repeatEmoji } = require('../../utils/helpers');

const COLORS = { green: 0x1DB954, red: 0xED4245, blue: 0x5865F2 };

function sourceColor(url) {
  if (!url) return COLORS.blue;
  if (url.includes('spotify.com')) return 0x1DB954;
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 0xFF0000;
  return COLORS.blue;
}

function sourceTag(url) {
  if (!url) return 'Bilinmiyor';
  if (url.includes('spotify.com')) return 'Spotify';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  return 'Web';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Şu an çalan şarkının detaylarını göster'),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild);

    if (!queue?.songs.length) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red)
          .setDescription('Şu an çalan bir şarkı yok.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const song = queue.songs[0];
    const current = Math.floor(queue.currentTime);
    const total = song.duration;

    const progress = song.isLive
      ? '🔴  **CANLI YAYIN**'
      : `\`${formatDuration(current)}\`  ${createProgressBar(current, total)}  \`${formatDuration(total)}\``;

    const percent = total ? Math.round((current / total) * 100) : 0;

    const embed = new EmbedBuilder()
      .setColor(sourceColor(song.url))
      .setAuthor({ name: `${sourceTag(song.url)} · Şu An Çalıyor` })
      .setTitle(song.name ?? 'Bilinmeyen Şarkı')
      .setURL(song.url)
      .setThumbnail(song.thumbnail)
      .setDescription(progress)
      .addFields(
        { name: '👤 İsteyen', value: song.user?.toString() ?? '—', inline: true },
        { name: '🔊 Ses', value: `**${queue.volume}%**`, inline: true },
        { name: '📋 Sırada', value: queue.songs.length > 1 ? `**${queue.songs.length - 1}** şarkı` : 'Son şarkı', inline: true },
        { name: '⏸ Durum', value: queue.paused ? 'Duraklatıldı' : 'Çalıyor', inline: true },
        { name: '🔁 Tekrar', value: `${repeatEmoji(queue.repeatMode)} ${repeatLabel(queue.repeatMode)}`, inline: true },
        { name: '📊 İlerleme', value: `**%${percent}**`, inline: true },
        { name: '👁 İzlenme', value: formatNumber(song.views), inline: true },
        { name: '🎧 Kanal', value: queue.voiceChannel?.name ?? '—', inline: true },
        { name: '🔄 Otoplay', value: queue.autoplay ? 'Açık' : 'Kapalı', inline: true },
      )
      .setFooter({ text: `Süre: ${song.isLive ? 'Canlı' : formatDuration(total)}  ·  ${sourceTag(song.url)}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('music_pause')
        .setLabel(queue.paused ? '▶  Devam' : '⏸  Duraklat')
        .setStyle(queue.paused ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('music_skip')
        .setLabel('⏭  Atla')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('music_stop')
        .setLabel('⏹  Kapat')
        .setStyle(ButtonStyle.Danger),
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
