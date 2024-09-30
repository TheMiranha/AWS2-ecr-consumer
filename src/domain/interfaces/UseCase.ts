import { InternalChannel } from "../types/InternalChannel";

export interface UseCase<ParamsDTO> {

  execute(props: ParamsDTO, channel: InternalChannel): Promise<void>

}