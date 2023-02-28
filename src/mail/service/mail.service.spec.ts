import { MailerService } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from 'src/log';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;

  const LogServiceMock = {
    getLog: () => {
      return {
        info: () => {},
        error: () => {},
      };
    },
  };

  const MailerServiceMock = {
    sendMail: () => {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        MailService,
        {
          provide: LoggerService,
          useValue: LogServiceMock,
        },
        {
          provide: MailerService,
          useValue: MailerServiceMock,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
