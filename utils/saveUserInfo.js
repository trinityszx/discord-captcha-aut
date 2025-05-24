const UserInfo = require('../database/models/userInfo');
const logger = require('./logger');

async function saveUserInfo(member) {
  try {
    const { user } = member;
    const userData = {
      userId: user.id,
      username: user.username,
      discriminator: user.discriminator,
      tag: `${user.username}#${user.discriminator}`,
      avatar: user.avatar,
      joinedAt: member.joinedAt,
      createdAtDiscord: user.createdAt,
      isBot: user.bot
    };

    const [record, created] = await UserInfo.findOrCreate({
      where: { userId: user.id },
      defaults: userData
    });

    if (!created) {
      await record.update(userData);
      logger.info(`🔁 Informações do usuário ${user.username} atualizadas.`);
    } else {
      logger.info(`🆕 Informações do usuário ${user.username} salvas com sucesso.`);
    }

    const count = await UserInfo.count();
    logger.info(`📌 ${user.username} (ID: ${user.id}) registrado como usuário nº ${count}.`);

  } catch (error) {
    logger.error(`❌ Erro ao salvar informações do usuário: ${error.message}`);
  }
}

module.exports = saveUserInfo;
