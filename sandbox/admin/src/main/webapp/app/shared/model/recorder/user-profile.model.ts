import { ISearchLabel } from 'app/shared/model/recorder/search-label.model';
import { INode } from 'app/shared/model/recorder/node.model';
import { ICategoryLabel } from 'app/shared/model/recorder/category-label.model';
import { IMachineLabel } from 'app/shared/model/recorder/machine-label.model';
import { IUserGroup } from 'app/shared/model/recorder/user-group.model';

export interface IUserProfile {
  id?: number;
  principal?: string;
  searchLabels?: ISearchLabel[] | null;
  actualNode?: INode | null;
  assignedNodes?: INode[] | null;
  assignedCategories?: ICategoryLabel[] | null;
  machineLabels?: IMachineLabel[] | null;
  userGroups?: IUserGroup[] | null;
}

export const defaultValue: Readonly<IUserProfile> = {};
