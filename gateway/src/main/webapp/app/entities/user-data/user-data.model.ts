export interface IUserData {
  id: number;
  address?: string | null;
}

export type NewUserData = Omit<IUserData, 'id'> & { id: null };
