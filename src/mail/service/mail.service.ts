import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Logger } from 'log4js';
import { IDataRender, ISendMail } from 'src/common/interfaces/interfaces';
import { LoggerService } from 'src/log';
import * as ejs from 'ejs';

@Injectable()
export class MailService {
  private readonly log: Logger;

  constructor(
    private mailerService: MailerService,
    private readonly loggerService: LoggerService,
  ) {
    this.log = this.loggerService.getLog();
  }

  public async sendMail(data: ISendMail): Promise<any> {
    try {
      this.log.info('sendMail: ', data);
      const html = await this.renderTemplate(data);
      return await this.mailerService.sendMail({
        to: data.to,
        subject: data.subject,
        html,
      });
    } catch (errorSendMail) {
      this.log.error(errorSendMail);
    }
  }

  private async renderTemplate(dataRender: IDataRender): Promise<any> {
    try {
      return await ejs.renderFile(dataRender.filePath, dataRender.data);
    } catch (errorRenderTemplate) {
      this.log.error(errorRenderTemplate);
    }
  }
}
