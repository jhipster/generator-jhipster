import { IChannel } from 'app/shared/model/recorder/channel.model';
import { IUserProfile } from 'app/shared/model/recorder/user-profile.model';

export interface INode {
  id?: number;
  name?: string;
  description?: string | null;
  timeToLive?: number | null;
  parent?: INode | null;
  channels?: IChannel[] | null;
  userProfiles?: IUserProfile[] | null;
}

export const defaultValue: Readonly<INode> = {};
