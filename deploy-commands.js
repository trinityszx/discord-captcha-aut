// deploy-commands.js
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
require('dotenv').config();

// Pegando o token e o clientId do .env
const { DISCORD_TOKEN, CLIENT_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  logger.error('❌ TOKEN ou CLIENT_ID não definidos no .env');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Lê todos os comandos
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    logger.warn(`⚠️ Comando em ${filePath} está faltando "data" ou "execute".`);
  }
}

// Instância da API do Discord
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

// Deploy dos comandos
(async () => {
  try {
    logger.info(`🔁 Atualizando ${commands.length} comando(s) no Discord...`);

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    logger.info('✅ Todos os comandos atualizados com sucesso!');
  } catch (error) {
    logger.error(`❌ Erro ao atualizar comandos: ${error}`);
  }
})();
