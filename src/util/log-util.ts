export type LogLevelType = 'info' | 'error' | 'warn' | 'debug' | 'off';

const initLevels = (): LogLevelType => {
  if (process.env.LOG_LEVEL) return process.env.LOG_LEVEL as LogLevelType;

  return process.env.NODE_ENV === 'development' ? 'info' : 'error';
};

const level: LogLevelType = initLevels();

/**
 * Log a debug message when debug level or above is enabled
 * @param msg message
 * @param data data
 */
export const logDebug = (msg, ...data): void => {
  // tslint:disable-next-line
  if (level === 'debug') console.debug(msg, data);
};

/**
 * Log an info message when info level or above is enabled
 * @param msg message
 * @param data data
 */
export const logInfo = (msg, ...data): void => {
  // tslint:disable-next-line
  if (['debug', 'info'].includes(level)) console.info(msg, data);
};

/**
 * Log a warn message when warn level or above is enabled
 * @param msg message
 * @param data data
 */
export const logWarn = (msg, ...data): void => {
  if (['debug', 'info', 'warn'].includes(level)) console.warn(msg, data);
};

/**
 * Log an error message when error level is enabled
 * @param msg message
 * @param data data
 */
export const logError = (msg, ...data): void => {
  if (['debug', 'info', 'warn', 'error'].includes(level)) console.error(msg, data);
};

export const log = logInfo;
