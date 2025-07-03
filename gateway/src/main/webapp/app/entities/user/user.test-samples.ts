import { IUser } from './user.model';

export const sampleWithRequiredData: IUser = {
  id: 24814,
  login: 'nuGud',
};

export const sampleWithPartialData: IUser = {
  id: 966,
  login: 'a',
};

export const sampleWithFullData: IUser = {
  id: 5440,
  login: 'h',
};
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
