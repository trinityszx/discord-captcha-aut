const { SlashCommandBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { createCaptchaImage, createCaptchaOptions } = require('../utils/captcha');
const CaptchaConfig = require('../database/models/captchaConfig');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('captchasetup')
    .setDescription('Configura o sistema de captcha para o servidor')
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('Canal onde o captcha será enviado')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('cargo')
        .setDescription('Cargo a ser atribuído após a verificação')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('intervalo')
        .setDescription('Tempo em segundos para atualizar o captcha')
        .setMinValue(30)
        .setRequired(true)),

  async execute(interaction) {
    try {
      const channel = interaction.options.getChannel('canal');
      const role = interaction.options.getRole('cargo');
      const interval = interaction.options.getInteger('intervalo');
      const guildId = interaction.guild.id;

      const { buffer, text: correctAnswer } = createCaptchaImage();
      const options = createCaptchaOptions(correctAnswer);

      const attachment = new AttachmentBuilder(buffer, { name: 'captcha.png' });

      const menu = new StringSelectMenuBuilder()
        .setCustomId('captcha_select')
        .setPlaceholder('Escolha o texto correto')
        .addOptions(
          options.map(option => ({
            label: option,
            value: option,
          }))
        );

      const row = new ActionRowBuilder().addComponents(menu);

      const embed = new EmbedBuilder()
        .setTitle('🔒 Verificação de Segurança')
        .setDescription('Selecione abaixo o texto correto da imagem para confirmar!')
        .setImage('attachment://captcha.png')
        .setColor('Random');

      const message = await channel.send({
        embeds: [embed],
        components: [row],
        files: [attachment],
      });

      const [config, created] = await CaptchaConfig.findOrCreate({
        where: { guildId },
        defaults: {
          guildId,
          channelId: channel.id,
          roleId: role.id,
          updateInterval: interval,
          messageId: message.id,
          correctAnswer,
        },
      });

      if (!created) {
        config.channelId = channel.id;
        config.roleId = role.id;
        config.updateInterval = interval;
        config.messageId = message.id;
        config.correctAnswer = correctAnswer;
        await config.save();
        logger.info(`🛠️ Configuração de captcha atualizada para ${interaction.guild.name}`);
      } else {
        logger.info(`🛠️ Nova configuração de captcha criada para ${interaction.guild.name}`);
      }

      await interaction.reply({ content: '✅ Captcha configurado com sucesso!', flags: 64 });
    } catch (error) {
      logger.error(`❌ Erro ao executar comando captchasetup: ${error.message}`);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Erro ao configurar captcha.', flags: 64 });
      }
    }
  },
};
