/** Nest Imports */
import { Module } from '@nestjs/common';
/** Servicio que expone los metodos necesarios para realizar una auditoria */
import { RabbitService } from './service';

@Module({
  imports: [],
  providers: [RabbitService],
  exports: [RabbitService],
})
export class RabbitMQModule {}
