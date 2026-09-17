const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ContainerBuilder, SectionBuilder, TextDisplayBuilder,
  SeparatorBuilder, MessageFlags, SeparatorSpacingSize,
} = require('discord.js');
const chalk = require('chalk');
const { formatDuration, createProgressBar, repeatLabel, repeatEmoji } = require('../utils/helpers');

const COLORS = {
  green: 0x1DB954,
  blue: 0x5865F2,
  red: 0xED4245,
  yellow: 0xFEE75C,
  dark: 0x2B2D31,
};

function sourceTag(url) {
  if (!url) return 'Web';
  if (url.includes('spotify.com')) return 'Spotify';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('soundcloud.com')) return 'SoundCloud';
  return 'Web';
}

function sourceColor(url) {
  if (!url) return COLORS.dark;
  if (url.includes('spotify.com')) return 0x1DB954;
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 0xFF0000;
  if (url.includes('soundcloud.com')) return 0xFF5500;
  return COLORS.blue;
}


function buildPlayerMessage(queue, song, overridePaused = null) {
  const current = Math.floor(queue.currentTime);
  const total = song.duration;
  const paused = overridePaused !== null ? overridePaused : queue.paused;
  const queueCount = Math.max(0, queue.songs.length - 1);

  const progress = song.isLive
    ? '`🔴  CANLI YAYIN`'
    : `\`${formatDuration(current)}\`  ${createProgressBar(current, total)}  \`${formatDuration(total)}\``;

  const songName = (song.name ?? 'Bilinmeyen Şarkı').slice(0, 80);
  const source = sourceTag(song.url);
  const vol = queue.volume;

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('music_prev').setLabel('⏮').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_pause').setLabel(paused ? '▶  Devam' : '⏸  Duraklat').setStyle(paused ? ButtonStyle.Success : ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('music_skip').setLabel('⏭  Atla').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_stop').setLabel('⏹  Kapat').setStyle(ButtonStyle.Danger),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('music_shuffle').setLabel('🔀').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_repeat').setLabel(`${repeatEmoji(queue.repeatMode)}  ${repeatLabel(queue.repeatMode)}`).setStyle(queue.repeatMode > 0 ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_autoplay').setLabel('🔄  Otoplay').setStyle(queue.autoplay ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_voldown').setLabel('🔉  -10').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_volup').setLabel('🔊  +10').setStyle(ButtonStyle.Secondary),
  );

  const container = new ContainerBuilder()
    .setAccentColor(sourceColor(song.url))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${source.toUpperCase()}  ·  ŞİMDİ ÇALIYOR`)
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**${songName}**\n\n${progress}`
          )
        )
        .setThumbnailAccessory(t => t.setURL(song.thumbnail ?? 'https://i.imgur.com/AfFp7pu.png'))
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        [
          `🔊  Ses: **${vol}%**`,
          `👤  İsteyen: ${song.user?.toString() ?? '—'}`,
          `📋  Sırada: ${queueCount > 0 ? `**${queueCount}** şarkı` : 'Son şarkı'}`,
          `${repeatEmoji(queue.repeatMode)}  Tekrar: **${repeatLabel(queue.repeatMode)}**`,
          `🔄  Otoplay: **${queue.autoplay ? 'Açık' : 'Kapalı'}**`,
        ].join('\n')
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addActionRowComponents(row1)
    .addActionRowComponents(row2);

  return {
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  };
}

function ep(content) {
  return { content, flags: MessageFlags.Ephemeral };
}

function epEmbed(embed) {
  return { embeds: [embed], flags: MessageFlags.Ephemeral };
}

