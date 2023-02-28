/** NestJS */
import { Injectable } from '@nestjs/common';

/** Servicio logger */

import { Logger } from 'log4js';
import { LoggerService } from 'src/log/logger.service';

/** Otras importaciones */
const amqp = require('amqplib');

@Injectable()
export class RabbitService {
  private credentials;
  private rabbitMQIndexServer: number = 0;

  /** Variable para manejo de logs */
  private readonly log: Logger;

  constructor(private readonly loggerService: LoggerService) {
    this.log = this.loggerService.getLog();
  }

  /**
   * Función que establece las credenciales de Credential Manager
   * @param {Object} credentials
   * @memberof RabbitService
   */
  setCredentials(credentials) {
    this.credentials = credentials;
  }

  /**
   * Función que devuelve las conexiones actuales de Credential manager
   * @returns {Object}
   * @memberof RabbitService
   */
  getCredentials() {
    return this.credentials;
  }

  /**
   * Función que controla la falla de conexión de RabbitMQ
   * @param {any} error
   * @returns {Promise<any>}
   * @memberof RabbitService
   */
  public async failedConnection(error: any): Promise<any> {
    if (error['code'] === 'ETIMEDOUT') {
      this.log.error(
        'RabbitService > failedConnection > Error de conexión con RabbitMQ',
        'Error TIMEOUT',
        this.credentials['rabbitMQ']['instances'][this.rabbitMQIndexServer]
          .hosts,
      );
    } else if (error['code'] === 'ECONNREFUSED') {
      this.log.error(
        'RabbitService > failedConnection > Error de conexión con RabbitMQ',
        'Error ECONNREFUSED',
        this.credentials['rabbitMQ']['instances'][this.rabbitMQIndexServer]
          .hosts,
      );
    } else if (error['code'] === 'ECONNRESET') {
      this.log.error(
        'RabbitService > failedConnection > Error de conexión con RabbitMQ',
        'Error ECONNRESET',
        this.credentials['rabbitMQ']['instances'][this.rabbitMQIndexServer]
          .hosts,
      );
    }

    if (
      this.rabbitMQIndexServer ===
      this.credentials['rabbitMQ']['instances'].length - 1
    ) {
      this.log.warn(
        'RabbitService > failedConnection - Se ha llegado al último servidor posible de rabbitMQ',
      );
      throw error;
    } else {
      this.log.warn(
        'RabbitService > failedConnection - Error conectando a servicio RabbitMQ',
        this.getCredentialsConection(this.credentials['rabbitMQ']['instances']),
      );
      this.rabbitMQIndexServer++;

      this.log.warn(
        'RabbitService > failedConnection - Intentando conectar al siguiente servicio en la lista',
        this.getCredentialsConection(this.credentials['rabbitMQ']['instances']),
      );
      return this.getConnection(true);
    }
  }

  /**
   * Función que obtiene url de conexión con rabbit mq para flujo de carga en listas negras
   * @returns {Promise<any>}
   * @memberof RabbitService
   */
  public async getConnection(isRescursive = false): Promise<any> {
    this.log.trace('RabbitService > getConnection');

    // Se devuelve a cero el contador cuando es un llamado inicial
    if (isRescursive === false) {
      this.rabbitMQIndexServer = 0;
    }

    const urlConnection = this.getCredentialsConection(
      this.credentials['rabbitMQ']['instances'],
    );
    try {
      const connection = await amqp.connect(
        urlConnection,
        async (error, connectionRabbit) => {
          try {
            if (error) {
              throw error;
            }
            return connectionRabbit;
          } catch (errorConnect) {
            return this.failedConnection(errorConnect);
          }
        },
      );

      this.log.info(
        'RabbitService > getConnection - Servicio RabbitMQ conectado exitosamente',
        this.getCredentialsConection(this.credentials['rabbitMQ']['instances']),
      );
      return connection;
    } catch (error) {
      return this.failedConnection(error);
    }
  }

  /**
   * Crea la conexión con Rabbit para crear el consumer
   * @param {Array<any>} credentials
   * @return {string}
   * @memberof RabbitService
   */
  getCredentialsConection(credentials: Array<any>): string {
    const user =
      process.env.RABBITMQ_USER || credentials[this.rabbitMQIndexServer].user;
    const password =
      process.env.RABBITMQ_PASS ||
      credentials[this.rabbitMQIndexServer].password;
    const host =
      process.env.RABBIT_HOST || credentials[this.rabbitMQIndexServer].hosts;
    const port =
      process.env.RABBIT_PORT || credentials[this.rabbitMQIndexServer].port;
    const vhost =
      process.env.RABBITMQ_VHOST || credentials[this.rabbitMQIndexServer].vhost;

    return `amqp://${user}:${password}@${host}:${port}/${vhost}`;
  }

