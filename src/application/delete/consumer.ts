import { Consumer } from "../../domain/interfaces/Consumer";
import AMQP from 'amqplib'
import { UseCase } from "../../domain/interfaces/UseCase";
import { DeleteUseCase } from "./use-case";
import { checkAndSendToUseCase } from "../../utils/checkAndSendToUseCase";
import { imageProvider } from "../../infrastructure";
import { DeleteDTO } from "./dto";

export class DeleteConsumer implements Consumer {

  private queue = 'ecr_delete'
  private useCase: UseCase<DeleteDTO>
  private channel!: AMQP.Channel

  constructor(
    private connection: AMQP.Connection
  ) {
    this.useCase = new DeleteUseCase(imageProvider)
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