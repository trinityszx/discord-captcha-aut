const CaptchaConfig = require('../database/models/captchaConfig');
const logger = require('../utils/logger');
const saveUserInfo = require('../utils/saveUserInfo');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'captcha_select') {
      try {
        const config = await CaptchaConfig.findOne({ where: { guildId: interaction.guild.id } });
        if (!config) {
          return await interaction.reply({ content: '⚠️ Configuração de captcha não encontrada.', flags: 64 });
        }

        if (interaction.values[0] === config.correctAnswer) {
          // Atribuindo o cargo
          const role = interaction.guild.roles.cache.get(config.roleId);
          if (role) {
            // Atribuindo cargo
            await interaction.member.roles.add(role);
            logger.info(`✅ Cargo atribuído ao usuário ${interaction.member.user.tag}.`);
          }

          // Envia a resposta da interação antes de salvar o usuário
          await interaction.reply({ content: '✅ Verificação com sucesso! Cargo atribuído.', flags: 64 });

          // Salva as informações do usuário após a interação ser respondida
          saveUserInfo(interaction.member)
            .then(() => {
              logger.info(`📝 Informações do usuário ${interaction.member.user.tag} salvas com sucesso.`);
            })
            .catch(error => {
              logger.error(`❌ Erro ao salvar as informações do usuário ${interaction.member.user.tag}: ${error.message}`);
            });

        } else {
          await interaction.reply({ content: '❌ Verificação incorreta. Tente novamente!', flags: 64 });
        }
      } catch (error) {
        logger.error(`❌ Erro no interactionCreate captcha: ${error.message}`);
        // Resposta de erro ao usuário
        await interaction.reply({ content: '❌ Ocorreu um erro ao processar sua verificação. Tente novamente.', flags: 64 });
      }
    }
  },
};
