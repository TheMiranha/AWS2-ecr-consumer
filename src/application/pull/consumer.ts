import { Consumer } from "../../domain/interfaces/Consumer";
import AMQP from 'amqplib'
import { UseCase } from "../../domain/interfaces/UseCase";
import { PullDTO } from "./dto";
import { PullUseCase } from "./use-case";
import { checkAndSendToUseCase } from "../../utils/checkAndSendToUseCase";
import { imageProvider } from "../../infrastructure";

export class PullConsumer implements Consumer {

  private queue = 'ecr_pull'
  private useCase: UseCase<PullDTO>
  private channel!: AMQP.Channel

  constructor(
    private connection: AMQP.Connection
  ) {
    this.useCase = new PullUseCase(imageProvider)
    this.channel;
  }

  async register() {
    const ch = await this.connection.createChannel()
    this.channel = ch;

    await this.channel.consume(this.queue, message => {
      checkAndSendToUseCase(message, this.useCase, ch)
    }, { noAck: true })
  }

}