function loadDistubeEvents(client) {
  const distube = client.distube;

  distube.on('playSong', (queue, song) => {
    const defaultVol = parseInt(process.env.DEFAULT_VOLUME) || 80;
    if (queue.volume !== defaultVol) queue.setVolume(defaultVol);

    queue.textChannel?.send(buildPlayerMessage(queue, song)).then(msg => {
      queue._controlMsg?.delete().catch(() => {});
      queue._controlMsg = msg;
    }).catch(() => {});
  });

  distube.on('addSong', (queue, song) => {
    const container = new ContainerBuilder()
      .setAccentColor(COLORS.blue)
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `-# SIRAYA EKLENDİ\n### ${song.name ?? 'Bilinmeyen'}\n⏱ \`${song.isLive ? 'Canlı' : formatDuration(song.duration)}\`  ·  📍 #${queue.songs.length}  ·  👤 ${song.user?.toString() ?? '—'}`
            )
          )
          .setThumbnailAccessory(t => t.setURL(song.thumbnail ?? 'https://i.imgur.com/AfFp7pu.png'))
      );

    queue.textChannel?.send({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
  });

  distube.on('addList', (queue, playlist) => {
    const totalDur = playlist.songs.reduce((a, s) => a + (s.duration ?? 0), 0);
    const container = new ContainerBuilder()
      .setAccentColor(COLORS.green)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# PLAYLİST EKLENDİ\n### ${playlist.name ?? 'Bilinmeyen'}\n🎵 **${playlist.songs.length}** şarkı  ·  ⏱ ${formatDuration(totalDur)}  ·  👤 ${playlist.user?.toString() ?? '—'}`
        )
      );

    queue.textChannel?.send({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
  });

  distube.on('finish', (queue) => {
    queue._controlMsg?.delete().catch(() => {});
    queue._controlMsg = null;

    const container = new ContainerBuilder()
      .setAccentColor(COLORS.dark)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('**Kuyruk tamamlandı.** Yeni müzik için `/play` kullan.')
      );

    queue.textChannel?.send({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
  });

  distube.on('disconnect', (queue) => {
    queue._controlMsg?.delete().catch(() => {});
    queue._controlMsg = null;
    queue.textChannel?.send({
      embeds: [new EmbedBuilder().setColor(COLORS.yellow).setDescription('Ses kanalından ayrıldım.')],
    }).catch(() => {});
  });

  distube.on('error', (channel, error) => {
    console.error(chalk.red('[DisTube]'), error);
    const raw = error?.message ?? String(error);
    let desc = 'Beklenmeyen bir hata oluştu.';
    if (raw.includes('sign in') || raw.includes('429')) desc = 'YouTube bu içeriğe erişimi kısıtlıyor.';
    else if (raw.includes('Private')) desc = 'Bu video özel, oynatılamaz.';
    else if (raw.includes('unavailable')) desc = 'Video kullanılamıyor veya bölgesel kısıtlama var.';
    else if (raw.includes('No result')) desc = 'Arama sonucu bulunamadı.';
    channel?.send({
      embeds: [new EmbedBuilder().setColor(COLORS.red).setTitle('Hata').setDescription(desc).setTimestamp()],
    }).catch(() => {});
  });

  client.on('voiceStateUpdate', (oldState) => {
    const queue = client.distube.getQueue(oldState.guild);
    if (!queue?.voiceChannel) return;
    const members = queue.voiceChannel.members.filter(m => !m.user.bot);
    if (members.size === 0) {
      if (queue._leaveTimer) clearTimeout(queue._leaveTimer);
      queue._leaveTimer = setTimeout(() => {
        const q = client.distube.getQueue(oldState.guild);
        if (!q?.voiceChannel) return;
        if (q.voiceChannel.members.filter(m => !m.user.bot).size === 0) {
          q.textChannel?.send({ embeds: [new EmbedBuilder().setColor(COLORS.yellow).setDescription('Kanalda kimse kalmadığı için ayrıldım.')] }).catch(() => {});
          q.stop();
        }
      }, parseInt(process.env.LEAVE_ON_EMPTY_COOLDOWN) || 30_000);
    } else {
      if (queue._leaveTimer) { clearTimeout(queue._leaveTimer); queue._leaveTimer = null; }
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() || !interaction.customId.startsWith('music_')) return;

    const queue = client.distube.getQueue(interaction.guild);
    if (!queue) return interaction.reply(ep('Çalan bir şarkı yok.'));
    if (interaction.member.voice.channelId !== queue.voiceChannel?.id) {
      return interaction.reply(ep('Müzik kanalında olmalısın!'));
    }

    try {
      switch (interaction.customId) {
        case 'music_pause': {
          const wasPaused = queue.paused;
          wasPaused ? queue.resume() : queue.pause();
          await interaction.update(buildPlayerMessage(queue, queue.songs[0], !wasPaused));
          break;
        }
        case 'music_skip': {
          const name = queue.songs[0]?.name;
          await interaction.deferUpdate();
          await queue.skip();
          await interaction.followUp(epEmbed(new EmbedBuilder().setColor(COLORS.blue).setDescription(`⏭  **${name}** atlandı.`)));
          break;
        }
        case 'music_prev': {
          try {
            await interaction.deferUpdate();
            await queue.previous();
          } catch {
            await interaction.followUp(ep('Önceki şarkı bulunamadı.'));
          }
          break;
        }
        case 'music_stop': {
          queue.stop();
          const stopped = new ContainerBuilder()
            .setAccentColor(COLORS.dark)
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent('⏹  Müzik kapatıldı ve kuyruk temizlendi.')
            );
          await interaction.update({
            components: [stopped],
            flags: MessageFlags.IsComponentsV2,
          });
          break;
        }
        case 'music_shuffle': {
          queue.shuffle();
          await interaction.update(buildPlayerMessage(queue, queue.songs[0]));
          break;
        }
        case 'music_repeat': {
          queue.setRepeatMode((queue.repeatMode + 1) % 3);
          await interaction.update(buildPlayerMessage(queue, queue.songs[0]));
          break;
        }
        case 'music_autoplay': {
          queue.toggleAutoplay();
          await interaction.update(buildPlayerMessage(queue, queue.songs[0]));
          break;
        }
        case 'music_voldown': {
          const vol = Math.max(1, queue.volume - 10);
          queue.setVolume(vol);
          await interaction.update(buildPlayerMessage(queue, queue.songs[0]));
          break;
        }
        case 'music_volup': {
          const vol = Math.min(200, queue.volume + 10);
          queue.setVolume(vol);
          await interaction.update(buildPlayerMessage(queue, queue.songs[0]));
          break;
        }
      }
    } catch (err) {
      console.error(chalk.red('[BUTTON]'), err);
      const m = interaction.replied || interaction.deferred ? 'followUp' : 'reply';
      interaction[m](ep(`Hata: ${err.message}`)).catch(() => {});
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(chalk.red(`[/${interaction.commandName}]`), err);
      const m = interaction.replied || interaction.deferred ? 'followUp' : 'reply';
      interaction[m](epEmbed(new EmbedBuilder().setColor(COLORS.red).setDescription(`Hata: ${err.message}`))).catch(() => {});
    }
  });

  console.log(chalk.magenta('[DisTube] Olaylar yüklendi'));
}

module.exports = { loadDistubeEvents };
