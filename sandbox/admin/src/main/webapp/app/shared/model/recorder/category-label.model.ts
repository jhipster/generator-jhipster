import { IRecord } from 'app/shared/model/recorder/record.model';
import { IUserProfile } from 'app/shared/model/recorder/user-profile.model';

export interface ICategoryLabel {
  id?: number;
  name?: string;
  description?: string;
  authorityAttach?: string;
  records?: IRecord[] | null;
  userProfiles?: IUserProfile[] | null;
}

export const defaultValue: Readonly<ICategoryLabel> = {};
