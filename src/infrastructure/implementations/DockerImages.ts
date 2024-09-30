import Dockerode from "dockerode";
import logger from "../../utils/logger";
import { DeleteImage, IImages, PullImage } from "../IImages";
import { createClient } from "redis";

export class DockerImages implements IImages {

  private docker: Dockerode;


  constructor() {
    this.docker = new Dockerode({ host: 'localhost', port: 2375 })
  }

  async pullImage({ image, callBack }: PullImage['props']) {

    logger.info('[DockerImages][pullImage]: pull image action - ' + image)

    const internalDocker = this.docker

    const client = createClient({
      url: `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    })

    await client.connect()

    await internalDocker.pull(image, function (error: any, stream: NodeJS.ReadableStream) {

      if (error) {
        logger.error('[DockerImages][pullImage]: error on pull', error)
        throw error
      }

      const redisKey = 'ecr-pulling:' + image
      internalDocker.modem.followProgress(stream, onFinished, onProgress);

      async function onFinished(err: Error | null, output: any) {
        client.del(redisKey)

        if (err) {
          logger.error('[DockerImages][pullImage]: error on finished', err)
          throw error
        }
        await client.hSet(redisKey, {
          ...output[output.length - 1],
          finished: 'true'
        })

        logger.info('[DockerImages][pullImage]: ' + image + ' image downloaded', output)
        callBack && callBack(image)
      }
      function onProgress(event: any) {
        if (event.progressDetail?.current) {
          client.hSet(redisKey, {
            current: event.progressDetail.current,
            total: event.progressDetail.total,
            status: event.status,
            finished: 'false'
          })
        }
      }
    });
  }

  async deleteImage({ imageId }: DeleteImage["props"]): Promise<void> {

    logger.info('[DockerImages][deleteImage]: delete image action - ' + imageId)

    const client = createClient({
      url: `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    })

    await client.connect()

    const redisKey = 'removing:' + imageId

    client.set(redisKey, 'progress...')

    logger.info('[DockerImages][deleteImage]: removing image ' + imageId + '...')

    try {
      await this.docker.getImage(imageId).remove()
    } catch (error) {
      logger.error('[DockerImages][deleteImage]: image not found: ' + imageId, error)
      throw error
    }

    client.del(redisKey)

    logger.info('[DockerImages][deleteImage]: image ' + imageId + ' removed.')

  }

}