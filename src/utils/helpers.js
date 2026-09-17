function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function createProgressBar(current, total, size = 13) {
  if (!total || total === 0) return '─'.repeat(size);
  const clamped = Math.min(current, total);
  const pos = Math.round((clamped / total) * size);
  const filled = Math.max(0, pos - 1);
  const empty = Math.max(0, size - pos);
  return '━'.repeat(filled) + '⬤' + '─'.repeat(empty);
}

function formatNumber(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function isInVoiceChannel(member) {
  return !!member.voice.channel;
}

function isSameVoiceChannel(member, botChannel) {
  if (!botChannel) return true;
  return member.voice.channelId === botChannel.id;
}

function getTotalPages(total, perPage) {
  return Math.max(1, Math.ceil(total / perPage));
}

function getSourceIcon(url) {
  if (!url) return '🌐';
  if (url.includes('spotify.com')) return '<:spotify:1> Spotify';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('soundcloud.com')) return 'SoundCloud';
  return 'Web';
}

function repeatLabel(mode) {
  return ['Kapalı', 'Şarkı', 'Kuyruk'][mode] ?? 'Kapalı';
}

function repeatEmoji(mode) {
  return ['➖', '🔂', '🔁'][mode] ?? '➖';
}

module.exports = {
  formatDuration,
  createProgressBar,
  formatNumber,
  isInVoiceChannel,
  isSameVoiceChannel,
  getTotalPages,
  getSourceIcon,
  repeatLabel,
  repeatEmoji,
};