  /**
   * Listener que se ejecuta para escuchar los mensajes de RabbitMQ para la actualización del contenido de la lista negra
   * @param {string} exchangeName
   * @param {Function} callback
   * @memberof RabbitService
   */
  public async exchangeConsume(exchangeName: string, callBack: Function) {
    this.log.trace('RabbitService > exchangeConsume');
    try {
      // Conectando con Rabbit
      const connection = await this.getConnection();
      const channel = await connection.createChannel();

      await channel.assertExchange(exchangeName, 'fanout', { durable: false });
      const assertQueueMsg = await channel.assertQueue('', { exclusive: true });
      await channel.bindQueue(assertQueueMsg.queue, exchangeName, '');
      channel.consume(assertQueueMsg.queue, async (msg) => {
        if (msg.content) {
          const contentMsg: string = JSON.parse(msg.content.toString());
          this.log.info(
            `RabbitService > exchangeConsume - [Mensaje recibido - Exchange - ${exchangeName}]`,
          );
          this.log.debug(`RabbitService > exchangeConsume`, contentMsg);

          callBack(
            contentMsg,
            () => {
              // Aceptar mensaje
              channel.ack(msg);
            },
            () => {
              // Rechazar mensaje
              channel.nack(msg);
            },
          );
        }
      });

      this.log.info(
        `RabbitService > exchangeConsume - Escuchando mensajes de rabbit`,
      );
      return connection;
    } catch (error) {
      this.log.error('RabbitService > exchangeConsume ', error);
      throw error;
    }
  }

  /**
   * Función que permite emitir @message a la cola configurada
   * @param {*} message
   * @param {string} exchangeName
   * @returns {Promise<boolean>}
   * @memberof RabbitProducerService
   */
  public async exchangeProduce(
    message: any,
    exchangeName: string,
  ): Promise<boolean> {
    this.log.trace('RabbitService > exchangeProduce');
    try {
      // Mensaje para enviar a Rabbit

      const msgRmqStringify = JSON.stringify(message);
      this.log.info(
        `RabbitService > exchangeProduce [Intentando enviar mensaje - Exchange - ${exchangeName} :: ${msgRmqStringify}]`,
      );

      // Conectando con Rabbit
      const connection = await this.getConnection();
      const channel = await connection.createChannel();

      await channel.assertExchange(exchangeName, 'fanout', { durable: false });

      // Publicación de mensaje hacía Rabbit
      channel.publish(exchangeName, '', Buffer.from(msgRmqStringify));

      // Cierra la conexión con RabbitMQ
      setTimeout(() => {
        connection.close();
        this.log.info(
          `RabbitService > exchangeProduce - Conexión con Rabbit cerrada`,
        );
      }, 500);

      return true;
    } catch (error) {
      this.log.error(error);
      throw error;
    }
  }

  /**
   * Listener que se ejecuta para escuchar los mensajes de RabbitMQ para la actualización del contenido de la lista negra
   * @param {string} queueName
   * @param {Function} callback
   * @memberof RabbitService
   */
  public async queueConsume(queueName: string, callBack: Function) {
    this.log.trace('RabbitService > queueConsume');

    try {
      // Conectando con Rabbit
      const connection = await this.getConnection();
      const channel = await connection.createChannel();
      channel.assertQueue(queueName, { durable: true });
      channel.consume(queueName, async (msg) => {
        try {
          if (msg.content) {
            const contentMsg: string = JSON.parse(msg.content.toString());
            this.log.info(
              `RabbitService > queueConsume - [Mensaje recibido - Queue - ${queueName}]`,
            );
            this.log.debug(`RabbitService > queueConsume`, contentMsg);

            callBack(
              contentMsg,
              () => {
                // Aceptar mensaje
                channel.ack(msg);
              },
              () => {
                // Rechazar mensaje
                channel.nack(msg);
              },
            );
          }
        } catch (error) {
          channel.assertQueue(queueName, { durable: true });
          connection.close();
          this.queueConsume(queueName, callBack);
        }
      });

      this.log.info(
        `RabbitService > queueConsume - Escuchando mensajes de rabbit`,
      );
      return connection;
    } catch (error) {
      this.log.error('RabbitService > queueConsume ', error);
      throw error;
    }
  }

  /**
   * Metodo para enviar mensaje a rabbitMQ
   * @param {string} queueName
   * @param {*} data
   * @returns {Promise<boolean>}
   */
  public async queueProduce(queueName: string, data: any): Promise<boolean> {
    this.log.info(
      `RabbitService > queueProduce`,
      `Intentando enviar mensaje a la cola [${queueName}}] :: data: ${JSON.stringify(
        data,
      )} `,
    );

    try {
      const connection = await this.getConnection();
      const channel = await connection.createChannel();
      await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));

      this.log.info(
        `RabbitService > queueProduce`,
        `Mensaje "${JSON.stringify(data)}" enviado - cola ${queueName}`,
      );

      // Cierra la conexión con RabbitMQ
      setTimeout(() => {
        connection.close();
        this.log.info(
          `RabbitService > queueProduce - Conexión con Rabbit cerrada`,
        );
      }, 500);

      return true;
    } catch (error) {
      this.log.error(error);
      throw error;
    }
  }
}
