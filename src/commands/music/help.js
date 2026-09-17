const {
  SlashCommandBuilder,
  ContainerBuilder, SectionBuilder, TextDisplayBuilder,
  SeparatorBuilder, ActionRowBuilder, ButtonBuilder,
  ButtonStyle, MessageFlags, SeparatorSpacingSize, ComponentType,
} = require('discord.js');

const PAGES = [
  {
    id: 'play',
    title: '▶️  Çalma & Arama',
    color: 0x1DB954,
    content: [
      '### `/play <sorgu>`',
      'YouTube veya Spotify\'dan şarkı ya da playlist başlat.',
      'Şarkı adı, YouTube linki, Spotify şarkı/albüm/playlist linki kabul edilir.',
      '',
      '### `/search <sorgu>`',
      'YouTube\'da arar, 10 sonuçu listeler. Açılan menüden seçim yaparsın.',
      '',
      '### `/join`',
      'Botu bulunduğun ses kanalına çağırır.',
      '',
      '### `/leave`',
      'Botu kanaldan çıkarır ve kuyruğu temizler.',
    ].join('\n'),
  },
  {
    id: 'control',
    title: '⏯️  Oynatıcı Kontrolleri',
    color: 0x5865F2,
    content: [
      '### `/pause`',
      'Çalan şarkıyı duraklat.',
      '',
      '### `/resume`',
      'Duraklatılmış şarkıya devam et.',
      '',
      '### `/stop`',
      'Müziği kapat, kuyruğu temizle.',
      '',
      '### `/skip [adet]`',
      'Şarkıyı atla. Adet belirtirsen birden fazla atlarsın.',
      '',
      '### `/previous`',
      'Bir önceki şarkıya dön.',
      '',
      '### `/seek <zaman>`',
      'Şarkıda belirli bir konuma atla. Örnek: `1:30` veya `90`',
    ].join('\n'),
  },
  {
    id: 'queue',
    title: '📋  Kuyruk Yönetimi',
    color: 0x5865F2,
    content: [
      '### `/queue [sayfa]`',
      'Kuyruğu sayfalı olarak görüntüle.',
      '',
      '### `/nowplaying`',
      'Çalan şarkının detaylarını ve ilerleme çubuğunu gösterir.',
      '',
      '### `/shuffle`',
      'Kuyruğu rastgele karıştır.',
      '',
      '### `/remove <pozisyon>`',
      'Belirtilen sıradaki şarkıyı kuyruktan sil.',
      '',
      '### `/repeat <mod>`',
      'Tekrar modunu ayarla: **Kapalı** / **Şarkı** / **Kuyruk**',
      '',
      '### `/autoplay`',
      'Kuyruk bittiğinde otomatik benzer şarkı öner.',
    ].join('\n'),
  },
  {
    id: 'audio',
    title: '🎛️  Ses & Filtreler',
    color: 0xFEE75C,
    content: [
      '### `/volume [seviye]`',
      'Ses seviyesini görüntüle veya ayarla (1–200).',
      '',
      '### `/filter [filtre]`',
      'Ses filtresi uygula veya kaldır. Boş bırakırsan tüm filtreleri listeler.',
      '',
      '**Mevcut Filtreler:**',
      '`Bass Boost` `Nightcore` `Vaporwave` `Echo` `3D`',
      '`Karaoke` `Flanger` `Gate` `Haas` `Phaser`',
      '`Reverse` `Surround` `Tremolo` `Compressor` `Earwax`',
    ].join('\n'),
  },
  {
    id: 'buttons',
    title: '🎮  Buton Kontrolleri',
    color: 0x2B2D31,
    content: [
      'Şarkı başladığında oynatıcı mesajı otomatik gönderilir.',
      'Mesajdaki butonlarla kolayca kontrol edebilirsin:',
      '',
      '**Üst Satır:**',
      '`⏮ Önceki`  `⏸ Duraklat / ▶ Devam`  `⏭ Atla`  `⏹ Kapat`',
      '',
      '**Alt Satır:**',
      '`🔀 Karıştır`  `🔁 Tekrar Modu`  `🔄 Otoplay`  `🔉 -10`  `🔊 +10`',
      '',
      '**Desteklenen Kaynaklar:**',
      '🎵 YouTube  ·  🎧 Spotify  ·  🔶 SoundCloud  ·  🌐 700+ site',
    ].join('\n'),
  },
];

function buildPage(page, botUser) {
  const p = PAGES[page];

  const container = new ContainerBuilder()
    .setAccentColor(p.color)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${p.title}`)
        )
        .setThumbnailAccessory(t => t.setURL(botUser.displayAvatarURL()))
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(p.content)
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# Sayfa ${page + 1} / ${PAGES.length}  ·  ${botUser.username}`)
    );

  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('help_first').setLabel('«').setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId('help_prev').setLabel('‹  Geri').setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId('help_tab').setLabel(p.title.replace(/^.{2}/, '').trim()).setStyle(ButtonStyle.Primary).setDisabled(true),
    new ButtonBuilder()
      .setCustomId('help_next').setLabel('İleri  ›').setStyle(ButtonStyle.Secondary).setDisabled(page === PAGES.length - 1),
    new ButtonBuilder()
      .setCustomId('help_last').setLabel('»').setStyle(ButtonStyle.Secondary).setDisabled(page === PAGES.length - 1),
  );

  return { container, navRow };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Komut listesi ve kullanım kılavuzu'),

  async execute(interaction, client) {
    let page = 0;

    const { container, navRow } = buildPage(page, client.user);

    const msg = await interaction.reply({
      components: [container, navRow],
      flags: MessageFlags.IsComponentsV2,
      fetchReply: true,
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.user.id === interaction.user.id && i.customId.startsWith('help_'),
      time: 180_000,
    });

    collector.on('collect', async btn => {
      if (btn.customId === 'help_first') page = 0;
      else if (btn.customId === 'help_prev') page = Math.max(0, page - 1);
      else if (btn.customId === 'help_next') page = Math.min(PAGES.length - 1, page + 1);
      else if (btn.customId === 'help_last') page = PAGES.length - 1;

      const { container: c, navRow: n } = buildPage(page, client.user);
      await btn.update({
        components: [c, n],
        flags: MessageFlags.IsComponentsV2,
      });
    });

    collector.on('end', () => {
      const { container: c } = buildPage(page, client.user);
      msg.edit({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    });
  },
};
