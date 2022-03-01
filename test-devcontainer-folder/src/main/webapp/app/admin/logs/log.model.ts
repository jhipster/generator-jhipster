export type Level = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'OFF';

export interface Logger {
  configuredLevel: Level | null;
  effectiveLevel: Level;
}

export interface LoggersResponse {
  levels: Level[];
  loggers: { [key: string]: Logger };
}

export class Log {
  constructor(public name: string, public level: Level) {}
}
