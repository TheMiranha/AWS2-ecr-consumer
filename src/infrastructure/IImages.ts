import type { InternalImage } from "../domain/types/internalImage"

export type GetImages = {
  response: {
    images: InternalImage[]
  }
}

export type PullImage = {
  props: {
    image: string
    callBack?: (image: string) => void
  }
}

export type DeleteImage = {
  props: {
    imageId: string
  }
}

export interface IImages {

  pullImage(props: PullImage['props']): Promise<void>
  deleteImage(props: DeleteImage['props']): Promise<void>

}