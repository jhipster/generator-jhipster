import { IProduct, NewProduct } from './product.model';

export const sampleWithRequiredData: IProduct = {
  id: 11737,
  title: 'hm sleepily',
  price: 17510.56,
};

export const sampleWithPartialData: IProduct = {
  id: 14859,
  title: 'weighty log short-term',
  price: 29614.85,
};

export const sampleWithFullData: IProduct = {
  id: 4403,
  title: 'cafe',
  price: 21233.3,
  image: '../fake-data/blob/hipster.png',
  imageContentType: 'unknown',
};

export const sampleWithNewData: NewProduct = {
  title: 'anti inject why',
  price: 26562.23,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
