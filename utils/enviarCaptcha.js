const { AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { createCaptchaImage, createCaptchaOptions } = require('./captcha');
const CaptchaConfig = require('../database/models/captchaConfig');
const logger = require('./logger');

async function enviarCaptcha(config, client) {
  try {
    const guild = await client.guilds.fetch(config.guildId);
    const channel = await guild.channels.fetch(config.channelId);

    if (!channel) {
      logger.error(`❌ Canal não encontrado para captcha no servidor ${guild.name}`);
      return;
    }

    const message = await channel.messages.fetch(config.messageId).catch(() => null);
    if (!message) {
      logger.error(`❌ Mensagem original de captcha não encontrada no servidor ${guild.name}`);
      return;
    }

    // Gera um novo captcha
    const { buffer, text: correctAnswer } = createCaptchaImage();
    const options = createCaptchaOptions(correctAnswer.toUpperCase()); // caixa alta aqui!

    const attachment = new AttachmentBuilder(buffer, { name: 'captcha.png' });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('captcha_select')
      .setPlaceholder('Escolha o texto correto')
      .addOptions(
        options.map(option => ({
          label: option.toUpperCase(), // caixa alta nas opções
          value: option.toUpperCase(),
        }))
      );

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('🔒 Verificação de Segurança')
      .setDescription('Selecione abaixo o texto que aparece na imagem para confirmar que você não é um robô.')
      .setImage('attachment://captcha.png')
      .setColor('Random')
      .setTimestamp();

    await message.edit({
      embeds: [embed],
      components: [row],
      files: [attachment],
    });

    // Atualiza no banco de dados o novo código correto
    config.correctAnswer = correctAnswer.toUpperCase();
    await config.save();

    logger.info(`🔄 Captcha atualizado no servidor ${guild.name}`);
  } catch (error) {
    logger.error(`❌ Erro ao atualizar captcha: ${error.stack || error}`);
  }
}

module.exports = enviarCaptcha;
