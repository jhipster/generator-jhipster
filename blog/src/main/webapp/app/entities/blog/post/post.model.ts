import { IBlog } from 'app/entities/blog/blog/blog.model';
import { ITag } from 'app/entities/blog/tag/tag.model';

export interface IPost {
  id: number;
  title?: string | null;
  blog?: Pick<IBlog, 'id' | 'name'> | null;
  tags?: Pick<ITag, 'id' | 'name'>[] | null;
}

export type NewPost = Omit<IPost, 'id'> & { id: null };
