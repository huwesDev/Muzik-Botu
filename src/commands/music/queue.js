const {
  SlashCommandBuilder, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType,
} = require('discord.js');
const { MessageFlags } = require('discord.js');
const { formatDuration, getTotalPages } = require('../../utils/helpers');

const COLORS = { blue: 0x5865F2, red: 0xED4245 };
const PER_PAGE = 10;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Müzik kuyruğunu göster')
    .addIntegerOption(o =>
      o.setName('sayfa').setDescription('Sayfa numarası').setMinValue(1)
    ),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild);

    if (!queue?.songs.length) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription('Kuyruk şu an boş.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const songs = queue.songs;
    const totalPages = getTotalPages(songs.length, PER_PAGE);
    let page = Math.min(interaction.options.getInteger('sayfa') ?? 1, totalPages);

    const buildEmbed = (p) => {
      const start = (p - 1) * PER_PAGE;
      const slice = songs.slice(start, start + PER_PAGE);
      const totalDuration = songs.reduce((a, s) => a + (s.duration ?? 0), 0);

      const lines = slice.map((s, i) => {
        const idx = start + i;
        const prefix = idx === 0 ? '**▶**' : `\`${idx}.\``;
        const dur = s.isLive ? '🔴 Canlı' : formatDuration(s.duration);
        const name = s.name?.length > 55 ? s.name.slice(0, 52) + '...' : s.name;
        return `${prefix}  [${name}](${s.url})  \`${dur}\``;
      }).join('\n');

      return new EmbedBuilder()
        .setColor(COLORS.blue)
        .setAuthor({ name: `${interaction.guild.name} · Müzik Kuyruğu` })
        .setDescription(lines || '—')
        .addFields(
          { name: '🎵 Şarkı', value: `**${songs.length}** adet`, inline: true },
          { name: '⏱ Toplam Süre', value: formatDuration(totalDuration), inline: true },
          { name: '🔊 Ses', value: `**${queue.volume}%**`, inline: true },
        )
        .setFooter({ text: `Sayfa ${p} / ${totalPages}` })
        .setTimestamp();
    };

    const buildRow = (p) => new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('q_first').setLabel('«').setStyle(ButtonStyle.Secondary).setDisabled(p <= 1),
      new ButtonBuilder()
        .setCustomId('q_prev').setLabel('‹  Geri').setStyle(ButtonStyle.Secondary).setDisabled(p <= 1),
      new ButtonBuilder()
        .setCustomId('q_page').setLabel(`${p} / ${totalPages}`).setStyle(ButtonStyle.Primary).setDisabled(true),
      new ButtonBuilder()
        .setCustomId('q_next').setLabel('İleri  ›').setStyle(ButtonStyle.Secondary).setDisabled(p >= totalPages),
      new ButtonBuilder()
        .setCustomId('q_last').setLabel('»').setStyle(ButtonStyle.Secondary).setDisabled(p >= totalPages),
    );

    const msg = await interaction.reply({
      embeds: [buildEmbed(page)],
      components: totalPages > 1 ? [buildRow(page)] : [],
      fetchReply: true,
    });

    if (totalPages <= 1) return;

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.user.id === interaction.user.id,
      time: 120_000,
    });

    collector.on('collect', async btn => {
      if (btn.customId === 'q_first') page = 1;
      else if (btn.customId === 'q_prev') page = Math.max(1, page - 1);
      else if (btn.customId === 'q_next') page = Math.min(totalPages, page + 1);
      else if (btn.customId === 'q_last') page = totalPages;

      await btn.update({ embeds: [buildEmbed(page)], components: [buildRow(page)] });
    });

    collector.on('end', () => msg.edit({ components: [] }).catch(() => {}));
  },
};
