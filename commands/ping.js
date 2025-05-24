const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🏓 Testa a latência do bot'),

  async execute(interaction) {
    const sent = await interaction.reply({ content: '🏓 Pingando...', fetchReply: true });
    
    const pingBot = sent.createdTimestamp - interaction.createdTimestamp;
    const pingApi = interaction.client.ws.ping;

    await interaction.editReply(`🏓 Pong!\n🖥️ Latência do Bot: **${pingBot}ms**\n📡 Latência da API: **${pingApi}ms**`);
  },
};
