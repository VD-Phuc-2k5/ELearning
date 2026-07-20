import { LoggerService } from '@nestjs/common';
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const targets: pino.TransportTargetOptions[] = [];

if (isDev) {
  targets.push({
    target: 'pino-pretty',
    level: 'info',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
    },
  });
}

targets.push({
  target: 'pino/file',
  level: 'info',
  options: { destination: './logs/api.log', mkdir: true },
});

const logger = pino(
  {
    level: 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.transport({ targets }),
);

export class PinoLogger implements LoggerService {
  log(message: string, context?: string) {
    logger.info({ context }, message);
  }

  error(message: string, trace?: string, context?: string) {
    logger.error({ context, trace }, message);
  }

  warn(message: string, context?: string) {
    logger.warn({ context }, message);
  }

  debug(message: string, context?: string) {
    logger.debug({ context }, message);
  }

  verbose(message: string, context?: string) {
    logger.trace({ context }, message);
  }
}
