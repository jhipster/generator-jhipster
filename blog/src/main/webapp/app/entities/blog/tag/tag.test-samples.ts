import { ITag, NewTag } from './tag.model';

export const sampleWithRequiredData: ITag = {
  id: 17364,
  name: 'perp loosely into',
};

export const sampleWithPartialData: ITag = {
  id: 30721,
  name: 'improbable whereas mysteriously',
};

export const sampleWithFullData: ITag = {
  id: 28385,
  name: 'unhappy yummy beyond',
};

export const sampleWithNewData: NewTag = {
  name: 'silk eek so',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
