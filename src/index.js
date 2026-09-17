require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { YouTubePlugin } = require('@distube/youtube');
const chalk = require('chalk');
const { spawn } = require('child_process');

(function applyForceIpv4Patch() {
  let YTDLP;
  try {
    const p = require('path').join(__dirname, '..', 'node_modules', '@distube', 'yt-dlp', 'bin', 'yt-dlp.exe');
    require('fs').accessSync(p);
    YTDLP = p;
  } catch { YTDLP = 'yt-dlp'; }

  function ytRun(args) {
    return new Promise((resolve, reject) => {
      const proc = spawn(YTDLP, args);
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

  const STREAM_ARGS = [
    '--dump-single-json',
    '--no-warnings',
    '--force-ipv4',
    '--no-check-certificate',
    '--socket-timeout', '10',
    '--format', 'ba[ext=m4a]/ba[ext=webm]/ba',
    '--no-playlist',
    '--extractor-args', 'youtube:skip=dash,translated_subs,hls',
  ];
  const streamCache = new Map();

  const proto = YouTubePlugin.prototype;

  proto.searchSong = async function(query, options) {
    try {
      const info = await ytRun([`ytsearch1:${query}`, ...STREAM_ARGS]);
      const entry = info.entries?.[0] ?? info;
      if (!entry?.id) return null;

      const videoUrl = entry.webpage_url || `https://www.youtube.com/watch?v=${entry.id}`;
      if (entry.url) streamCache.set(videoUrl, entry.url);

      const { Song } = require('distube');
      return new Song({
        plugin: this, source: 'youtube', playFromSource: true,
        id: entry.id, name: entry.title,
        url: videoUrl,
        thumbnail: entry.thumbnail || entry.thumbnails?.[0]?.url,
        duration: entry.duration || 0, isLive: !!entry.is_live,
        uploader: { name: entry.uploader || entry.channel },
        views: entry.view_count || 0,
      }, options);
    } catch { return null; }
  };

  proto.getStreamURL = async function(song) {
    if (streamCache.has(song.url)) {
      const url = streamCache.get(song.url);
      streamCache.delete(song.url);
      return url;
    }
    const info = await ytRun([song.url, ...STREAM_ARGS]);
    return info.url;
  };

  proto.resolve = async function(url, options) {
    try {
      const info = await ytRun([url, ...STREAM_ARGS]);

      if (info.entries) {
        const { Playlist, Song: S } = require('distube');
        if (!info.entries.length) throw new Error('Playlist boş');
        const songs = info.entries.map(e => {
          const vUrl = e.webpage_url || `https://www.youtube.com/watch?v=${e.id}`;
          if (e.url) streamCache.set(vUrl, e.url);
          return new S({
            plugin: this, source: 'youtube', playFromSource: true,
            id: e.id, name: e.title, url: vUrl,
            thumbnail: e.thumbnail || e.thumbnails?.[0]?.url,
            duration: e.duration || 0, isLive: !!e.is_live,
            uploader: { name: e.uploader || e.channel },
            views: e.view_count || 0,
          }, options);
        });
        return new Playlist({ source: 'youtube', songs, id: info.id, name: info.title, url: info.webpage_url, thumbnail: info.thumbnail }, options);
      }

      const videoUrl = info.webpage_url || `https://www.youtube.com/watch?v=${info.id}`;
      if (info.url) streamCache.set(videoUrl, info.url);

      const { Song } = require('distube');
      return new Song({
        plugin: this, source: 'youtube', playFromSource: true,
        id: info.id, name: info.title, url: videoUrl,
        thumbnail: info.thumbnail || info.thumbnails?.[0]?.url,
        duration: info.duration || 0, isLive: !!info.is_live,
        uploader: { name: info.uploader || info.channel },
        views: info.view_count || 0,
      }, options);
    } catch (e) {
      const { DisTubeError } = require('distube');
      throw new DisTubeError('YTDLP_ERROR', e.message);
    }
  };

  console.log(chalk.blue('[YAMA] YouTubePlugin IPv4 + stream önbellek aktif'));
})();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
client.slashCommands = new Collection();

client.distube = new DisTube(client, {
  emitNewSongOnly: false,
  emitAddSongWhenCreatingQueue: false,
  savePreviousSongs: true,
  plugins: [
    new YouTubePlugin(),
    new SpotifyPlugin({
      api: {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      },
    }),
  ],
});

const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { loadDistubeEvents } = require('./handlers/distubeHandler');

loadCommands(client);
loadEvents(client);
loadDistubeEvents(client);

client.login(process.env.TOKEN).then(() => {
  console.log(chalk.green(`\n✅ [BOT] ${client.user.tag} giriş yaptı`));
}).catch(err => {
  console.error(chalk.red('[BOT] Giriş hatası:'), err.message);
  process.exit(1);
});

process.on('unhandledRejection', err => console.error(chalk.red('[HATA]'), err?.message || err));
process.on('uncaughtException', err => console.error(chalk.red('[HATA]'), err?.message || err));
