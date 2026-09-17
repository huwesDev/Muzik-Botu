const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');

const COLORS = { blue: 0x5865F2, red: 0xED4245 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Mevcut şarkıyı atla')
    .addIntegerOption(o =>
      o.setName('adet').setDescription('Kaç şarkı atlanacak? (varsayılan: 1)').setMinValue(1).setMaxValue(50)
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

    const count = interaction.options.getInteger('adet') ?? 1;
    const skipped = queue.songs[0];

    try {
      if (count > 1) {
        const remove = Math.min(count - 1, queue.songs.length - 1);
        queue.songs.splice(1, remove);
      }
      await queue.skip();

      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.blue)
          .setTitle('Atlandı')
          .setDescription(`**${skipped.name}**${count > 1 ? `\n+${count - 1} şarkı daha atlandı.` : ''}`)],
      });
    } catch (err) {
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.red).setDescription(err.message)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
