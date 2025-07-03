export class AlertError {
  constructor(
    public message: string,
    public key?: string,
    public params?: Record<string, unknown>,
  ) {}
}
