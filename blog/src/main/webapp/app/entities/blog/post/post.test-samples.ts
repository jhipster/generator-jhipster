import { IPost, NewPost } from './post.model';

export const sampleWithRequiredData: IPost = {
  id: 8730,
  title: 'lawful above unless',
};

export const sampleWithPartialData: IPost = {
  id: 28272,
  title: 'unless or supportive',
};

export const sampleWithFullData: IPost = {
  id: 9917,
  title: 'clearly darn icy',
};

export const sampleWithNewData: NewPost = {
  title: 'willfully settler',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
