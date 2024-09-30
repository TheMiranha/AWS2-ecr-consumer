import { IImages } from "./IImages";
import { DockerImages } from "./implementations/DockerImages";

const imageProvider: IImages = new DockerImages()

export {
  imageProvider,
}

