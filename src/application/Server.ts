import Amqp from 'amqplib'
import logger from '../utils/logger'
import { PullConsumer } from './pull/consumer';
import { DeleteConsumer } from './delete/consumer';

export class Server {

  private amqp!: Amqp.Connection

  constructor(
    private initializeCallback?: () => void
  ) {
    this.amqp;
    this.prepareConsumers()
  }

  async prepareAMQP() {
    const connection = await Amqp.connect({
      hostname: process.env.RABBIT_HOST,
      password: process.env.RABBIT_PASSWORD,
      username: process.env.RABBIT_USER,
    }).then((rs) => {
      logger.info('[Server][prepareAMQP]: connected to rabbit')
      return rs
    }).catch((error) => {
      logger.error('[Server][prepareAMPQ]: error on rabbit connection', error)
      return null
    })

    if (connection) {
      this.amqp = connection

      process.once("SIGINT", async () => {
        await this.amqp.close();
      });
    }
  }

  async prepareConsumers() {
    await this.prepareAMQP()

    new PullConsumer(this.amqp).register()
    new DeleteConsumer(this.amqp).register()
  }

  run() {
    this.initializeCallback && this.initializeCallback()
  }

}