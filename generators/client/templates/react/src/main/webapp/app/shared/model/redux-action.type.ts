export interface IPayload { type: string; payload: Promise<any>; meta?: any; }
export type ICrudGetAction = (id?: string | number) => IPayload | ((dispatch: any) => IPayload);
export type ICrudDeleteAction = (id?: string | number) => IPayload | ((dispatch: any) => IPayload);
export type ICrudPutAction = (data?: any) => IPayload | ((dispatch: any) => IPayload);
