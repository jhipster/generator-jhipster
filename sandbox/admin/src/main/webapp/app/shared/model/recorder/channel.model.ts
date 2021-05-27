import { INode } from 'app/shared/model/recorder/node.model';
import { MediaType } from 'app/shared/model/enumerations/media-type.model';

export interface IChannel {
  id?: number;
  mediaType?: MediaType;
  name?: string;
  throwAwayAllowed?: boolean | null;
  threatAllowed?: boolean | null;
  nodes?: INode[] | null;
}

export const defaultValue: Readonly<IChannel> = {
  throwAwayAllowed: false,
  threatAllowed: false,
};
