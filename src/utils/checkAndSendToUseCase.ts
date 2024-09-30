import { InternalConsumeMessage } from '../domain/types/InternalConsumeMessage';
import { UseCase } from '../domain/interfaces/UseCase';
import { InternalChannel } from '../domain/types/InternalChannel';

export function checkAndSendToUseCase<T>(message: InternalConsumeMessage | null, useCase: UseCase<T>, channel: InternalChannel) {
  if (!message?.content.toString()) return
  const data: T = JSON.parse(message.content.toString())

  useCase.execute(data, channel)
}