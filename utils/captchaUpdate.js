const CaptchaConfig = require('../database/models/captchaConfig');
const enviarCaptcha = require('../utils/enviarCaptcha');
const logger = require('../utils/logger');

async function startCaptchaUpdater(client) {
  try {
    const configs = await CaptchaConfig.findAll();
    configs.forEach(config => {
      setInterval(async () => {
        await enviarCaptcha(config, client);
      }, config.updateInterval * 1000);
      logger.info(`🔄 Atualizador iniciado para o servidor ${config.guildId} a cada ${config.updateInterval} segundos`);
    });
  } catch (error) {
    logger.error(`❌ Erro ao iniciar atualizador de captcha: ${error.message}`);
  }
}

module.exports = startCaptchaUpdater;
