import { IRecord } from 'app/shared/model/recorder/record.model';
import { IUserProfile } from 'app/shared/model/recorder/user-profile.model';

export interface ISearchLabel {
  id?: number;
  name?: string;
  description?: string | null;
  records?: IRecord[] | null;
  userProfile?: IUserProfile | null;
}

export const defaultValue: Readonly<ISearchLabel> = {};
