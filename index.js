require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const sequelize = require('./database/db');

// Criação do cliente do Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Coleções
client.commands = new Collection();
client.events = new Collection();

// Carregar Comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    logger.info(`✅ Comando carregado: ${command.data.name}`);
  } else {
    logger.warn(`⚠️ Comando ignorado (faltando data ou execute): ${file}`);
  }
}

// Carregar Eventos
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client, sequelize));
    logger.info(`🔂 Evento carregado (once): ${event.name}`);
  } else {
    client.on(event.name, (...args) => event.execute(...args, client, sequelize));
    logger.info(`🔁 Evento carregado: ${event.name}`);
  }
}

// Evento especial para capturar interações (Slash Commands)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    logger.warn(`⚠️ Comando não encontrado: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction, client, sequelize);
  } catch (error) {
    logger.error(`❌ Erro ao executar comando ${interaction.commandName}:`, error);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: '❌ Ocorreu um erro ao executar o comando.' });
    } else {
      await interaction.reply({ content: '❌ Ocorreu um erro ao executar o comando.', flags: 64 });
    }
  }
});

// Sincronizar o banco de dados
sequelize.sync()
  .then(() => logger.info('📂 Database sincronizada com sucesso!'))
  .catch(err => logger.error('❌ Erro ao sincronizar database:', err));

// Deploy de comandos
require('./deploy-commands');

// Login do Bot
client.login(process.env.DISCORD_TOKEN);
