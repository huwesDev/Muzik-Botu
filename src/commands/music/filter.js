const {
  SlashCommandBuilder, EmbedBuilder,
  ContainerBuilder, SectionBuilder, TextDisplayBuilder,
  SeparatorBuilder, ActionRowBuilder, ButtonBuilder,
  ButtonStyle, MessageFlags, SeparatorSpacingSize, ComponentType,
} = require('discord.js');

const COLORS = { blue: 0x5865F2, red: 0xED4245, green: 0x1DB954, yellow: 0xFEE75C };

const VALID_FILTERS = {
  bassboost: { label: 'Bass Boost', emoji: '🔊', desc: 'Bası güçlendirir' },
  nightcore: { label: 'Nightcore', emoji: '🌙', desc: 'Hızlı & tiz' },
  vaporwave: { label: 'Vaporwave', emoji: '🎐', desc: 'Yavaş & bas' },
  echo: { label: 'Echo', emoji: '🔁', desc: 'Yankı efekti' },
  '3d': { label: '3D', emoji: '🌀', desc: '3 boyutlu ses' },
  karaoke: { label: 'Karaoke', emoji: '🎤', desc: 'Vokali azaltır' },
  flanger: { label: 'Flanger', emoji: '〰️', desc: 'Titreşim efekti' },
  gate: { label: 'Gate', emoji: '🚪', desc: 'Gürültü kapısı' },
  haas: { label: 'Haas', emoji: '🎧', desc: 'Stereo genişletme' },
  phaser: { label: 'Phaser', emoji: '🌊', desc: 'Faz kayması' },
  reverse: { label: 'Reverse', emoji: '⏪', desc: 'Ters oynatma' },
  surround: { label: 'Surround', emoji: '📡', desc: 'Çevresel ses' },
  tremolo: { label: 'Tremolo', emoji: '🎵', desc: 'Ses titremesi' },
  mcompand: { label: 'Compressor', emoji: '🎛️', desc: 'Dinamik sıkıştırma' },
  earwax: { label: 'Earwax', emoji: '👂', desc: 'Mono efekt' },
};

const FILTER_KEYS = Object.keys(VALID_FILTERS);

function buildFilterListContainer(queue) {
  const active = queue.filters.names ?? [];

  const lines = FILTER_KEYS.map(k => {
    const f = VALID_FILTERS[k];
    const on = active.includes(k);
    return `${on ? '🟢' : '⚫'}  **${f.emoji} ${f.label}** — ${f.desc}${on ? '  *(açık)*' : ''}`;
  }).join('\n');

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('## 🎛️  Ses Filtreleri')
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(lines)
    );

  if (active.length > 0) {
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`> Aktif: **${active.map(k => VALID_FILTERS[k]?.label ?? k).join(', ')}**`)
    );
  }

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('-# Uygulamak için `/filter <filtre>` · Kapatmak için aynı komutu tekrar çalıştır · Tümünü kapatmak için `/filter temizle:Evet`')
  );

  return container;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('filter')
    .setDescription('Ses filtresi uygula, kaldır veya listele')
    .addStringOption(o =>
      o.setName('filtre')
        .setDescription('Filtre seç (boş bırakırsan listeyi gösterir)')
        .setRequired(false)
        .addChoices(...FILTER_KEYS.map(k => ({ name: `${VALID_FILTERS[k].emoji} ${VALID_FILTERS[k].label}`, value: k })))
    )
    .addBooleanOption(o =>
      o.setName('temizle').setDescription('Tüm filtreleri kapat').setRequired(false)
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

    const clear = interaction.options.getBoolean('temizle');
    const filter = interaction.options.getString('filtre');

    if (clear) {
      queue.filters.clear();
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.green)
          .setTitle('Filtreler Temizlendi')
          .setDescription('Tüm ses filtreleri kapatıldı.')],
      });
    }

    if (!filter) {
      return interaction.reply({
        components: [buildFilterListContainer(queue)],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    if (!VALID_FILTERS[filter]) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription('Geçersiz filtre.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const { label, emoji } = VALID_FILTERS[filter];
    const isActive = queue.filters.has(filter);

    if (isActive) {
      queue.filters.remove(filter);
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.yellow)
          .setTitle(`${emoji}  ${label} Kapatıldı`)
          .setDescription('Filtre devre dışı bırakıldı.')],
      });
    }

    queue.filters.add(filter);
    return interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.green)
        .setTitle(`${emoji}  ${label} Açıldı`)
        .setDescription('Filtre uygulandı. Kapatmak için aynı komutu tekrar çalıştır.')],
    });
  },
};
