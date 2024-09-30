import { UseCase } from "../../domain/interfaces/UseCase";
import { InternalChannel } from "../../domain/types/InternalChannel";
import { IImages } from "../../infrastructure/IImages";
import { PullDTO } from "./dto";

export class PullUseCase implements UseCase<PullDTO> {

  constructor(
    private imageProvider: IImages
  ) { }

  async execute(props: PullDTO, channel: InternalChannel) {

    const sendNotification = () => {
      channel.sendToQueue('notifications', Buffer.from(JSON.stringify({ type: 'success', message: 'Imagem ' + props.image + ' baixada com sucesso' })))
      channel.sendToQueue('dynamic', Buffer.from(JSON.stringify({ service: 'ecr', action: 'pullImage', image: props.image })))
    }

    try {
      await this.imageProvider.pullImage({ ...props, callBack: sendNotification })

    } catch (error) {
      channel.sendToQueue('notifications', Buffer.from(JSON.stringify({ type: 'error', message: 'Erro ao baixar a imagem ' + props.image })))
    }
  }

}