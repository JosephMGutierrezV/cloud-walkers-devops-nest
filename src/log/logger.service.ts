import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configure, getLogger, Logger } from 'log4js';

@Injectable()
export class LoggerService {
  constructor(private readonly config: ConfigService) {
    const logConfigLevel = this.config.get('LOG_LEVEL');
    const logLevel = logConfigLevel ? logConfigLevel : 'all';
    const layout = {
      type: 'pattern',
      pattern: '[%d{ISO8601}]-[%z]-[%p]-[%f{-2}:%l:%o]\t%m',
      tokens: {},
    };
    configure({
      appenders: {
        file: {
          type: 'file',
          filename: 'logs/application.log',
          maxLogSize: 10000000,
          compress: true,
          backups: 10,
          keepFileExt: true,
          daysToKeep: 1,
          layout,
        },
        console: {
          type: 'console',
          layout,
        },
      },
      categories: {
        default: {
          appenders: ['file', 'console'],
          level: logLevel,
          enableCallStack: true,
        },
      },
    });
  }

  /**
   * Retorna instalcia de logger
   * @returns {Logger}
   */
  getLog(): Logger {
    return getLogger('default');
  }
}
