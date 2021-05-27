import dayjs from 'dayjs';
import { IChannel } from 'app/shared/model/recorder/channel.model';
import { ICategoryLabel } from 'app/shared/model/recorder/category-label.model';
import { ISearchLabel } from 'app/shared/model/recorder/search-label.model';
import { IMachineLabel } from 'app/shared/model/recorder/machine-label.model';

export interface IRecord {
  id?: number;
  date?: string;
  length?: number;
  throwAway?: boolean | null;
  threat?: boolean | null;
  channel?: IChannel;
  categoryLabels?: ICategoryLabel[] | null;
  searchLabels?: ISearchLabel[] | null;
  machineLabels?: IMachineLabel[] | null;
}

export const defaultValue: Readonly<IRecord> = {
  throwAway: false,
  threat: false,
};
