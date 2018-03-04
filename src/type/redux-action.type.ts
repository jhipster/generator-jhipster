export interface IPayload {
  type: string;
  payload: Promise<any>;
  meta?: any;
}
export type IPayloadResult = ((dispatch: any) => IPayload | Promise<IPayload>);
export type ICrudGetAction = (id: string | number) => IPayload | ((dispatch: any) => IPayload);
export type ICrudGetAllAction = (page?: number, size?: number, sort?: string) => IPayload | ((dispatch: any) => IPayload);
export type ICrudDeleteAction = (id?: string | number) => IPayload | IPayloadResult;
export type ICrudPutAction = (data?: any) => IPayload | IPayloadResult;
