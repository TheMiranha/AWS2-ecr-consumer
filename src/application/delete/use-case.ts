import { UseCase } from "../../domain/interfaces/UseCase";
import { InternalChannel } from "../../domain/types/InternalChannel";
import { IImages } from "../../infrastructure/IImages";
import { DeleteDTO } from "./dto";

export class DeleteUseCase implements UseCase<DeleteDTO> {

  constructor(
    private imageProvider: IImages
  ) { }

  async execute(props: DeleteDTO, channel: InternalChannel) {

    const sendNotification = () => {
      channel.sendToQueue('notifications', Buffer.from(JSON.stringify({ type: 'success', message: 'Imagem ' + props.imageId + ' baixada com sucesso' })))
      channel.sendToQueue('dynamic', Buffer.from(JSON.stringify({ service: 'ecr', action: 'pullImage', image: props.imageId })))
    }

    try {
      await this.imageProvider.deleteImage(props)
      channel.sendToQueue('notifications', Buffer.from(JSON.stringify({ type: 'success', message: 'Imagem deletada com sucesso!', imageId: props.imageId })))
      sendNotification()
    } catch (error) {
      channel.sendToQueue('notifications', Buffer.from(JSON.stringify({ type: 'error', message: 'Erro ao deletar a imagem ' + props.imageId, imageId: props.imageId })))
    }
  }

}