const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const COLORS = { green: 0x1DB954, red: 0xED4245 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Şarkı veya playlist çal')
    .addStringOption(o =>
      o.setName('sorgu')
        .setDescription('Şarkı adı, YouTube linki veya Spotify linki')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red)
          .setDescription('Bir ses kanalına girdikten sonra bu komutu kullanabilirsin.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const queue = client.distube.getQueue(interaction.guild);
    if (queue && queue.voiceChannel.id !== voiceChannel.id) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red)
          .setDescription(`Bot şu an **${queue.voiceChannel.name}** kanalında. O kanala geç veya müziği kapat.`)],
        flags: MessageFlags.Ephemeral,
      });
    }

    const query = interaction.options.getString('sorgu');

    await interaction.deferReply();

    try {
      await client.distube.play(voiceChannel, query, {
        member,
        textChannel: interaction.channel,
        skip: false,
      });
      await interaction.deleteReply().catch(() => {});
    } catch (err) {
      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLORS.red)
          .setTitle('Oynatılamadı')
          .setDescription(err.message?.slice(0, 300) ?? 'Bilinmeyen hata.')],
      }).catch(() => {});
    }
  },
};
