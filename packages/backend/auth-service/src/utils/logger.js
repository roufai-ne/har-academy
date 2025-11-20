const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json, colorize, printf } = format;

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    json(),
    format.errors({ stack: true }),
  ),
  defaultMeta: { service: 'auth-service' },
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        printf(({ level, message, timestamp, ...meta }) => {
          return `${timestamp} ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      ),
    }),
  ],
});

module.exports = logger;