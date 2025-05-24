// events/guildMemberAdd.js
const CaptchaConfig = require('../database/models/captchaConfig');
const { generateCaptcha } = require('../utils/captcha');
const { EmbedBuilder, ActionRowBuilder, TextInputBuilder, ModalBuilder, TextInputStyle } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  name: 'guildMemberAdd',
  
  async execute(member) {
    try {
      // Buscar a configuração do captcha para o servidor
      const config = await CaptchaConfig.findOne({ where: { guildId: member.guild.id } });
      if (!config) return; // Se não tiver configuração, não faz nada

      const channel = await member.guild.channels.fetch(config.channelId);
      if (!channel || !channel.isTextBased()) {
        logger.warn(`⚠️ Canal de captcha inválido em ${member.guild.name}`);
        return;
      }

      // Gerar captcha
      const { buffer, text } = await generateCaptcha();

      // Salvar o captcha gerado TEMPORARIAMENTE em cache (faremos depois)
      member.client.captchaCache = member.client.captchaCache || new Map();
      member.client.captchaCache.set(member.id, {
        solution: text,
        roleId: config.roleId,
      });

      // Criar um embed
      const embed = new EmbedBuilder()
        .setTitle('🔒 Verificação de Segurança')
        .setDescription('Resolva o CAPTCHA abaixo para liberar acesso ao servidor.')
        .setImage('attachment://captcha.png')
        .setColor(0x5865F2);

      // Modal para o usuário digitar
      const modal = new ModalBuilder()
        .setCustomId(`captcha-${member.id}`)
        .setTitle('Verificação de CAPTCHA')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('captcha-input')
              .setLabel('Digite o texto do captcha')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );

      // Enviar o embed + abrir modal
      const message = await channel.send({
        content: `${member}`,
        embeds: [embed],
        files: [{ attachment: buffer, name: 'captcha.png' }],
      });

      

      // Salvar o ID da mensagem caso precise atualizar
      config.messageId = message.id;
      await config.save();

      setTimeout(async () => {
        try {
          await member.send({ content: '🛡️ Para completar o captcha, abra o servidor e responda a verificação.' });
        } catch (err) {
          logger.warn(`⚠️ Não consegui enviar DM para ${member.user.tag}`);
        }
      }, 2000);
      
      // Start captcha updater
        member.client.captchaUpdater = member.client.captchaUpdater || new (require('../utils/captchaUpdater'))(member.client);
        await member.client.captchaUpdater.start(member, config);
      
      // Quando abrir modal (iremos criar o listener depois)

    } catch (error) {
      logger.error(`Erro ao lidar com novo membro: ${error}`);
    }
  },
};
