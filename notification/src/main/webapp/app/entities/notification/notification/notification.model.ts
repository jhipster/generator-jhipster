export interface INotification {
  id: number;
  title?: string | null;
}

export type NewNotification = Omit<INotification, 'id'> & { id: null };
