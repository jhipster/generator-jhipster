import { IUserData, NewUserData } from './user-data.model';

export const sampleWithRequiredData: IUserData = {
  id: 19797,
};

export const sampleWithPartialData: IUserData = {
  id: 27108,
};

export const sampleWithFullData: IUserData = {
  id: 8015,
  address: 'twine reboot instruction',
};

export const sampleWithNewData: NewUserData = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
