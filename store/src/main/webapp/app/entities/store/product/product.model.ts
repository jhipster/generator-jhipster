export interface IProduct {
  id: number;
  title?: string | null;
  price?: number | null;
  image?: string | null;
  imageContentType?: string | null;
}

export type NewProduct = Omit<IProduct, 'id'> & { id: null };
