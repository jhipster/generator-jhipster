const enableLog = process.env.NODE_ENV === 'development';

export const log = (msg, ...data) => {
  // tslint:disable-next-line
  if (enableLog) console.info(msg, data);
};

export const logError = (msg, ...data) => {
  console.error(msg, data);
};
