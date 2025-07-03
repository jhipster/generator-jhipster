import { INotification, NewNotification } from './notification.model';

export const sampleWithRequiredData: INotification = {
  id: 10110,
  title: 'reclassify makeover',
};

export const sampleWithPartialData: INotification = {
  id: 27987,
  title: 'despite anesthetize because',
};

export const sampleWithFullData: INotification = {
  id: 5787,
  title: 'some extra-large',
};

export const sampleWithNewData: NewNotification = {
  title: 'consequently voluntarily ew',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
