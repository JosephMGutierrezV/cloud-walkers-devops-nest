export interface ICustomOptions {
  envFilePath: string;
  isGlobal: boolean;
  load: any[];
  validationSchema: any;
}

export interface IDataRender {
  filePath: string;
  data: any;
}

// extiende de IDataRender
export interface ISendMail extends IDataRender {
  to: string;
  subject: string;
}
