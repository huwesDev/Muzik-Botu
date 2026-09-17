const {
  SlashCommandBuilder, EmbedBuilder, MessageFlags,
  ActionRowBuilder, StringSelectMenuBuilder, ComponentType,
} = require('discord.js');
const { spawn } = require('child_process');
const { formatDuration } = require('../../utils/helpers');

const COLORS = { blue: 0x5865F2, red: 0xED4245, green: 0x1DB954, yellow: 0xFEE75C };

let YTDLP;
try {
  const p = require('path').join(__dirname, '..', '..', 'node_modules', '@distube', 'yt-dlp', 'bin', 'yt-dlp.exe');
  require('fs').accessSync(p);
  YTDLP = p;
} catch { YTDLP = 'yt-dlp'; }

function ytSearch(query, limit = 10) {
  return new Promise((resolve, reject) => {
    const proc = spawn(YTDLP, [
      `ytsearch${limit}:${query}`,
      '--dump-single-json',
      '--no-warnings',
      '--force-ipv4',
      '--no-check-certificate',
      '--flat-playlist',
      '--skip-download',
      '--socket-timeout', '10',
    ]);
    let out = '', err = '';
    proc.stdout.on('data', d => { out += d; });
    proc.stderr.on('data', d => { err += d; });
    proc.on('close', code => {
      if (code === 0) {
        try { resolve(JSON.parse(out)); }
        catch { reject(new Error('JSON parse hatası')); }
      } else {
        reject(new Error(err || 'yt-dlp başarısız'));
      }
    });
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('YouTube\'da şarkı ara ve listeden seç')
    .addStringOption(o =>
      o.setName('sorgu').setDescription('Aranacak şarkı adı').setRequired(true)
    ),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red)
          .setDescription('Aramadan önce bir ses kanalına gir.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply();

    const query = interaction.options.getString('sorgu');

    let data;
    try {
      data = await ytSearch(query, 10);
    } catch (err) {
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLORS.red)
          .setTitle('Arama Başarısız')
          .setDescription(err.message?.slice(0, 300))],
      });
    }

    const entries = data?.entries ?? (data?.id ? [data] : []);
    if (!entries.length) {
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLORS.red)
          .setDescription(`**${query}** için sonuç bulunamadı.`)],
      });
    }

    const top = entries.slice(0, 10);

    const lines = top.map((e, i) => {
      const dur = e.duration ? formatDuration(e.duration) : '?:??';
      const name = (e.title ?? e.webpage_url ?? 'Bilinmiyor').slice(0, 60);
      const url = e.webpage_url || `https://www.youtube.com/watch?v=${e.id}`;
      return `\`${i + 1}.\`  [${name}](${url})  —  \`${dur}\``;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setColor(COLORS.blue)
      .setAuthor({ name: `🔍 Arama: ${query}` })
      .setDescription(lines)
      .setFooter({ text: '30 saniye içinde aşağıdan bir şarkı seç.' })
      .setTimestamp();

    const options = top.map((e, i) => {
      const url = e.webpage_url || `https://www.youtube.com/watch?v=${e.id}`;
      const dur = e.duration ? formatDuration(e.duration) : '?:??';
      const label = (e.title ?? 'Bilinmiyor').slice(0, 100);
      const uploader = (e.uploader ?? e.channel ?? '').slice(0, 50);
      return {
        label,
        description: `${dur}${uploader ? `  ·  ${uploader}` : ''}`.slice(0, 100),
        value: url,
      };
    });

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('search_select')
        .setPlaceholder('Çalınacak şarkıyı seç...')
        .addOptions(options)
    );

    const msg = await interaction.editReply({ embeds: [embed], components: [menu] });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: i => i.user.id === interaction.user.id && i.customId === 'search_select',
      time: 30_000,
      max: 1,
    });

    collector.on('collect', async select => {
      const url = select.values[0];
      await select.deferUpdate();

      try {
        await client.distube.play(voiceChannel, url, {
          member: interaction.member,
          textChannel: interaction.channel,
        });
        await interaction.editReply({
          embeds: [new EmbedBuilder().setColor(COLORS.green).setDescription('Şarkı sıraya eklendi.')],
          components: [],
        });
      } catch (err) {
        await interaction.editReply({
          embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription(err.message?.slice(0, 300))],
          components: [],
        });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({
          embeds: [new EmbedBuilder().setColor(COLORS.yellow).setDescription('Süre doldu, seçim iptal edildi.')],
          components: [],
        }).catch(() => {});
      }
    });
  },
};
