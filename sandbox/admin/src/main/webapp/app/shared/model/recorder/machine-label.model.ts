import { IRecord } from 'app/shared/model/recorder/record.model';
import { IUserGroup } from 'app/shared/model/recorder/user-group.model';
import { IUserProfile } from 'app/shared/model/recorder/user-profile.model';

export interface IMachineLabel {
  id?: number;
  name?: string;
  value?: string | null;
  records?: IRecord[] | null;
  userGroups?: IUserGroup[] | null;
  userProfiles?: IUserProfile[] | null;
}

export const defaultValue: Readonly<IMachineLabel> = {};
