const logger = require('../utils/logger');
const startCaptchaUpdater = require('../utils/captchaUpdate');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    logger.info(`✅ Bot conectado como ${client.user.tag}`);

    // Inicia o sistema de atualização de captcha
    await startCaptchaUpdater(client);
    logger.info('🔄 Sistema de atualização de captcha iniciado');
  },
};
