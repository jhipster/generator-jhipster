import { IUserProfile } from 'app/shared/model/recorder/user-profile.model';
import { IMachineLabel } from 'app/shared/model/recorder/machine-label.model';

export interface IUserGroup {
  id?: number;
  name?: string;
  description?: string | null;
  userProfiles?: IUserProfile[] | null;
  machineLabels?: IMachineLabel[] | null;
}

export const defaultValue: Readonly<IUserGroup> = {};
