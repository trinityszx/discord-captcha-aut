const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const kleur = require('kleur');

// Formato de log para Console (com cores)
const consoleFormat = format.printf(({ timestamp, level, message }) => {
  let lvl = level.toUpperCase();
  switch (lvl) {
    case 'INFO':
      lvl = kleur.cyan(`[${lvl}]`);
      break;
    case 'WARN':
      lvl = kleur.yellow(`[${lvl}]`);
      break;
    case 'ERROR':
      lvl = kleur.red(`[${lvl}]`);
      break;
    case 'DEBUG':
      lvl = kleur.green(`[${lvl}]`);
      break;
    default:
      lvl = `[${lvl}]`;
  }
  return `${timestamp} ${lvl} ${message}`;
});

// Formato para arquivos (sem cor)
const fileFormat = format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level.toUpperCase()}] ${message}`;
});

// Criação do logger
const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  transports: [
    // Console (colorido)
    new transports.Console({
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      )
    }),
    // Logs combinados (todos os níveis)
    new transports.DailyRotateFile({
      filename: path.join(__dirname, '..', 'logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        fileFormat
      )
    }),
    // Logs de erro (somente erro)
    new transports.DailyRotateFile({
      level: 'error',
      filename: path.join(__dirname, '..', 'logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        fileFormat
      )
    })
  ]
});

module.exports = logger;
